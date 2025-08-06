import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckSquare, 
  Bell, 
  Download, 
  UserPlus, 
  Settings, 
  FileText,
  Calendar,
  Mail,
  Zap,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuickActions = () => {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Mock statistics
  const actionStats = {
    completedToday: 23,
    approvedThisWeek: 156,
    pendingReviews: 4,
    teamAvailability: 89
  };

  const handleAction = async (actionId: string, actionName: string) => {
    setLoadingStates(prev => ({ ...prev, [actionId]: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoadingStates(prev => ({ ...prev, [actionId]: false }));
    
    toast({
      title: "Action Completed",
      description: `${actionName} has been successfully executed.`,
    });
  };

  const urgentActions = [
    {
      id: "bulk-approve",
      title: "Bulk Approve Pending Requests",
      description: "4 leave requests awaiting approval",
      icon: CheckSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      urgent: true
    },
    {
      id: "send-notifications",
      title: "Send Urgent Notifications",
      description: "12 pending notifications to team",
      icon: Bell,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      urgent: true
    }
  ];

  const regularActions = [
    {
      id: "export-reports",
      title: "Export Monthly Reports",
      description: "Generate comprehensive leave reports",
      icon: Download,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      urgent: false
    },
    {
      id: "add-employee",
      title: "Add New Employee",
      description: "Register new team member",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
      urgent: false
    },
    {
      id: "system-settings",
      title: "System Settings",
      description: "Configure leave policies and rules",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      urgent: false
    },
    {
      id: "custom-reports",
      title: "Generate Custom Reports",
      description: "Create tailored analytics reports",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      urgent: false
    },
    {
      id: "holiday-calendar",
      title: "Manage Holiday Calendar",
      description: "Update company holidays and events",
      icon: Calendar,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      urgent: false
    },
    {
      id: "email-templates",
      title: "Customize Email Templates",
      description: "Update notification templates",
      icon: Mail,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      urgent: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Quick Actions Center</h2>
        <p className="text-slate-600">Administrative tools and bulk operations</p>
      </div>

      {/* Action Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Actions Completed Today</p>
                <p className="text-2xl font-bold text-slate-900">{actionStats.completedToday}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved This Week</p>
                <p className="text-2xl font-bold text-slate-900">{actionStats.approvedThisWeek}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-slate-900">{actionStats.pendingReviews}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Team Availability</p>
                <p className="text-2xl font-bold text-slate-900">{actionStats.teamAvailability}%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions */}
      <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm border-l-4 border-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-orange-600">Urgent Actions</CardTitle>
              <CardDescription>Actions requiring immediate attention</CardDescription>
            </div>
            <Badge className="bg-orange-100 text-orange-800">Priority</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {urgentActions.map((action) => (
            <Alert key={action.id} className="border-orange-200 bg-orange-50/50">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${action.bgColor}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{action.title}</h4>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAction(action.id, action.title)}
                    disabled={loadingStates[action.id]}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {loadingStates[action.id] ? "Processing..." : "Execute"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Regular Administrative Actions */}
      <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Administrative Tools</CardTitle>
          <CardDescription>Regular management and configuration actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularActions.map((action) => (
              <Card key={action.id} className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-full ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{action.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(action.id, action.title)}
                    disabled={loadingStates[action.id]}
                    className="w-full"
                  >
                    {loadingStates[action.id] ? "Processing..." : "Start"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Alert className="border-green-200 bg-green-50">
        <CheckSquare className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          All critical actions are up to date. Your leave management system is running smoothly.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QuickActions;
