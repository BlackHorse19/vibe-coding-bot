import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Users, 
  Clock, 
  Calendar as CalendarIcon,
  User,
  History,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  TrendingUp,
  FileText,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { employeeDataService, Employee, LeaveApplication } from "@/lib/data";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DashboardStats {
  totalEmployees: number;
  totalLeaveBalance: {
    sick: number;
    casual: number;
    earned: number;
  };
  onLeaveToday: number;
  upcomingLeaves: number;
  pendingRequests: number;
}

const ComprehensiveDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalLeaveBalance: { sick: 0, casual: 0, earned: 0 },
    onLeaveToday: 0,
    upcomingLeaves: 0,
    pendingRequests: 0
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [chartPeriod, setChartPeriod] = useState("3months");
  
  // Action state for approve/reject functionality
  const [selectedAction, setSelectedAction] = useState<LeaveApplication | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [managerComments, setManagerComments] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Force reload employee data but preserve localStorage leave applications
      employeeDataService.forceReloadEmployees();
      
      await employeeDataService.loadEmployeeData();
      await employeeDataService.loadLeaveApplications();
      
      const employeesData = employeeDataService.getAllEmployees();
      const applicationsData = employeeDataService.getAllLeaveApplications();
      
      console.log('✅ Dashboard loaded employees:', employeesData.length);
      console.log('✅ Dashboard loaded applications:', applicationsData.length);
      console.log('📋 Sample employee:', employeesData[0]);
      console.log('📋 Sample application:', applicationsData[0]);
      
      // Test employee lookup for first application
      if (applicationsData.length > 0) {
        const firstApp = applicationsData[0];
        const employee = employeesData.find(emp => emp.Employee_ID === firstApp.Employee_ID);
        console.log('🔍 Employee lookup test for', firstApp.Employee_ID, ':', employee);
      }
      
      setEmployees(employeesData);
      setLeaveApplications(applicationsData);
      
      // Calculate dashboard stats
      calculateDashboardStats(employeesData, applicationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const refreshDashboard = async () => {
    console.log('🔄 Manual dashboard refresh triggered');
    await loadData();
  };

  const calculateDashboardStats = (employees: Employee[], applications: LeaveApplication[]) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const totalLeaveBalance = employees.reduce((acc, emp) => ({
      sick: acc.sick + emp.Sick_Leave,
      casual: acc.casual + emp.Casual_Leave,
      earned: acc.earned + emp.Earned_Leave
    }), { sick: 0, casual: 0, earned: 0 });

    const onLeaveToday = applications.filter(app => 
      app.Status === 'Approved' && 
      app.Start_Date <= todayStr && 
      app.End_Date >= todayStr
    ).length;

    const upcomingLeaves = applications.filter(app => 
      app.Status === 'Approved' && 
      app.Start_Date > todayStr
    ).length;

    const pendingRequests = applications.filter(app => app.Status === 'Pending').length;

    setDashboardStats({
      totalEmployees: employees.length,
      totalLeaveBalance,
      onLeaveToday,
      upcomingLeaves,
      pendingRequests
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Try to find by ID first, then by name
      let employee = employeeDataService.findEmployeeById(query.trim());
      if (!employee) {
        employee = employeeDataService.findEmployeeByName(query.trim());
      }
      setSelectedEmployee(employee);
    } else {
      setSelectedEmployee(null);
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sick': return 'bg-red-100 text-red-800';
      case 'casual': return 'bg-blue-100 text-blue-800';
      case 'earned': return 'bg-green-100 text-green-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingApplications = leaveApplications
    .filter(app => app.Status === 'Pending')
    .sort((a, b) => new Date(b.Application_Date).getTime() - new Date(a.Application_Date).getTime());
  const recentActivity = leaveApplications
    .sort((a, b) => new Date(b.Application_Date).getTime() - new Date(a.Application_Date).getTime())
    .slice(0, 10);

  // Helper functions for filtered data
  const getOnLeaveToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return leaveApplications.filter(app => 
      app.Status === 'Approved' && 
      app.Start_Date <= today && 
      app.End_Date >= today
    );
  };

  const getUpcomingLeaves = () => {
    const today = new Date().toISOString().split('T')[0];
    return leaveApplications.filter(app => 
      app.Status === 'Approved' && 
      app.Start_Date > today
    );
  };

  const onLeaveToday = getOnLeaveToday();
  const upcomingLeaves = getUpcomingLeaves();

  // Chart data preparation
  const leaveTypeData = leaveApplications
    .filter(app => app.Status === 'Approved')
    .reduce((acc, app) => {
      acc[app.Leave_Type] = (acc[app.Leave_Type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(leaveTypeData).map(([type, count]) => ({
    name: type,
    value: count,
    color: type === 'Sick' ? '#ef4444' : type === 'Casual' ? '#3b82f6' : type === 'Earned' ? '#10b981' : '#8b5cf6'
  }));

  const monthlyTrends = leaveApplications
    .filter(app => app.Status === 'Approved')
    .reduce((acc, app) => {
      const month = new Date(app.Start_Date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) acc[month] = { month, sick: 0, casual: 0, earned: 0 };
      const leaveType = app.Leave_Type.toLowerCase();
      if (leaveType === 'sick' || leaveType === 'casual' || leaveType === 'earned') {
        acc[month][leaveType as keyof typeof acc[typeof month]] += 1;
      }
      return acc;
    }, {} as Record<string, any>);

  const lineChartData = Object.values(monthlyTrends).slice(-6);

  // Action handlers for approve/reject/details functionality
  const handleApprove = (application: LeaveApplication) => {
    setSelectedAction(application);
    setShowApproveDialog(true);
    setManagerComments("");
  };

  const handleReject = (application: LeaveApplication) => {
    setSelectedAction(application);
    setShowRejectDialog(true);
    setManagerComments("");
  };

  const handleShowDetails = (application: LeaveApplication) => {
    setSelectedAction(application);
    setShowDetailsDialog(true);
  };

  const confirmApprove = async () => {
    if (!selectedAction) return;

    try {
      // Update the application status using the data service
      await employeeDataService.updateLeaveApplicationStatus(
        selectedAction.Application_ID, 
        'Approved', 
        'Admin', // You can customize this to show actual manager name
        managerComments
      );

      // Refresh the dashboard data to reflect changes
      await loadData();

      // Reset state
      setShowApproveDialog(false);
      setSelectedAction(null);
      setManagerComments("");
      
      console.log('✅ Leave application approved:', selectedAction.Application_ID);
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const confirmReject = async () => {
    if (!selectedAction) return;

    try {
      // Update the application status using the data service
      await employeeDataService.updateLeaveApplicationStatus(
        selectedAction.Application_ID, 
        'Rejected', 
        'Admin',
        managerComments
      );

      // Refresh the dashboard data to reflect changes
      await loadData();

      // Reset state
      setShowRejectDialog(false);
      setSelectedAction(null);
      setManagerComments("");
      
      console.log('❌ Leave application rejected:', selectedAction.Application_ID);
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Employee Search Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Employee Search
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDashboard}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </CardTitle>
            <CardDescription>Search by Employee ID or Name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Employee ID or Name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="flex-1"
                />
                <Button onClick={() => handleSearch("")} variant="outline">
                  Clear
                </Button>
              </div>
              
              {selectedEmployee && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.Name}`} />
                        <AvatarFallback>{selectedEmployee.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{selectedEmployee.Name}</h3>
                        <p className="text-gray-600">ID: {selectedEmployee.Employee_ID}</p>
                        <p className="text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedEmployee.Email}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="bg-red-100 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-700">{selectedEmployee.Sick_Leave}</div>
                            <div className="text-sm text-red-600">Sick Leave</div>
                          </div>
                          <div className="bg-blue-100 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-700">{selectedEmployee.Casual_Leave}</div>
                            <div className="text-sm text-blue-600">Casual Leave</div>
                          </div>
                          <div className="bg-green-100 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-700">{selectedEmployee.Earned_Leave}</div>
                            <div className="text-sm text-green-600">Earned Leave</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <History className="h-4 w-4 mr-1" />
                            View History
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            Apply Leave
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. At a Glance Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">At a Glance</h2>
          
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Employees</p>
                        <p className="text-3xl font-bold">{dashboardStats.totalEmployees}</p>
                      </div>
                      <Users className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>All Employees ({dashboardStats.totalEmployees})</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh]">
                  <div className="grid gap-4">
                    {employees.map((employee) => (
                      <Card key={employee.Employee_ID} className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.Name}`} />
                            <AvatarFallback>{employee.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{employee.Name}</h3>
                                <p className="text-gray-600">ID: {employee.Employee_ID}</p>
                                <p className="text-gray-600 flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {employee.Email}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="bg-red-50 p-2 rounded text-center">
                                  <div className="font-bold text-red-700">{employee.Sick_Leave}</div>
                                  <div className="text-red-600 text-xs">Sick</div>
                                </div>
                                <div className="bg-blue-50 p-2 rounded text-center">
                                  <div className="font-bold text-blue-700">{employee.Casual_Leave}</div>
                                  <div className="text-blue-600 text-xs">Casual</div>
                                </div>
                                <div className="bg-green-50 p-2 rounded text-center">
                                  <div className="font-bold text-green-700">{employee.Earned_Leave}</div>
                                  <div className="text-green-600 text-xs">Earned</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="text-xs">
                                <History className="h-3 w-3 mr-1" />
                                History
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Apply Leave
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Leave Balance</p>
                        <div className="text-sm space-y-1">
                          <div>Sick: {dashboardStats.totalLeaveBalance.sick}</div>
                          <div>Casual: {dashboardStats.totalLeaveBalance.casual}</div>
                          <div>Earned: {dashboardStats.totalLeaveBalance.earned}</div>
                        </div>
                      </div>
                      <CalendarIcon className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Total Leave Balance Breakdown</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-red-700">{dashboardStats.totalLeaveBalance.sick}</div>
                        <div className="text-red-600 font-medium">Total Sick Leave</div>
                        <div className="text-red-500 text-sm">Available across all employees</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-700">{dashboardStats.totalLeaveBalance.casual}</div>
                        <div className="text-blue-600 font-medium">Total Casual Leave</div>
                        <div className="text-blue-500 text-sm">Available across all employees</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-700">{dashboardStats.totalLeaveBalance.earned}</div>
                        <div className="text-green-600 font-medium">Total Earned Leave</div>
                        <div className="text-green-500 text-sm">Available across all employees</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="text-sm space-y-1">
                      <p>• Total Employees: {dashboardStats.totalEmployees}</p>
                      <p>• Average Sick Leave per Employee: {Math.round(dashboardStats.totalLeaveBalance.sick / dashboardStats.totalEmployees)}</p>
                      <p>• Average Casual Leave per Employee: {Math.round(dashboardStats.totalLeaveBalance.casual / dashboardStats.totalEmployees)}</p>
                      <p>• Average Earned Leave per Employee: {Math.round(dashboardStats.totalLeaveBalance.earned / dashboardStats.totalEmployees)}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* On Leave Today */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">On Leave Today</p>
                        <p className="text-3xl font-bold">{dashboardStats.onLeaveToday}</p>
                      </div>
                      <UserCheck className="h-12 w-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Employees On Leave Today ({onLeaveToday.length})</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh]">
                  <div className="grid gap-4">
                    {onLeaveToday.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No employees are on leave today</p>
                      </div>
                    ) : (
                      onLeaveToday.map((application) => {
                        const employee = employees.find(emp => emp.Employee_ID === application.Employee_ID);
                        return (
                          <Card key={application.Application_ID} className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.Name}`} />
                                <AvatarFallback>{employee?.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg">{employee?.Name}</h3>
                                    <p className="text-gray-600">ID: {employee?.Employee_ID}</p>
                                    <p className="text-gray-600 flex items-center gap-1">
                                      <Mail className="h-4 w-4" />
                                      {employee?.Email}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={getLeaveTypeColor(application.Leave_Type)}>
                                      {application.Leave_Type}
                                    </Badge>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {application.Start_Date} to {application.End_Date}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-700"><strong>Reason:</strong> {application.Reason}</p>
                                  <p className="text-sm text-gray-600 mt-1">Applied: {application.Application_Date}</p>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Details
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <Mail className="h-3 w-3 mr-1" />
                                    Contact
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Upcoming Leaves */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Upcoming Leaves</p>
                        <p className="text-3xl font-bold">{dashboardStats.upcomingLeaves}</p>
                      </div>
                      <CalendarIcon className="h-12 w-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Upcoming Leaves ({upcomingLeaves.length})</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh]">
                  <div className="grid gap-4">
                    {upcomingLeaves.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No upcoming leaves scheduled</p>
                      </div>
                    ) : (
                      upcomingLeaves
                        .sort((a, b) => new Date(a.Start_Date).getTime() - new Date(b.Start_Date).getTime())
                        .map((application) => {
                          const employee = employees.find(emp => emp.Employee_ID === application.Employee_ID);
                          const daysUntil = Math.ceil((new Date(application.Start_Date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <Card key={application.Application_ID} className="p-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.Name}`} />
                                  <AvatarFallback>{employee?.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-semibold text-lg">{employee?.Name}</h3>
                                      <p className="text-gray-600">ID: {employee?.Employee_ID}</p>
                                      <p className="text-gray-600 flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {employee?.Email}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <Badge className={getLeaveTypeColor(application.Leave_Type)}>
                                        {application.Leave_Type}
                                      </Badge>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {application.Start_Date} to {application.End_Date}
                                      </div>
                                      <div className="text-xs text-purple-600 mt-1 font-medium">
                                        Starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-700"><strong>Reason:</strong> {application.Reason}</p>
                                    <p className="text-sm text-gray-600 mt-1">Applied: {application.Application_Date}</p>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      View Details
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      <Mail className="h-3 w-3 mr-1" />
                                      Contact
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Pending Requests */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100">Pending Requests</p>
                        <p className="text-3xl font-bold">{dashboardStats.pendingRequests}</p>
                      </div>
                      <AlertCircle className="h-12 w-12 text-red-200" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Pending Leave Requests ({pendingApplications.length})</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh]">
                  <div className="grid gap-4">
                    {pendingApplications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No pending requests</p>
                      </div>
                    ) : (
                      pendingApplications.map((application) => {
                          const employee = employees.find(emp => emp.Employee_ID === application.Employee_ID);
                          const daysAgo = Math.ceil((new Date().getTime() - new Date(application.Application_Date).getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <Card key={application.Application_ID} className="p-4 border-l-4 border-l-red-500">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.Name}`} />
                                  <AvatarFallback>{employee?.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-semibold text-lg">{employee?.Name}</h3>
                                      <p className="text-gray-600">ID: {employee?.Employee_ID}</p>
                                      <p className="text-gray-600 flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {employee?.Email}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <Badge className={getLeaveTypeColor(application.Leave_Type)}>
                                        {application.Leave_Type}
                                      </Badge>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {application.Start_Date} to {application.End_Date}
                                      </div>
                                      <div className="text-xs text-red-600 mt-1 font-medium">
                                        Applied {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-700"><strong>Reason:</strong> {application.Reason}</p>
                                    <p className="text-sm text-gray-600 mt-1">Applied: {application.Application_Date}</p>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-xs"
                                      onClick={() => handleShowDetails(application)}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Review
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700 text-xs"
                                      onClick={() => handleApprove(application)}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      className="text-xs"
                                      onClick={() => handleReject(application)}
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 3. Actionable Items Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Actionable Items
                <Badge variant="secondary">{pendingApplications.length}</Badge>
              </span>
            </CardTitle>
            <CardDescription>Pending leave requests requiring action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.slice(0, 5).map((application) => {
                const employee = employees.find(emp => emp.Employee_ID === application.Employee_ID);
                return (
                  <div key={application.Application_ID} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.Name}`} />
                        <AvatarFallback>{employee?.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee?.Name}</div>
                        <div className="text-sm text-gray-600">{employee?.Employee_ID}</div>
                      </div>
                      <Badge className={getLeaveTypeColor(application.Leave_Type)}>
                        {application.Leave_Type}
                      </Badge>
                      <div className="text-sm">
                        <div>{application.Start_Date} to {application.End_Date}</div>
                        <div className="text-gray-500">{application.Reason}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 4. Calendar View Section */}
        <Card className="shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Leave Calendar
                </span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="hover:bg-blue-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[140px] text-center bg-white px-3 py-1 rounded-md shadow-sm border">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="hover:bg-blue-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Calendar - Now takes more space */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-xl shadow-lg border p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    className="rounded-md w-full scale-110 transform origin-center"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center text-lg font-semibold",
                      caption_label: "text-lg font-semibold",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell: "text-slate-500 rounded-md w-10 font-normal text-sm flex-1 text-center py-3",
                      row: "flex w-full mt-2",
                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
                      day: "h-12 w-12 p-0 font-normal text-base hover:bg-slate-100 rounded-md flex items-center justify-center transition-colors",
                      day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                      day_today: "bg-slate-100 text-slate-900 font-semibold",
                      day_outside: "text-slate-400 opacity-50",
                      day_disabled: "text-slate-400 opacity-50",
                      day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                      day_hidden: "invisible",
                    }}
                    modifiers={{
                      hasLeave: (date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return leaveApplications.some(app => 
                          app.Status === 'Approved' && 
                          dateStr >= app.Start_Date && 
                          dateStr <= app.End_Date
                        );
                      },
                      hasMultipleLeaves: (date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return leaveApplications.filter(app => 
                          app.Status === 'Approved' && 
                          dateStr >= app.Start_Date && 
                          dateStr <= app.End_Date
                        ).length > 1;
                      },
                      hasPendingLeave: (date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return leaveApplications.some(app => 
                          app.Status === 'Pending' && 
                          dateStr >= app.Start_Date && 
                          dateStr <= app.End_Date
                        );
                      }
                    }}
                    modifiersStyles={{
                      hasLeave: { 
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 'bold',
                        position: 'relative',
                        border: '2px solid #3b82f6'
                      },
                      hasMultipleLeaves: { 
                        backgroundColor: '#fecaca',
                        color: '#dc2626',
                        fontWeight: 'bold',
                        border: '2px solid #ef4444'
                      },
                      hasPendingLeave: { 
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        fontWeight: 'bold',
                        border: '2px solid #f59e0b'
                      }
                    }}
                  />
                  
                  {/* Enhanced Calendar Legend */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Calendar Legend
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-200 border-2 border-blue-400 rounded flex items-center justify-center text-blue-800 font-bold text-xs">L</div>
                        <span>Single Leave</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-200 border-2 border-red-400 rounded flex items-center justify-center text-red-800 font-bold text-xs">M</div>
                        <span>Multiple Leaves</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-400 rounded flex items-center justify-center text-yellow-800 font-bold text-xs">P</div>
                        <span>Pending Approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>Sick Leave</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span>Casual Leave</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Earned Leave</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Selected Date Details */}
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-lg border p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Select a date'}
                  </h4>
                  
                  {selectedDate ? (
                    <div className="space-y-4">
                      {(() => {
                        const dateStr = selectedDate.toISOString().split('T')[0];
                        const dayLeaves = leaveApplications.filter(app => 
                          (app.Status === 'Approved' || app.Status === 'Pending') && 
                          dateStr >= app.Start_Date && 
                          dateStr <= app.End_Date
                        );
                        
                        if (dayLeaves.length === 0) {
                          return (
                            <div className="text-center py-6 text-gray-500">
                              <UserCheck className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm font-medium">No leaves on this date</p>
                              <p className="text-xs text-gray-400 mt-1">All employees available</p>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-3">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">Total Leaves:</span>
                                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {dayLeaves.length}
                                </span>
                              </div>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto space-y-3">
                              {dayLeaves.map((leave) => {
                                const employee = employees.find(emp => emp.Employee_ID === leave.Employee_ID);
                                const isMultiDay = leave.Start_Date !== leave.End_Date;
                                const startDate = new Date(leave.Start_Date);
                                const endDate = new Date(leave.End_Date);
                                const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                
                                return (
                                  <div key={leave.Application_ID} className={`p-4 border-2 rounded-lg hover:shadow-md transition-all ${
                                    leave.Status === 'Pending' 
                                      ? 'border-yellow-200 bg-yellow-50' 
                                      : 'border-gray-200 bg-white hover:bg-gray-50'
                                  }`}>
                                    <div className="flex items-start gap-3">
                                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.Name}`} />
                                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                          {employee?.Name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                          <div>
                                            <p className="font-semibold text-gray-900 truncate">{employee?.Name}</p>
                                            <p className="text-xs text-gray-600">{employee?.Employee_ID}</p>
                                          </div>
                                          <div className="flex flex-col items-end gap-1">
                                            <Badge className={getLeaveTypeColor(leave.Leave_Type)}>
                                              {leave.Leave_Type}
                                            </Badge>
                                            <Badge className={getStatusColor(leave.Status)}>
                                              {leave.Status}
                                            </Badge>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2 text-xs text-gray-600">
                                          <div className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" />
                                            <span>{leave.Start_Date}</span>
                                            {isMultiDay && (
                                              <>
                                                <span>to</span>
                                                <span>{leave.End_Date}</span>
                                                <span className="bg-blue-100 text-blue-800 px-1 rounded">
                                                  ({totalDays} days)
                                                </span>
                                              </>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{employee?.Email}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                                          <p className="text-gray-700">
                                            <span className="font-medium">Reason:</span> {leave.Reason}
                                          </p>
                                          <p className="text-gray-500 mt-1">
                                            <span className="font-medium">Applied:</span> {leave.Application_Date}
                                          </p>
                                        </div>
                                        
                                        <div className="flex gap-2 mt-3">
                                          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                            <Eye className="h-3 w-3 mr-1" />
                                            Details
                                          </Button>
                                          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                            <Mail className="h-3 w-3 mr-1" />
                                            Contact
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium">Click on a date</p>
                      <p className="text-xs text-gray-400 mt-1">to see detailed leave information</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Monthly Stats */}
                <div className="bg-white rounded-xl shadow-lg border p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Monthly Overview
                  </h4>
                  <div className="space-y-4">
                    {(() => {
                      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
                      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
                      
                      const monthlyLeaves = leaveApplications.filter(app => 
                        app.Status === 'Approved' && 
                        ((app.Start_Date >= monthStart && app.Start_Date <= monthEnd) ||
                         (app.End_Date >= monthStart && app.End_Date <= monthEnd) ||
                         (app.Start_Date <= monthStart && app.End_Date >= monthEnd))
                      );
                      
                      const pendingLeaves = leaveApplications.filter(app => 
                        app.Status === 'Pending' && 
                        ((app.Start_Date >= monthStart && app.Start_Date <= monthEnd) ||
                         (app.End_Date >= monthStart && app.End_Date <= monthEnd) ||
                         (app.Start_Date <= monthStart && app.End_Date >= monthEnd))
                      );
                      
                      const leaveStats = monthlyLeaves.reduce((acc, leave) => {
                        acc[leave.Leave_Type] = (acc[leave.Leave_Type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      return (
                        <div className="space-y-4">
                          {/* Approved Leaves */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Approved Leaves</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                                <div className="font-bold text-red-700 text-lg">{leaveStats.Sick || 0}</div>
                                <div className="text-red-600 text-xs">Sick</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                                <div className="font-bold text-blue-700 text-lg">{leaveStats.Casual || 0}</div>
                                <div className="text-blue-600 text-xs">Casual</div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                                <div className="font-bold text-green-700 text-lg">{leaveStats.Earned || 0}</div>
                                <div className="text-green-600 text-xs">Earned</div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-100">
                                <div className="font-bold text-purple-700 text-lg">{leaveStats.Personal || 0}</div>
                                <div className="text-purple-600 text-xs">Personal</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Summary */}
                          <div className="pt-3 border-t">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Approved:</span>
                                <span className="font-semibold text-green-700">{monthlyLeaves.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pending Approval:</span>
                                <span className="font-semibold text-yellow-700">{pendingLeaves.length}</span>
                              </div>
                              <div className="flex justify-between font-semibold">
                                <span className="text-gray-800">Total Requests:</span>
                                <span className="text-blue-700">{monthlyLeaves.length + pendingLeaves.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Bottom Row: Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest leave requests and status updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {recentActivity.map((activity) => {
                  const employee = employees.find(emp => emp.Employee_ID === activity.Employee_ID);
                  return (
                    <div key={activity.Application_ID} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.Name}`} />
                        <AvatarFallback>{employee?.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{employee?.Name}</div>
                        <div className="text-xs text-gray-600">
                          {activity.Leave_Type} leave from {activity.Start_Date} to {activity.End_Date}
                        </div>
                        <div className="text-xs text-gray-500">{activity.Reason}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getStatusColor(activity.Status)} text-xs`}>
                            {activity.Status}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Applied on {activity.Application_Date}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>Leave trends and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                {/* Period Selector */}
                <Select value={chartPeriod} onValueChange={setChartPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                    <SelectItem value="year">Current year</SelectItem>
                    <SelectItem value="lastyear">Last year</SelectItem>
                  </SelectContent>
                </Select>

                {/* Pie Chart */}
                <div>
                  <h4 className="font-medium mb-2">Leaves by Type</h4>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div>
                  <h4 className="font-medium mb-2">Leave Trends</h4>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sick" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="casual" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Dialogs */}
        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approve Leave Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAction && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium">{employees.find(emp => emp.Employee_ID === selectedAction.Employee_ID)?.Name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedAction.Leave_Type} from {selectedAction.Start_Date} to {selectedAction.End_Date}
                  </div>
                  <div className="text-sm text-gray-600">{selectedAction.Days_Requested} days</div>
                  <div className="text-sm mt-2">{selectedAction.Reason}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Manager Comments (Optional)</label>
                <Textarea
                  placeholder="Add any comments about this approval..."
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Leave Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAction && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium">{employees.find(emp => emp.Employee_ID === selectedAction.Employee_ID)?.Name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedAction.Leave_Type} from {selectedAction.Start_Date} to {selectedAction.End_Date}
                  </div>
                  <div className="text-sm text-gray-600">{selectedAction.Days_Requested} days</div>
                  <div className="text-sm mt-2">{selectedAction.Reason}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Rejection Reason (Required)</label>
                <Textarea
                  placeholder="Please provide a reason for rejection..."
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmReject}
                  variant="destructive"
                  disabled={!managerComments.trim()}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Leave Request Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAction && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Employee Name</label>
                        <div className="font-medium">{employees.find(emp => emp.Employee_ID === selectedAction.Employee_ID)?.Name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Employee ID</label>
                        <div className="font-medium">{selectedAction.Employee_ID}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Leave Type</label>
                        <div className="font-medium">{selectedAction.Leave_Type}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Days Requested</label>
                        <div className="font-medium">{selectedAction.Days_Requested}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <div className="font-medium">{selectedAction.Start_Date}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">End Date</label>
                        <div className="font-medium">{selectedAction.End_Date}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Application Date</label>
                        <div className="font-medium">{selectedAction.Application_Date}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Reason</label>
                        <div className="font-medium">{selectedAction.Reason}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        setShowDetailsDialog(false);
                        handleApprove(selectedAction);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDetailsDialog(false);
                        handleReject(selectedAction);
                      }}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
