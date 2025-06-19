
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Code, 
  Database, 
  Server, 
  Cloud, 
  Settings, 
  FileText, 
  CheckCircle,
  Star,
  Users,
  Trophy,
  ArrowRight
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const techStacks = [
    { name: "Data Structures & Algorithms", icon: Code, color: "bg-blue-500" },
    { name: "Database Management", icon: Database, color: "bg-green-500" },
    { name: "Operating Systems", icon: Server, color: "bg-purple-500" },
    { name: "Cloud Computing", icon: Cloud, color: "bg-cyan-500" },
    { name: "Object Oriented Programming", icon: Settings, color: "bg-orange-500" },
    { name: "Computer Networks", icon: Brain, color: "bg-red-500" },
  ];

  const features = [
    {
      title: "Tech Stack Based Questions",
      description: "Choose from 6+ technical domains with curated questions",
      icon: Code,
      type: "FREE"
    },
    {
      title: "Resume-Based Personalization",
      description: "AI analyzes your resume to generate custom questions",
      icon: FileText,
      type: "PREMIUM"
    },
    {
      title: "Real-time AI Feedback",
      description: "Get instant analysis on technical depth and accuracy",
      icon: Brain,
      type: "PREMIUM"
    },
    {
      title: "Interview Simulation",
      description: "Practice with MCQs and detailed technical explanations",
      icon: Trophy,
      type: "FREE"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TechInterview Pro</h1>
                <p className="text-sm text-gray-600">Master Technical Interviews</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/simulator')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Start Practice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              AI-Powered Interview Preparation
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ace Your Next
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Technical Interview
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Practice with real interview questions, get AI-powered feedback, and boost your confidence with our comprehensive technical interview simulator.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg"
              onClick={() => navigate('/simulator')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
            >
              Start Free Practice
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg"
            >
              <Star className="mr-2 h-5 w-5" />
              View Premium Features
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">10K+</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </div>
        </div>

        {/* Tech Stacks Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Tech Stack</h3>
            <p className="text-lg text-gray-600">Practice questions tailored to specific technical domains</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStacks.map((stack, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1"
                onClick={() => navigate('/simulator')}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`${stack.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <stack.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{stack.name}</CardTitle>
                  <CardDescription className="text-sm">
                    Master the fundamentals with curated questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>50+ Questions Available</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TechInterview Pro?</h3>
            <p className="text-lg text-gray-600">Everything you need to succeed in technical interviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="mt-1">{feature.description}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={feature.type === 'FREE' ? 'default' : 'secondary'}
                      className={feature.type === 'FREE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                    >
                      {feature.type}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl mb-8 opacity-90">Join thousands of successful candidates who aced their technical interviews</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/simulator')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Start Free Practice
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">TechInterview Pro</span>
          </div>
          <p className="text-gray-400">
            Empowering developers to excel in technical interviews
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
