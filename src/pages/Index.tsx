import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { LeaveBalance } from "@/components/LeaveBalance";
import { RecentActivity } from "@/components/RecentActivity";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { employeeDataService } from "@/lib/data";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard">("chat");

  const mockLeaveData = {
    annualLeave: { used: 8, total: 20 },
    sickLeave: { used: 2, total: 10 },
    personalLeave: { used: 2, total: 5 }
  };

  // Get team stats for dashboard
  const teamStats = employeeDataService.getTeamStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Leave Manager</h1>
                <p className="text-sm text-muted-foreground">AI-powered leave management</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === "chat" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("chat")}
                className="rounded-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("dashboard")}
                className="rounded-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "chat" ? (
          <div className="flex justify-center">
            <ChatInterface />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <LeaveBalance {...mockLeaveData} />
              <RecentActivity />
            </div>
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-primary">{teamStats.totalEmployees}</div>
                  <div className="text-sm text-muted-foreground">Total Employees</div>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-success">{teamStats.avgSickLeave}</div>
                  <div className="text-sm text-muted-foreground">Avg Sick Leave</div>
                </div>
              </div>

              {/* Team Calendar Preview */}
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-4">Team Calendar</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">John Smith</p>
                        <p className="text-xs text-muted-foreground">Dec 20-22</p>
                      </div>
                    </div>
                    <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded">
                      Annual
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center">
                        <User className="h-4 w-4 text-success-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Sarah Johnson</p>
                        <p className="text-xs text-muted-foreground">Dec 18</p>
                      </div>
                    </div>
                    <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                      Sick
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
