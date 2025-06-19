
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResumeUpload from '@/components/ResumeUpload';
import ResumeList from '@/components/ResumeList';
import { Upload, Brain, Briefcase } from 'lucide-react';

const ResumeParser = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personalized Technical Interview Questions
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload your resume and get customized technical interview questions based on your skills, experience, and background
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Resume
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Your Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <ResumeUpload />
            <div className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                  <Upload className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Upload Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Support for PDF and DOCX resume formats
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                  <Brain className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Extract skills, experience, and tech stack
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                  <Briefcase className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Custom Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate targeted interview questions
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <ResumeList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResumeParser;
