import React, { useState, useEffect } from 'react';
import { Position, EmploymentType, SeniorityLevel } from '../../types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Check, Trash2 } from 'lucide-react';
import { formatDateForInput } from '../../lib/utils';

interface PositionFormProps {
    initialData?: Position | null;
    onSave: (position: Position) => void;
    onCancel?: () => void;
    onDelete?: (id: number) => void;
    isSaving?: boolean;
}

export function PositionForm({ initialData, onSave, onCancel, onDelete, isSaving = false }: PositionFormProps) {
    const [employerName, setEmployerName] = useState(initialData?.employer_name || '');
    const [jobTitle, setJobTitle] = useState(initialData?.job_title || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [employmentType, setEmploymentType] = useState<EmploymentType>(initialData?.employment_type || EmploymentType.Permanent);
    const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel>(initialData?.seniority_level || SeniorityLevel.Mid);
    const [startDate, setStartDate] = useState(initialData?.start_date ? formatDateForInput(initialData.start_date) : '');
    const [endDate, setEndDate] = useState(initialData?.end_date ? formatDateForInput(initialData.end_date) : '');
    const [responsibilities, setResponsibilities] = useState(initialData?.core_responsibilities || '');

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const position: Position = {
            id: initialData?.id,
            employer_name: employerName,
            job_title: jobTitle,
            employment_type: employmentType,
            location: location,
            start_date: new Date(startDate),
            end_date: endDate ? new Date(endDate) : undefined,
            seniority_level: seniorityLevel,
            core_responsibilities: responsibilities,
            tools_systems_skills: initialData?.tools_systems_skills || [],
            achievements: initialData?.achievements || [],
            created_at: initialData?.created_at || new Date(),
            updated_at: new Date(),
        };

        onSave(position);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Company / Organisation</Label>
                    <Input
                        value={employerName}
                        onChange={(e) => setEmployerName(e.target.value)}
                        placeholder="e.g., BHP, Telstra"
                        required
                    />
                </div>
                <div>
                    <Label>Job Title</Label>
                    <Input
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Software Engineer"
                        required
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Location</Label>
                    <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Sydney, NSW"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Present"
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Employment Type</Label>
                    <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(EmploymentType).map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Level</Label>
                    <Select value={seniorityLevel} onValueChange={(v) => setSeniorityLevel(v as SeniorityLevel)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(SeniorityLevel).map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label>Core Responsibilities</Label>
                <textarea
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    className="w-full mt-1 p-2 border border-border bg-background text-foreground rounded-md"
                    rows={3}
                    placeholder="Describe your key responsibilities..."
                />
            </div>

            <div className="flex justify-between pt-4">
                {onDelete && initialData?.id ? (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this position?')) {
                                onDelete(initialData.id!);
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                ) : (
                    <div /> // Spacer
                )}

                <div className="flex space-x-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Save Position
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
