import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import type { UserProfile as UserProfileType } from '../types';
import { AustralianState, Qualification, EmploymentType } from '../types';
import { Save, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function UserProfile() {
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => invoke<UserProfileType>('get_user_profile'),
  });

  const saveProfileMutation = useMutation({
    mutationFn: (profile: UserProfileType) => invoke('save_user_profile', { profile }),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedProfile: UserProfileType = {
      id: profile?.id,
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      date_of_birth: new Date(formData.get('dateOfBirth') as string),
      state: formData.get('state') as AustralianState,
      industry: formData.get('industry') as string,
      highest_qualification: formData.get('qualification') as Qualification,
      career_preferences: {
        employment_type_preference: formData.get('employmentType') as EmploymentType,
        fifo_tolerance: formData.get('fifoTolerance') as any,
        travel_tolerance: formData.get('travelTolerance') as any,
        overtime_appetite: formData.get('overtimeAppetite') as any,
        privacy_acknowledged: formData.get('privacy') === 'on',
        disclaimer_acknowledged: formData.get('disclaimer') === 'on',
      },
      created_at: profile?.created_at || new Date(),
      updated_at: new Date(),
    };

    saveProfileMutation.mutate(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

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
                    name="firstName"
                    defaultValue={profile?.first_name}
                    required
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    name="lastName"
                    defaultValue={profile?.last_name}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input
                  name="dateOfBirth"
                  type="date"
                  defaultValue={profile?.date_of_birth.toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label>State/Territory</Label>
                <Select name="state" defaultValue={profile?.state}>
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
                  name="industry"
                  defaultValue={profile?.industry}
                  placeholder="e.g., Information Technology, Construction, Healthcare"
                  required
                />
              </div>

              <div>
                <Label>Highest Qualification</Label>
                <Select name="qualification" defaultValue={profile?.highest_qualification}>
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
                <Select name="employmentType" defaultValue={profile?.career_preferences.employment_type_preference}>
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
                <Select name="fifoTolerance" defaultValue={profile?.career_preferences.fifo_tolerance}>
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
                <Select name="travelTolerance" defaultValue={profile?.career_preferences.travel_tolerance}>
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
                <Select name="overtimeAppetite" defaultValue={profile?.career_preferences.overtime_appetite}>
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
                    name="privacy"
                    type="checkbox"
                    defaultChecked={profile?.career_preferences.privacy_acknowledged}
                  />
                  <span className="text-sm">I acknowledge the privacy policy</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    name="disclaimer"
                    type="checkbox"
                    defaultChecked={profile?.career_preferences.disclaimer_acknowledged}
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
