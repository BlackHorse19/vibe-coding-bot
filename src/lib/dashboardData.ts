// Mock data service for the leave management dashboard

export interface LeaveRequest {
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

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  avatar?: string;
  status: 'Active' | 'On Leave' | 'Remote';
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
  joinDate: string;
  location: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingApprovals: number;
  approvedThisMonth: number;
  teamAvailability: number;
  totalEmployees: number;
  onLeaveToday: number;
  returningToday: number;
  upcomingLeaves: number;
}

// Mock Leave Requests Data
export const mockLeaveRequests: LeaveRequest[] = [
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
    startDate: '2025-08-10',
    endDate: '2025-08-12',
    days: 3,
    reason: 'Flu symptoms and recovery',
    submittedDate: '2025-08-09',
    department: 'Design',
    status: 'pending'
  },
  {
    id: '3',
    employeeName: 'Emily Rodriguez',
    leaveType: 'Personal',
    startDate: '2025-08-20',
    endDate: '2025-08-21',
    days: 2,
    reason: 'Moving to new apartment',
    submittedDate: '2025-08-06',
    department: 'Marketing',
    status: 'pending'
  },
  {
    id: '4',
    employeeName: 'David Kim',
    leaveType: 'Emergency',
    startDate: '2025-08-08',
    endDate: '2025-08-08',
    days: 1,
    reason: 'Family emergency',
    submittedDate: '2025-08-08',
    department: 'Sales',
    status: 'approved',
    approvedBy: 'Ankit',
    approvedDate: '2025-08-08'
  },
  {
    id: '5',
    employeeName: 'Lisa Wang',
    leaveType: 'Annual',
    startDate: '2025-07-28',
    endDate: '2025-08-02',
    days: 5,
    reason: 'Summer vacation',
    submittedDate: '2025-07-20',
    department: 'HR',
    status: 'approved',
    approvedBy: 'Harshita',
    approvedDate: '2025-07-21'
  },
  {
    id: '6',
    employeeName: 'James Taylor',
    leaveType: 'Sick',
    startDate: '2025-08-01',
    endDate: '2025-08-03',
    days: 3,
    reason: 'Doctor recommended rest',
    submittedDate: '2025-07-31',
    department: 'Finance',
    status: 'rejected',
    rejectedBy: 'Shantanu',
    rejectedDate: '2025-08-01',
    rejectionReason: 'Insufficient sick leave balance'
  }
];

// Mock Employee Data
export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    position: "Senior Frontend Developer",
    status: "Active",
    leaveBalance: { annual: 15, sick: 8, personal: 3 },
    joinDate: "2022-03-15",
    location: "San Francisco, CA"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1 (555) 234-5678",
    department: "Design",
    position: "UX Designer",
    status: "On Leave",
    leaveBalance: { annual: 12, sick: 10, personal: 5 },
    joinDate: "2021-08-20",
    location: "Seattle, WA"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    department: "Marketing",
    position: "Marketing Manager",
    status: "Remote",
    leaveBalance: { annual: 18, sick: 7, personal: 2 },
    joinDate: "2020-12-10",
    location: "Austin, TX"
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@company.com",
    phone: "+1 (555) 456-7890",
    department: "Sales",
    position: "Sales Representative",
    status: "Active",
    leaveBalance: { annual: 14, sick: 9, personal: 4 },
    joinDate: "2023-01-05",
    location: "New York, NY"
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    phone: "+1 (555) 567-8901",
    department: "HR",
    position: "HR Specialist",
    status: "Active",
    leaveBalance: { annual: 16, sick: 6, personal: 3 },
    joinDate: "2022-07-18",
    location: "Chicago, IL"
  },
  {
    id: "6",
    name: "James Taylor",
    email: "james.taylor@company.com",
    phone: "+1 (555) 678-9012",
    department: "Finance",
    position: "Financial Analyst",
    status: "Remote",
    leaveBalance: { annual: 13, sick: 8, personal: 5 },
    joinDate: "2021-11-30",
    location: "Boston, MA"
  },
  {
    id: "7",
    name: "Rachel Green",
    email: "rachel.green@company.com",
    phone: "+1 (555) 789-0123",
    department: "Engineering",
    position: "Backend Developer",
    status: "Active",
    leaveBalance: { annual: 17, sick: 9, personal: 4 },
    joinDate: "2023-02-14",
    location: "Denver, CO"
  },
  {
    id: "8",
    name: "Alex Thompson",
    email: "alex.thompson@company.com",
    phone: "+1 (555) 890-1234",
    department: "Design",
    position: "UI Designer",
    status: "Active",
    leaveBalance: { annual: 14, sick: 7, personal: 3 },
    joinDate: "2022-09-05",
    location: "Portland, OR"
  }
];

