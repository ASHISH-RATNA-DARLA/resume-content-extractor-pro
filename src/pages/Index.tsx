
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Database, ArrowRight, Briefcase } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Briefcase className="h-16 w-16 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SDE-HIRE
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Advanced resume parsing and candidate management system for software engineering recruitment
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/resume-parser')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            Start Parsing Resumes
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-xl">Easy Upload</CardTitle>
              <CardDescription>
                Drag and drop PDF or DOCX resumes for instant processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Support for PDF and DOCX formats</li>
                <li>• Drag and drop interface</li>
                <li>• File validation and error handling</li>
                <li>• Progress tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-xl">Smart Extraction</CardTitle>
              <CardDescription>
                AI-powered text extraction with high accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Advanced PDF parsing</li>
                <li>• Clean DOCX text extraction</li>
                <li>• Preserve formatting context</li>
                <li>• Error-free processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <Database className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle className="text-xl">Structured Storage</CardTitle>
              <CardDescription>
                Organized JSON storage for easy data management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• JSON format for flexibility</li>
                <li>• Metadata preservation</li>
                <li>• Easy export and sharing</li>
                <li>• Search and filter options</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your hiring process?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Upload your first resume and experience the power of automated parsing
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/resume-parser')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
