
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

const ResumeList = () => {
  const [resumes, setResumes] = useState<ParsedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/get-resumes');
      const data = await response.json();
      setResumes(data.resumes || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchResumeContent = async (id: string) => {
    setLoadingContent(true);
    try {
      const response = await fetch(`http://localhost:3001/api/get-resume/${id}`);
      const data = await response.json();
      if (data.resume) {
        setResumeContent(data.resume.extractedText);
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

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading resumes...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Parsed Resumes ({resumes.length})
        </CardTitle>
        <CardDescription>
          View and manage extracted resume content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No resumes uploaded yet</p>
            <p className="text-sm text-muted-foreground">Upload a resume to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">{resume.fileName}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(resume.parsedAt)}
                        <Badge variant="secondary">{resume.fileType.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog onOpenChange={(open) => {
                      if (open) handleViewResume(resume.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
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
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadResume(resume)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeList;
