import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import { Position, SeniorityLevel, EmploymentType } from '../types';
import { Plus, Edit, Trash2, Briefcase, MapPin, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export function CareerTimeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const queryClient = useQueryClient();

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: () => invoke<Position[]>('get_positions'),
  });

  const savePositionMutation = useMutation({
    mutationFn: (position: Position) => invoke<number>('save_position', { position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setDialogOpen(false);
      setEditingPosition(null);
    },
  });

  const deletePositionMutation = useMutation({
    mutationFn: (id: number) => invoke('delete_position', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });

  const handleAddPosition = () => {
    setEditingPosition(null);
    setDialogOpen(true);
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const position: Position = {
      id: editingPosition?.id,
      employer_name: formData.get('employerName') as string,
      job_title: formData.get('jobTitle') as string,
      employment_type: formData.get('employmentType') as EmploymentType,
      location: formData.get('location') as string,
      start_date: new Date(formData.get('startDate') as string),
      end_date: (formData.get('endDate') as string) ? new Date(formData.get('endDate') as string) : undefined,
      seniority_level: formData.get('seniorityLevel') as SeniorityLevel,
      core_responsibilities: formData.get('responsibilities') as string,
      tools_systems_skills: (formData.get('tools') as string).split(',').map(s => s.trim()).filter(s => s),
      achievements: (formData.get('achievements') as string).split('\n').map(s => s.trim()).filter(s => s),
      created_at: editingPosition?.created_at || new Date(),
      updated_at: new Date(),
    };

    savePositionMutation.mutate(position);
  };

  const formatDuration = (start: Date, end?: Date) => {
    const months = (end?.getFullYear() || new Date().getFullYear() - start.getFullYear()) * 12 + 
                   ((end?.getMonth() || new Date().getMonth()) - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
    }
    return `${remainingMonths}m`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Timeline</h1>
          <p className="text-gray-600">Your professional journey and achievements</p>
        </div>
        <Button onClick={handleAddPosition}>
          <Plus className="w-4 h-4 mr-2" />
          Add Position
        </Button>
      </div>

      <div className="space-y-4">
        {positions.map((position) => (
          <Card key={position.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-lg">{position.job_title}</h3>
                    <Badge variant="secondary">{position.seniority_level}</Badge>
                    <Badge variant="outline">{position.employment_type}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {position.start_date.toLocaleDateString()} - {position.end_date?.toLocaleDateString() || 'Present'}
                      <span className="text-gray-400">({formatDuration(position.start_date, position.end_date)})</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Responsibilities</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{position.core_responsibilities}</p>
                  </div>

                  {position.tools_systems_skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Skills & Tools</p>
                      <div className="flex flex-wrap gap-1">
                        {position.tools_systems_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {position.achievements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Key Achievements</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {position.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPosition(position)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this position?')) {
                        deletePositionMutation.mutate(position.id!);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {positions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-2" />
                <p>No positions added yet</p>
                <p className="text-sm">Start building your career timeline</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Position Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? 'Edit' : 'Add'} Position
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employer Name</Label>
                <Input
                  name="employerName"
                  defaultValue={editingPosition?.employer_name}
                  required
                />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input
                  name="jobTitle"
                  defaultValue={editingPosition?.job_title}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Employment Type</Label>
                <Select name="employmentType" defaultValue={editingPosition?.employment_type}>
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
                <Label>Seniority Level</Label>
                <Select name="seniorityLevel" defaultValue={editingPosition?.seniority_level}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SeniorityLevel.Entry}>Entry</SelectItem>
                    <SelectItem value={SeniorityLevel.Junior}>Junior</SelectItem>
                    <SelectItem value={SeniorityLevel.Mid}>Mid</SelectItem>
                    <SelectItem value={SeniorityLevel.Senior}>Senior</SelectItem>
                    <SelectItem value={SeniorityLevel.Lead}>Lead</SelectItem>
                    <SelectItem value={SeniorityLevel.Manager}>Manager</SelectItem>
                    <SelectItem value={SeniorityLevel.Director}>Director</SelectItem>
                    <SelectItem value={SeniorityLevel.Executive}>Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  defaultValue={editingPosition?.location}
                  placeholder="City, State"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  name="startDate"
                  type="date"
                  defaultValue={editingPosition?.start_date.toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  name="endDate"
                  type="date"
                  defaultValue={editingPosition?.end_date?.toISOString().split('T')[0]}
                  placeholder="Leave empty if current"
                />
              </div>
            </div>

            <div>
              <Label>Core Responsibilities</Label>
              <textarea
                name="responsibilities"
                className="w-full mt-1 p-2 border rounded-md"
                rows={4}
                defaultValue={editingPosition?.core_responsibilities}
                placeholder="Describe your key responsibilities..."
                required
              />
            </div>

            <div>
              <Label>Skills & Tools (comma-separated)</Label>
              <Input
                name="tools"
                defaultValue={editingPosition?.tools_systems_skills.join(', ')}
                placeholder="e.g., React, TypeScript, AWS, Agile"
              />
            </div>

            <div>
              <Label>Key Achievements (one per line)</Label>
              <textarea
                name="achievements"
                className="w-full mt-1 p-2 border rounded-md"
                rows={4}
                defaultValue={editingPosition?.achievements.join('\n')}
                placeholder="List your key achievements with metrics where possible..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savePositionMutation.isPending}>
                {savePositionMutation.isPending ? 'Saving...' : 'Save Position'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
