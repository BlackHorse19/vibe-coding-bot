import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  Calendar,
  MessageSquare,
  Shield
} from "lucide-react";

interface TodayStatusProps {
  compact?: boolean;
}

const TodayStatus = ({ compact = false }: TodayStatusProps) => {
  // Mock data for today's status
  const todaySummary = {
    onLeaveToday: 5,
    returningToday: 3,
    upcomingLeaves: 7
  };

  const todayActivities = [
    {
      id: "1",
      name: "Michael Chen",
      type: "on-leave",
      status: "Sick Leave",
      duration: "3 days",
      department: "Design",
      avatar: "MC"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      type: "returning",
      status: "Returning from Annual Leave",
      duration: "5 days",
      department: "Engineering",
      avatar: "SJ"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      type: "upcoming",
      status: "Annual Leave starting tomorrow",
      duration: "7 days",
      department: "Marketing",
      avatar: "ER"
    },
    {
      id: "4",
      name: "David Kim",
      type: "on-leave",
      status: "Personal Leave",
      duration: "2 days",
      department: "Sales",
      avatar: "DK"
    },
    {
      id: "5",
      name: "Lisa Wang",
      type: "returning",
      status: "Returning from Sick Leave",
      duration: "1 day",
      department: "HR",
      avatar: "LW"
    }
  ];

  const teamCoverage = [
    { department: "Engineering", available: 85, total: 12 },
    { department: "Design", available: 75, total: 8 },
    { department: "Marketing", available: 90, total: 10 },
    { department: "Sales", available: 88, total: 9 },
    { department: "HR", available: 95, total: 6 },
    { department: "Finance", available: 92, total: 7 }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'on-leave': return Users;
      case 'returning': return ArrowLeft;
      case 'upcoming': return ArrowRight;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'on-leave': return 'text-red-600 bg-red-50';
      case 'returning': return 'text-green-600 bg-green-50';
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadgeColor = (type: string) => {
    switch (type) {
      case 'on-leave': return 'bg-red-100 text-red-800';
      case 'returning': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Summary Cards - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{todaySummary.onLeaveToday}</div>
            <div className="text-xs text-red-600">On Leave</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{todaySummary.returningToday}</div>
            <div className="text-xs text-green-600">Returning</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{todaySummary.upcomingLeaves}</div>
            <div className="text-xs text-blue-600">Upcoming</div>
          </div>
        </div>

        {/* Recent Activities - Compact */}
        <div className="space-y-2">
          {todayActivities.slice(0, 3).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{activity.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{activity.name}</p>
                  <p className="text-xs text-slate-600 truncate">{activity.status}</p>
                </div>
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Today's Status</h2>
        <p className="text-slate-600">Real-time team availability and activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="h-5 w-5 mr-2" />
              On Leave Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaySummary.onLeaveToday}</div>
            <p className="text-red-100 text-sm">Employees currently away</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Returning Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaySummary.returningToday}</div>
            <p className="text-green-100 text-sm">Employees coming back</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Upcoming Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaySummary.upcomingLeaves}</div>
            <p className="text-blue-100 text-sm">Starting soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activities */}
      <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Today's Activity Feed</CardTitle>
          <CardDescription>Real-time status updates for your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">{activity.name}</h4>
                      <Badge variant="outline">{activity.department}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{activity.status}</p>
                    <p className="text-xs text-slate-500">{activity.duration}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {activity.type === 'on-leave' && (
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      View Coverage
                    </Button>
                  )}
                  {activity.type === 'returning' && (
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Send Welcome
                    </Button>
                  )}
                  {activity.type === 'upcoming' && (
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Team Coverage Status */}
      <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Team Coverage Status</CardTitle>
          <CardDescription>Department availability percentages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamCoverage.map((dept) => {
            const availableCount = Math.round((dept.available / 100) * dept.total);
            const onLeaveCount = dept.total - availableCount;
            
            return (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-slate-900">{dept.department}</h4>
                    <Badge variant="outline">{dept.total} total</Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-green-600">{availableCount} available</span>
                    {onLeaveCount > 0 && (
                      <span className="text-red-600 ml-2">• {onLeaveCount} on leave</span>
                    )}
                  </div>
                </div>
                <Progress 
                  value={dept.available} 
                  className="h-2"
                />
                <div className="text-right text-sm font-medium text-slate-700">
                  {dept.available}% available
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default TodayStatus;