// Analytics Data
export const analyticsData = {
  monthlyTrends: [
    { month: 'Jan', Annual: 4, Sick: 2, Personal: 1, Emergency: 0 },
    { month: 'Feb', Annual: 3, Sick: 3, Personal: 2, Emergency: 1 },
    { month: 'Mar', Annual: 5, Sick: 1, Personal: 2, Emergency: 0 },
    { month: 'Apr', Annual: 8, Sick: 4, Personal: 3, Emergency: 1 },
    { month: 'May', Annual: 6, Sick: 2, Personal: 4, Emergency: 0 },
    { month: 'Jun', Annual: 7, Sick: 3, Personal: 2, Emergency: 2 },
    { month: 'Jul', Annual: 9, Sick: 1, Personal: 3, Emergency: 1 },
    { month: 'Aug', Annual: 5, Sick: 2, Personal: 2, Emergency: 0 },
  ],
  leaveTypeDistribution: [
    { name: 'Annual Leave', value: 47, fill: '#3b82f6' },
    { name: 'Sick Leave', value: 18, fill: '#ef4444' },
    { name: 'Personal Leave', value: 19, fill: '#8b5cf6' },
    { name: 'Emergency Leave', value: 5, fill: '#f59e0b' },
  ],
  departmentUtilization: [
    { department: 'Engineering', available: 85, onLeave: 15 },
    { department: 'Design', available: 92, onLeave: 8 },
    { department: 'Marketing', available: 78, onLeave: 22 },
    { department: 'Sales', available: 88, onLeave: 12 },
    { department: 'HR', available: 95, onLeave: 5 },
    { department: 'Finance', available: 90, onLeave: 10 },
  ],
  yearlyTrends: [
    { year: '2021', totalLeaves: 180, avgDays: 3.2 },
    { year: '2022', totalLeaves: 195, avgDays: 3.5 },
    { year: '2023', totalLeaves: 210, avgDays: 3.8 },
    { year: '2024', totalLeaves: 225, avgDays: 4.1 },
  ]
};

// Dashboard Service
export class DashboardService {
  static getDashboardStats(): DashboardStats {
    const totalRequests = mockLeaveRequests.length;
    const pendingApprovals = mockLeaveRequests.filter(req => req.status === 'pending').length;
    const approvedThisMonth = mockLeaveRequests.filter(req => 
      req.status === 'approved' && 
      new Date(req.approvedDate || req.submittedDate).getMonth() === new Date().getMonth()
    ).length;
    
    const totalEmployees = mockEmployees.length;
    const activeEmployees = mockEmployees.filter(emp => emp.status === 'Active').length;
    const teamAvailability = Math.round((activeEmployees / totalEmployees) * 100);
    
    return {
      totalRequests,
      pendingApprovals,
      approvedThisMonth,
      teamAvailability,
      totalEmployees,
      onLeaveToday: mockEmployees.filter(emp => emp.status === 'On Leave').length,
      returningToday: 3, // Mock data
      upcomingLeaves: 7, // Mock data
    };
  }

  static getPendingRequests(): LeaveRequest[] {
    return mockLeaveRequests.filter(req => req.status === 'pending');
  }

  static getAllRequests(): LeaveRequest[] {
    return mockLeaveRequests;
  }

  static getRequestsByStatus(status: 'pending' | 'approved' | 'rejected'): LeaveRequest[] {
    return mockLeaveRequests.filter(req => req.status === status);
  }

  static getEmployees(): Employee[] {
    return mockEmployees;
  }

  static getEmployeesByDepartment(department: string): Employee[] {
    return mockEmployees.filter(emp => emp.department === department);
  }

  static getEmployeesByStatus(status: 'Active' | 'On Leave' | 'Remote'): Employee[] {
    return mockEmployees.filter(emp => emp.status === status);
  }

  static getDepartments(): string[] {
    return [...new Set(mockEmployees.map(emp => emp.department))];
  }

  static getAnalyticsData() {
    return analyticsData;
  }

  // Simulated API methods
  static async approveRequest(requestId: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const requestIndex = mockLeaveRequests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
      mockLeaveRequests[requestIndex].status = 'approved';
      mockLeaveRequests[requestIndex].approvedDate = new Date().toISOString();
      mockLeaveRequests[requestIndex].approvedBy = 'Current Admin';
      return true;
    }
    return false;
  }

  static async rejectRequest(requestId: string, reason: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const requestIndex = mockLeaveRequests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
      mockLeaveRequests[requestIndex].status = 'rejected';
      mockLeaveRequests[requestIndex].rejectedDate = new Date().toISOString();
      mockLeaveRequests[requestIndex].rejectedBy = 'Current Admin';
      mockLeaveRequests[requestIndex].rejectionReason = reason;
      return true;
    }
    return false;
  }

  static async bulkApproveRequests(requestIds: string[]): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    requestIds.forEach(id => {
      const requestIndex = mockLeaveRequests.findIndex(req => req.id === id);
      if (requestIndex !== -1) {
        mockLeaveRequests[requestIndex].status = 'approved';
        mockLeaveRequests[requestIndex].approvedDate = new Date().toISOString();
        mockLeaveRequests[requestIndex].approvedBy = 'Current Admin';
      }
    });
    
    return true;
  }
}
