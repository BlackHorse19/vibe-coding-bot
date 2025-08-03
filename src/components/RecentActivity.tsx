import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "leave_applied" | "leave_approved" | "leave_rejected" | "leave_cancelled";
  description: string;
  date: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "leave_applied",
    description: "Annual leave application for Dec 23-27",
    date: "2 hours ago",
    status: "pending"
  },
  {
    id: "2",
    type: "leave_approved",
    description: "Sick leave approved for Nov 15",
    date: "1 day ago",
    status: "approved"
  },
  {
    id: "3",
    type: "leave_applied",
    description: "Personal leave for Dec 30",
    date: "3 days ago",
    status: "pending"
  }
];

export const RecentActivity = () => {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "leave_applied":
        return <Calendar className="h-4 w-4" />;
      case "leave_approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "leave_rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "leave_cancelled":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ActivityItem["status"]) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      cancelled: "outline"
    } as const;

    const colors = {
      pending: "bg-warning text-warning-foreground",
      approved: "bg-success text-success-foreground",
      rejected: "bg-destructive text-destructive-foreground",
      cancelled: "bg-muted text-muted-foreground"
    };

    return (
      <Badge className={`text-xs ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="mt-0.5">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {activity.date}
                  </span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};