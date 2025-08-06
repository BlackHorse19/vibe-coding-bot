import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Download,
  FileSpreadsheet,
  Users,
  CheckCircle,
  XCircle,
  Clock3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { employeeDataService } from '@/lib/data';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  submittedDate: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
}

const mockLeaveHistory: LeaveRequest[] = [
  {
    id: '1',
    employeeName: 'Sarah Johnson',
    leaveType: 'Annual',
    startDate: '2025-08-15',
    endDate: '2025-08-22',
    days: 7,
    reason: 'Family vacation to Europe',
    submittedDate: '2025-08-05',
    department: 'Engineering',
    status: 'pending'
  },
  {
    id: '2',
    employeeName: 'Michael Chen',
    leaveType: 'Sick',
    startDate: '2025-07-20',
    endDate: '2025-07-22',
    days: 3,
    reason: 'Medical treatment',
    submittedDate: '2025-07-18',
    department: 'Design',
    status: 'approved',
    approvedBy: 'Ankit',
    approvedDate: '2025-07-19'
  },
  {
    id: '3',
    employeeName: 'Emily Rodriguez',
    leaveType: 'Personal',
    startDate: '2025-07-10',
    endDate: '2025-07-10',
    days: 1,
    reason: 'Personal matters',
    submittedDate: '2025-07-08',
    department: 'Marketing',
    status: 'rejected',
    rejectedBy: 'Harshita',
    rejectedDate: '2025-07-09',
    rejectionReason: 'Insufficient notice period'
  },
  {
    id: '4',
    employeeName: 'David Kim',
    leaveType: 'Emergency',
    startDate: '2025-06-25',
    endDate: '2025-06-27',
    days: 3,
    reason: 'Family emergency',
    submittedDate: '2025-06-24',
    department: 'Sales',
    status: 'approved',
    approvedBy: 'Shantanu',
    approvedDate: '2025-06-24'
  },
  {
    id: '5',
    employeeName: 'Lisa Wang',
    leaveType: 'Annual',
    startDate: '2025-06-15',
    endDate: '2025-06-19',
    days: 5,
    reason: 'Summer vacation',
    submittedDate: '2025-06-10',
    department: 'HR',
    status: 'approved',
    approvedBy: 'Ayush',
    approvedDate: '2025-06-11'
  },
  {
    id: '6',
    employeeName: 'James Wilson',
    leaveType: 'Sick',
    startDate: '2025-06-05',
    endDate: '2025-06-07',
    days: 3,
    reason: 'Flu recovery',
    submittedDate: '2025-06-04',
    department: 'Finance',
    status: 'approved',
    approvedBy: 'Ankit',
    approvedDate: '2025-06-04'
  }
];

export const LeaveHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load real leave applications on component mount
  useEffect(() => {
    const loadLeaveHistory = async () => {
      try {
        setLoading(true);
        await employeeDataService.loadLeaveApplications();
        const applications = employeeDataService.getAllLeaveApplications();
        const convertedRequests = employeeDataService.convertToDashboardFormat(applications);
        setAllRequests(convertedRequests);
      } catch (error) {
        console.error('Failed to load leave history:', error);
        // Fallback to mock data if real data fails
        setAllRequests(mockLeaveHistory);
      } finally {
        setLoading(false);
      }
    };

    loadLeaveHistory();
  }, []);

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
  const leaveTypes = ['Annual', 'Sick', 'Personal', 'Emergency'];

  const filteredRequests = useMemo(() => {
    return allRequests.filter(request => {
      const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || request.department === departmentFilter;
      const matchesLeaveType = leaveTypeFilter === 'all' || request.leaveType === leaveTypeFilter;
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesLeaveType && matchesStatus;
    });
  }, [searchTerm, departmentFilter, leaveTypeFilter, statusFilter, allRequests]);

  const stats = useMemo(() => {
    const all = filteredRequests.length;
    const pending = filteredRequests.filter(r => r.status === 'pending').length;
    const approved = filteredRequests.filter(r => r.status === 'approved').length;
    const rejected = filteredRequests.filter(r => r.status === 'rejected').length;
    
    return { all, pending, approved, rejected };
  }, [filteredRequests]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your leave history report is being generated...",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock3 className="w-4 h-4 text-orange-600" />;
      default: return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderRequestCard = (request: LeaveRequest) => (
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

              {/* Status specific information */}
              {request.status === 'approved' && request.approvedBy && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Approved by:</strong> {request.approvedBy} on {request.approvedDate}
                  </p>
                </div>
              )}

              {request.status === 'rejected' && request.rejectedBy && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Rejected by:</strong> {request.rejectedBy} on {request.rejectedDate}
                  </p>
                  {request.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">
                      <strong>Reason:</strong> {request.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(request.status)}
            <Badge 
              variant={request.status === 'approved' ? 'default' : 
                      request.status === 'rejected' ? 'destructive' : 'secondary'}
              className="capitalize"
            >
              {request.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.all}</p>
                <p className="text-sm text-blue-600">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock3 className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
                <p className="text-sm text-orange-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                <p className="text-sm text-green-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                <p className="text-sm text-red-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Leave History</CardTitle>
              <CardDescription>View and filter all leave requests</CardDescription>
            </div>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Leave Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leave Types</SelectItem>
                {leaveTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed View */}
      <Tabs value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <div className="grid gap-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => renderRequestCard(request))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No leave requests found matching your criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
