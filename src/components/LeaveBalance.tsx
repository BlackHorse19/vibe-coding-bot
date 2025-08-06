import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface LeaveBalanceProps {
  annualLeave: {
    used: number;
    total: number;
  };
  sickLeave: {
    used: number;
    total: number;
  };
  personalLeave: {
    used: number;
    total: number;
  };
}

export const LeaveBalance = ({ annualLeave, sickLeave, personalLeave }: LeaveBalanceProps) => {
  const leaveTypes = [
    {
      name: "Annual Leave",
      used: annualLeave.used,
      total: annualLeave.total,
      color: "bg-primary",
    },
    {
      name: "Sick Leave",
      used: sickLeave.used,
      total: sickLeave.total,
      color: "bg-warning",
    },
    {
      name: "Personal Leave",
      used: personalLeave.used,
      total: personalLeave.total,
      color: "bg-success",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Leave Balance
          <Badge variant="outline" className="text-xs">
            2024
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {leaveTypes.map((leave) => {
          const percentage = (leave.used / leave.total) * 100;
          const remaining = leave.total - leave.used;
          
          return (
            <div key={leave.name} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">{leave.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {remaining} days left
                </span>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{
                    '--progress-background': `hsl(var(--muted))`,
                    '--progress-foreground': leave.color === "bg-primary" ? `hsl(var(--primary))` :
                                           leave.color === "bg-warning" ? `hsl(var(--warning))` :
                                           `hsl(var(--success))`
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Used: {leave.used} days</span>
                  <span>Total: {leave.total} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};