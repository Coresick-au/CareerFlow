import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import { Position, SeniorityLevel, EmploymentType } from '../types';
import { Plus, Edit, Trash2, Briefcase, MapPin, Calendar, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { formatDateAU, formatDuration } from '../lib/utils';

export function CareerTimeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: () => invoke<Position[]>('get_positions'),
  });

  const loadSampleDataMutation = useMutation({
    mutationFn: () => invoke('load_sample_data'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['earningsAnalysis'] });
    },
  });

  const clearDataMutation = useMutation({
    mutationFn: () => invoke('clear_all_data'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['earningsAnalysis'] });
      setClearConfirmOpen(false);
    },
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
      setDeleteConfirmOpen(false);
      setPositionToDelete(null);
    },
  });

  const handleDeletePosition = (id: number) => {
    setPositionToDelete(id);
    setDeleteConfirmOpen(true);
  };

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Career Timeline</h1>
          <p className="text-muted-foreground">Your professional journey and achievements</p>
        </div>
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
            variant="outline"
            onClick={() => setClearConfirmOpen(true)}
            disabled={clearDataMutation.isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={handleAddPosition}>
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {positions.map((position) => (
          <Card key={position.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">{position.job_title}</h3>
                    <Badge variant="secondary">{position.seniority_level}</Badge>
                    <Badge variant="outline">{position.employment_type}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDateAU(position.start_date)} - {position.end_date ? formatDateAU(position.end_date) : 'Present'}
                      <span className="text-muted-foreground">({formatDuration(position.start_date, position.end_date)})</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-foreground mb-1">Responsibilities</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{position.core_responsibilities}</p>
                  </div>

                  {position.tools_systems_skills?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-foreground mb-1">Skills & Tools</p>
                      <div className="flex flex-wrap gap-1">
                        {position.tools_systems_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {position.achievements?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Key Achievements</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
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
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeletePosition(position.id!)}
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
              <div className="text-center text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
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
                <Label>Company / Organisation</Label>
                <Input
                  name="employerName"
                  defaultValue={editingPosition?.employer_name}
                  placeholder="e.g., BHP, Telstra, Local Council"
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
                  placeholder="e.g., Sydney, NSW or Remote"
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
                className="w-full mt-1 p-2 border border-border bg-background text-foreground rounded-md"
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
                className="w-full mt-1 p-2 border border-border bg-background text-foreground rounded-md"
                rows={4}
                defaultValue={editingPosition?.achievements.join('\n')}
                placeholder="List achievements with metrics, e.g.:\n• Reduced processing time by 40%\n• Led team of 5 engineers\n• Delivered $2M project on time"
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

      {/* Clear All Data Confirmation */}
      <ConfirmationDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Clear All Data"
        description="This will permanently delete all your career data, including positions, compensation records, and profile information."
        confirmPhrase="DELETE ALL"
        confirmButtonText="Clear All Data"
        onConfirm={() => clearDataMutation.mutate()}
        isLoading={clearDataMutation.isPending}
      />

      {/* Delete Position Confirmation */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Position"
        description="This will permanently delete this position and all associated compensation records."
        confirmPhrase="DELETE"
        confirmButtonText="Delete Position"
        onConfirm={() => positionToDelete && deletePositionMutation.mutate(positionToDelete)}
        isLoading={deletePositionMutation.isPending}
      />
    </div>
  );
}
