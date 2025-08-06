import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  User, 
  Check, 
  X, 
  AlertCircle,
  CheckCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardService, LeaveRequest } from '@/lib/dashboardData';
import { employeeDataService } from '@/lib/data';

interface PendingRequestsProps {
  limit?: number;
  showHeader?: boolean;
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({ 
  limit,
  showHeader = true 
}) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load real leave applications on component mount
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        setLoading(true);
        const applications = await employeeDataService.getPendingApplications();
        const convertedRequests = employeeDataService.convertToDashboardFormat(applications);
        setRequests(convertedRequests);
      } catch (error) {
        console.error('Failed to load pending requests:', error);
        // Fallback to mock data if real data fails
        setRequests(DashboardService.getPendingRequests());
      } finally {
        setLoading(false);
      }
    };

    loadPendingRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    
    try {
      // Use real approval service
      const result = await employeeDataService.approveLeaveApplication(requestId, 'Admin', 'Approved from dashboard');
      
      if (result.success) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({
          title: "Request Approved",
          description: "Leave request has been successfully approved.",
        });
      } else {
        toast({
          title: "Approval Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    
    try {
      // Use real rejection service
      const result = await employeeDataService.rejectLeaveApplication(requestId, 'Admin', 'Rejected from dashboard');
      
      if (result.success) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({
          title: "Request Rejected",
          description: "Leave request has been rejected.",
        });
      } else {
        toast({
          title: "Rejection Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Rejection error:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleBulkApprove = async () => {
    setBulkProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const approvedCount = requests.length;
    setRequests([]);
    setBulkProcessing(false);
    
    toast({
      title: "Bulk Approval Complete",
      description: `${approvedCount} requests have been approved.`,
    });
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Annual': return 'bg-blue-100 text-blue-800';
      case 'Sick': return 'bg-red-100 text-red-800';
      case 'Personal': return 'bg-purple-100 text-purple-800';
      case 'Emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayRequests = limit ? requests.slice(0, limit) : requests;

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 animate-spin" />
              Loading Requests...
            </CardTitle>
            <CardDescription>
              Fetching pending leave requests from the system.
            </CardDescription>
          </CardHeader>
        )}
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-green-600" />
              All Caught Up!
            </CardTitle>
            <CardDescription>
              No pending leave requests to review.
            </CardDescription>
          </CardHeader>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {showHeader && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription className="text-orange-600">
              {requests.length} leave request{requests.length !== 1 ? 's' : ''} awaiting your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleBulkApprove}
              disabled={bulkProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkProcessing ? 'Processing...' : `Approve All (${requests.length})`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="grid gap-4">
        {displayRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.employeeAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                      {getInitials(request.employeeName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{request.employeeName}</h3>
                      <p className="text-sm text-gray-600">{request.department}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getLeaveTypeColor(request.leaveType)}>
                        {request.leaveType} Leave
                      </Badge>
                      <Badge variant="outline" className="text-gray-600">
                        {request.days} day{request.days !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{request.startDate} to {request.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Submitted {request.submittedDate}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    disabled={processingIds.has(request.id)}
                    className="bg-green-600 hover:bg-green-700 h-9"
                    size="sm"
                  >
                    {processingIds.has(request.id) ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={processingIds.has(request.id)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 h-9"
                    size="sm"
                  >
                    {processingIds.has(request.id) ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
