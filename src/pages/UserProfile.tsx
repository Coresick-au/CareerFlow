import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import type { UserProfile as UserProfileType } from '../types';
import { AustralianState, Qualification, EmploymentType, DEFAULT_PROFILE } from '../types';
import { Save, User, Database, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function UserProfile() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UserProfileType | null>(null);
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => invoke<UserProfileType>('get_user_profile'),
  });

  useEffect(() => {
    if (profile && !formData) {
      setFormData(profile);
    }
  }, [profile, formData]);

  const loadSampleDataMutation = useMutation({
    mutationFn: () => invoke('load_sample_data'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
      alert('Sample data loaded successfully!');
    },
  });

  const clearDataMutation = useMutation({
    mutationFn: () => invoke('clear_all_data'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
      alert('All data cleared successfully!');
    },
  });

  // Use the actual profile if it exists, otherwise use defaults
  const safeProfile: UserProfileType = formData || profile || {
    ...DEFAULT_PROFILE,
    id: undefined,
    created_at: new Date(),
    updated_at: new Date(),
  } as UserProfileType;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleCareerPreferenceChange = (field: string, value: any) => {
    setFormData(prev => prev ? {
      ...prev,
      career_preferences: {
        ...prev.career_preferences,
        [field]: value
      }
    } : null);
  };

  const saveProfileMutation = useMutation({
    mutationFn: (profile: UserProfileType) => invoke('save_user_profile', { profile }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      alert('Profile saved successfully!');
    },
    onError: (error) => {
      alert('Failed to save profile. Please try again.');
      console.error('Save profile error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData) {
      alert('No data to save');
      return;
    }

    const updatedProfile: UserProfileType = {
      ...formData,
      updated_at: new Date(),
    };

    saveProfileMutation.mutate(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      {/* Sample Data Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Test Data Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Load realistic sample data to test the application, or clear all data to start fresh.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => loadSampleDataMutation.mutate()}
              disabled={loadSampleDataMutation.isPending}
            >
              <Database className="w-4 h-4 mr-2" />
              {loadSampleDataMutation.isPending ? 'Loading...' : 'Load Sample Data'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearDataMutation.mutate()}
              disabled={clearDataMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {clearDataMutation.isPending ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={safeProfile.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={safeProfile.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={safeProfile.date_of_birth ? safeProfile.date_of_birth.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('date_of_birth', new Date(e.target.value))}
                  required
                />
              </div>

              <div>
                <Label>State/Territory</Label>
                <Select value={safeProfile.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AustralianState.NSW}>New South Wales</SelectItem>
                    <SelectItem value={AustralianState.VIC}>Victoria</SelectItem>
                    <SelectItem value={AustralianState.QLD}>Queensland</SelectItem>
                    <SelectItem value={AustralianState.WA}>Western Australia</SelectItem>
                    <SelectItem value={AustralianState.SA}>South Australia</SelectItem>
                    <SelectItem value={AustralianState.TAS}>Tasmania</SelectItem>
                    <SelectItem value={AustralianState.ACT}>Australian Capital Territory</SelectItem>
                    <SelectItem value={AustralianState.NT}>Northern Territory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Industry</Label>
                <Input
                  value={safeProfile.industry || ''}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Information Technology, Construction, Healthcare"
                  required
                />
              </div>

              <div>
                <Label>Highest Qualification</Label>
                <Select value={safeProfile.highest_qualification} onValueChange={(value) => handleInputChange('highest_qualification', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Qualification.HighSchool}>High School</SelectItem>
                    <SelectItem value={Qualification.Certificate}>Certificate</SelectItem>
                    <SelectItem value={Qualification.Diploma}>Diploma</SelectItem>
                    <SelectItem value={Qualification.Bachelor}>Bachelor Degree</SelectItem>
                    <SelectItem value={Qualification.GraduateCertificate}>Graduate Certificate</SelectItem>
                    <SelectItem value={Qualification.GraduateDiploma}>Graduate Diploma</SelectItem>
                    <SelectItem value={Qualification.Masters}>Masters Degree</SelectItem>
                    <SelectItem value={Qualification.PhD}>PhD</SelectItem>
                    <SelectItem value={Qualification.Other}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Career Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Career Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preferred Employment Type</Label>
                <Select value={safeProfile.career_preferences.employment_type_preference} onValueChange={(value) => handleCareerPreferenceChange('employment_type_preference', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EmploymentType.Permanent}>Permanent</SelectItem>
                    <SelectItem value={EmploymentType.Contract}>Contract</SelectItem>
                    <SelectItem value={EmploymentType.Casual}>Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>FIFO Tolerance</Label>
                <Select value={safeProfile.career_preferences.fifo_tolerance} onValueChange={(value) => handleCareerPreferenceChange('fifo_tolerance', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">Not willing</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Extensive">Extensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Travel Tolerance</Label>
                <Select value={safeProfile.career_preferences.travel_tolerance} onValueChange={(value) => handleCareerPreferenceChange('travel_tolerance', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">No travel</SelectItem>
                    <SelectItem value="Local">Local only</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Overtime Appetite</Label>
                <Select value={safeProfile.career_preferences.overtime_appetite} onValueChange={(value) => handleCareerPreferenceChange('overtime_appetite', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">No overtime</SelectItem>
                    <SelectItem value="Minimal">Minimal</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={safeProfile.career_preferences.privacy_acknowledged}
                    onChange={(e) => handleCareerPreferenceChange('privacy_acknowledged', e.target.checked)}
                  />
                  <span className="text-sm">I acknowledge the privacy policy</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={safeProfile.career_preferences.disclaimer_acknowledged}
                    onChange={(e) => handleCareerPreferenceChange('disclaimer_acknowledged', e.target.checked)}
                  />
                  <span className="text-sm">I understand this is not financial advice</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saveProfileMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
