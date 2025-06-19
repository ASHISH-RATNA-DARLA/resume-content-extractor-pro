
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Download, Eye, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ParsedResume {
  id: string;
  fileName: string;
  extractedText: string;
  parsedAt: string;
  fileType: string;
}

interface ResumeListProps {
  resumes: ParsedResume[];
}

const ResumeList: React.FC<ResumeListProps> = ({ resumes }) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  
  const fetchResumeContent = (id: string) => {
    setLoadingContent(true);
    try {
      const resume = resumes.find(r => r.id === id);
      if (resume) {
        setResumeContent(resume.extractedText);
      }
    } catch (error) {
      console.error('Error fetching resume content:', error);
    } finally {
      setLoadingContent(false);
    }
  };
  
  const handleViewResume = (id: string) => {
    setSelectedResumeId(id);
    fetchResumeContent(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadResume = (resume: ParsedResume) => {
    const dataStr = JSON.stringify(resume, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resume.fileName}_extracted.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {resumes.length === 0 ? (
        <div className="text-center py-4">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No resumes uploaded yet</p>
          <p className="text-xs text-muted-foreground">Upload a resume to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-medium text-sm">{resume.fileName}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(resume.parsedAt)}
                      <Badge variant="secondary" className="text-xs">{resume.fileType.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Dialog onOpenChange={(open) => {
                    if (open) handleViewResume(resume.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{resume.fileName}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] w-full">
                        {loadingContent && selectedResumeId === resume.id ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Loading content...</span>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap text-sm p-4 bg-muted rounded">
                            {selectedResumeId === resume.id ? resumeContent : ''}
                          </pre>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => downloadResume(resume)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeList;
