import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatInterface } from "@/components/ChatInterface";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ComprehensiveDashboard from "@/components/ComprehensiveDashboard";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  BarChart3, 
  LogOut
} from "lucide-react";
import { employeeDataService } from "@/lib/data";

const Dashboard = () => {
  const { currentAdmin, logout } = useAuth();
  const [activeView, setActiveView] = useState<"chat" | "dashboard">("chat");
  const [dashboardKey, setDashboardKey] = useState(0);
  const [overviewStats, setOverviewStats] = useState({
    totalRequests: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
    teamAvailability: 0
  });

  // Load real statistics from employee data
  useEffect(() => {
    const loadStats = async () => {
      try {
        await employeeDataService.loadEmployeeData();
        await employeeDataService.loadLeaveApplications();
        
        const allApplications = employeeDataService.getAllLeaveApplications();
        const pendingApplications = employeeDataService.getLeaveApplicationsByStatus('Pending');
        const approvedApplications = allApplications.filter(app => 
          app.Status === 'Approved' && 
          new Date(app.Application_Date).getMonth() === new Date().getMonth()
        );
        
        const teamStats = employeeDataService.getTeamStats();
        const availabilityPercentage = Math.round(
          ((teamStats.avgSickLeave + teamStats.avgCasualLeave + teamStats.avgEarnedLeave) / 30) * 100
        );

        setOverviewStats({
          totalRequests: allApplications.length,
          pendingApprovals: pendingApplications.length,
          approvedThisMonth: approvedApplications.length,
          teamAvailability: Math.min(availabilityPercentage, 100)
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Fallback to default values
        setOverviewStats({
          totalRequests: 0,
          pendingApprovals: 0,
          approvedThisMonth: 0,
          teamAvailability: 85
        });
      }
    };

    loadStats();
  }, []);

  const handleLogout = () => {
    logout();
    setActiveView("chat");
  };

  const switchToDashboard = () => {
    setActiveView("dashboard");
    // Force dashboard refresh by changing key
    setDashboardKey(prev => prev + 1);
    console.log('🔄 Switching to dashboard - triggering refresh');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  OneLeave Manager
                </h1>
                <p className="text-sm text-slate-600">Enterprise Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Navigation Buttons */}
              <Button
                variant={activeView === "chat" ? "default" : "ghost"}
                onClick={() => setActiveView("chat")}
                className="rounded-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat Assistant
              </Button>
              
              <Button
                variant={activeView === "dashboard" ? "default" : "ghost"}
                onClick={switchToDashboard}
                className="rounded-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>

              {/* User Info & Logout */}
              {currentAdmin && (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-slate-200">
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">Welcome, {currentAdmin.name}</div>
                    <div className="text-slate-500">Administrator</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeView === "chat" ? (
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <ChatInterface />
            </div>
          </div>
        ) : (
          <ProtectedRoute>
            <ComprehensiveDashboard key={dashboardKey} />
          </ProtectedRoute>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
