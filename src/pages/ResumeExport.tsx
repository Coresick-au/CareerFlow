import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import type { ResumeExport as ResumeExportType, ResumePosition } from '../types';
import { Download, FileText, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

type ResumeType = 'ats' | 'technical' | 'executive' | 'project' | 'summary';

export function ResumeExport() {
  const [selectedType, setSelectedType] = useState<ResumeType>('ats');
  const [copied, setCopied] = useState(false);

  const { data: resumeData, isLoading } = useQuery({
    queryKey: ['resumeExport'],
    queryFn: () => invoke<ResumeExportType>('generate_resume_export'),
  });

  const handleDownloadJSON = () => {
    if (!resumeData) return;
    
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'career_profile.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyPrompt = async () => {
    if (!resumeData) return;
    
    const prompt = generateChatGPTPrompt(resumeData, selectedType);
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateChatGPTPrompt = (data: ResumeExportType, type: ResumeType): string => {
    const typeDescriptions = {
      ats: "ATS-optimized resume that will pass automated screening systems",
      technical: "Technical/engineering resume highlighting skills and project experience",
      executive: "Executive-level resume emphasizing leadership and strategic impact",
      project: "Project-based resume focusing on deliverables and outcomes",
      summary: "Compact one-page resume summary",
    };

    return `Use this career profile data as the single source of truth to generate a ${typeDescriptions[type]} for the Australian market.

Career Profile JSON:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Requirements:
1. Use only the data provided above - do not invent or assume information
2. Highlight achievements with quantifiable metrics where available
3. Format for Australian standards (no photos, no personal info like age/marital status)
4. Emphasize the progression and growth shown in the career timeline
5. Include relevant skills and tools from each position
6. Ask clarifying questions if any critical information is missing

Target format: ${type.toUpperCase()}
Target region: Australia
Focus on: ${data.profile_summary.industry} industry, ${data.profile_summary.seniority_level} level

Please generate the resume content now.`;
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

  if (!resumeData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2" />
          <p>No career data available</p>
          <p className="text-sm">Add your career history first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resume Export</h1>
        <p className="text-gray-600">Generate structured exports for ChatGPT-powered resume creation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Resume Type</label>
              <Select value={selectedType} onValueChange={(value: ResumeType) => setSelectedType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ats">ATS-Optimized</SelectItem>
                  <SelectItem value="technical">Technical/Engineering</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="project">Project-Based</SelectItem>
                  <SelectItem value="summary">One-Page Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Button onClick={handleDownloadJSON} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download career_profile.json
              </Button>
              
              <Button onClick={handleCopyPrompt} variant="outline" className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy ChatGPT Prompt
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">How to use:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Download the JSON file</li>
                <li>Copy the ChatGPT prompt</li>
                <li>Paste both into ChatGPT</li>
                <li>Review and customize the output</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="font-medium">{resumeData.profile_summary.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Experience:</span>
                <span className="font-medium">{resumeData.profile_summary.experience_years.toFixed(1)} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Level:</span>
                <Badge variant="secondary">{resumeData.profile_summary.seniority_level}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Industry:</span>
                <span className="font-medium">{resumeData.profile_summary.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Positions:</span>
                <span className="font-medium">{resumeData.career_timeline.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Skills:</span>
                <span className="font-medium">{resumeData.skills_and_tools.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Timeline Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Career Timeline Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumeData.career_timeline.slice(0, 3).map((position: ResumePosition, index: number) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{position.title}</h3>
                    <p className="text-sm text-gray-600">{position.employer}</p>
                    <p className="text-xs text-gray-500">{position.duration}</p>
                  </div>
                  <Badge variant="outline">{position.skills_used.length} skills</Badge>
                </div>
              </div>
            ))}
            {resumeData.career_timeline.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                ... and {resumeData.career_timeline.length - 3} more positions
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li>• The JSON file contains your complete career history - keep it secure</li>
            <li>• Always review AI-generated resumes for accuracy</li>
            <li>• Customize the output for specific job applications</li>
            <li>• Remove sensitive company information if needed</li>
            <li>• Focus on achievements and quantifiable results</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
