import Papa from 'papaparse';

export interface Employee {
  Employee_ID: string;
  Name: string;
  Email: string;
  Sick_Leave: number;
  Casual_Leave: number;
  Earned_Leave: number;
}

export interface LeaveBalance {
  sick: number;
  casual: number;
  earned: number;
}

export interface TeamStats {
  totalEmployees: number;
  avgSickLeave: number;
  avgCasualLeave: number;
  avgEarnedLeave: number;
}

export interface LeaveApplication {
  Application_ID: string;
  Employee_ID: string;
  Employee_Name: string;
  Employee_Email: string;
  Leave_Type: string;
  Start_Date: string;
  End_Date: string;
  Days_Requested: number;
  Reason: string;
  Application_Date: string;
  Status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  Approved_By?: string;
  Approved_Date?: string;
  Manager_Comments?: string;
  Emergency: boolean;
  Department?: string;
  Remaining_Balance_Before: number;
  Remaining_Balance_After?: number;
}

class EmployeeDataService {
  private employees: Employee[] = [];
  private leaveApplications: LeaveApplication[] = [];
  private isLoaded = false;
  private applicationsLoaded = false;

  async loadEmployeeData(): Promise<Employee[]> {
    if (this.isLoaded) {
      return this.employees;
    }

    try {
      // Add cache busting parameter
      const timestamp = Date.now();
      const response = await fetch(`/dummydata/employee_data.csv?t=${timestamp}`);
      const csvText = await response.text();

      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Convert leave fields to numbers
          if (['Sick_Leave', 'Casual_Leave', 'Earned_Leave'].includes(field as string)) {
            return parseInt(value) || 0;
          }
          return value;
        }
      });

      this.employees = result.data as Employee[];
      this.isLoaded = true;
      console.log('✅ Employee data loaded:', this.employees.length, 'employees');
      return this.employees;
    } catch (error) {
      console.error('Error loading employee data:', error);
      return [];
    }
  }

  // Leave Applications Management
  async loadLeaveApplications(): Promise<LeaveApplication[]> {
    if (this.applicationsLoaded) {
      return this.leaveApplications;
    }

    try {
      // First, load from the CSV file with cache busting
      const timestamp = Date.now();
      const response = await fetch(`/dummydata/leave_applications.csv?t=${timestamp}`);
      const csvText = await response.text();

      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Convert specific fields to appropriate types
          if (field === 'Days_Requested' || field === 'Remaining_Balance_Before' || field === 'Remaining_Balance_After') {
            return parseInt(value) || 0;
          }
          if (field === 'Emergency') {
            return value.toLowerCase() === 'true';
          }
          return value;
        }
      });

      let fileApplications = result.data as LeaveApplication[];

      // Then, check if we have newer data in localStorage (from recent submissions)
      const localStorageData = localStorage.getItem('leaveApplicationsData');
      if (localStorageData) {
        try {
          const localApplications = JSON.parse(localStorageData) as LeaveApplication[];
          
          // Merge data - keep file data and add any new applications from localStorage
          const fileAppIds = new Set(fileApplications.map(app => app.Application_ID));
          const newApplications = localApplications.filter(app => !fileAppIds.has(app.Application_ID));
          
          this.leaveApplications = [...fileApplications, ...newApplications];
          
          if (newApplications.length > 0) {
            console.log(`✅ Loaded ${fileApplications.length} applications from CSV file`);
            console.log(`✅ Added ${newApplications.length} new applications from localStorage`);
          } else {
            console.log(`✅ Loaded ${fileApplications.length} applications from CSV file`);
          }
        } catch (error) {
          console.warn('Error parsing localStorage data, using file data only:', error);
          this.leaveApplications = fileApplications;
        }
      } else {
        this.leaveApplications = fileApplications;
        console.log(`✅ Loaded ${fileApplications.length} applications from CSV file`);
      }

      console.log('📋 Sample leave application:', this.leaveApplications[0]);
      this.applicationsLoaded = true;
      return this.leaveApplications;
    } catch (error) {
      console.error('Error loading leave applications:', error);
      this.leaveApplications = [];
      this.applicationsLoaded = true;
      return [];
    }
  }

  async submitLeaveApplication(applicationData: {
    employee: Employee;
    leaveType: string;
    days: number;
    startDate: string;
    endDate?: string;
    reason?: string;
    isEmergency?: boolean;
  }): Promise<{ success: boolean; application?: LeaveApplication; message: string }> {
    try {
      // Validate the leave request first
      const validation = this.validateLeaveRequest(applicationData.employee, applicationData.leaveType, applicationData.days);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Generate unique application ID
      const applicationId = `APP${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      
      // Calculate end date if not provided
      const startDate = new Date(applicationData.startDate);
      const endDate = applicationData.endDate || this.calculateEndDate(startDate, applicationData.days);
      
      // Create the leave application
      const newApplication: LeaveApplication = {
        Application_ID: applicationId,
        Employee_ID: applicationData.employee.Employee_ID,
        Employee_Name: applicationData.employee.Name,
        Employee_Email: applicationData.employee.Email,
        Leave_Type: applicationData.leaveType,
        Start_Date: applicationData.startDate,
        End_Date: endDate,
        Days_Requested: applicationData.days,
        Reason: applicationData.reason || '',
        Application_Date: new Date().toISOString().split('T')[0],
        Status: 'Pending',
        Emergency: applicationData.isEmergency || false,
        Department: 'General', // Default department
        Remaining_Balance_Before: validation.available,
        Remaining_Balance_After: validation.available - applicationData.days
      };

      // Add to local array
      await this.loadLeaveApplications();
      this.leaveApplications.push(newApplication);

      // Save to CSV file
      await this.saveLeaveApplicationsToCSV();

      return {
        success: true,
        application: newApplication,
        message: `Leave application submitted successfully! Application ID: ${applicationId}`
      };
    } catch (error) {
      console.error('Error submitting leave application:', error);
      return {
        success: false,
        message: 'Failed to submit leave application. Please try again.'
      };
    }
  }

  private calculateEndDate(startDate: Date, days: number): string {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);
    return endDate.toISOString().split('T')[0];
  }

  private async saveLeaveApplicationsToCSV(): Promise<void> {
    try {
      // Convert applications to CSV format
      const csvData = Papa.unparse(this.leaveApplications, {
        header: true,
        columns: [
          'Application_ID', 'Employee_ID', 'Employee_Name', 'Employee_Email',
          'Leave_Type', 'Start_Date', 'End_Date', 'Days_Requested', 'Reason',
          'Application_Date', 'Status', 'Approved_By', 'Approved_Date',
          'Manager_Comments', 'Emergency', 'Department', 'Remaining_Balance_Before',
          'Remaining_Balance_After'
        ]
      });

      // Store in localStorage for demo purposes (since browsers can't write to files directly)
      localStorage.setItem('leaveApplicationsCSV', csvData);
      localStorage.setItem('leaveApplicationsData', JSON.stringify(this.leaveApplications));
      
      console.log('✅ Leave applications saved to localStorage');
      console.log('📝 CSV Data that would be saved to file:');
      console.log(csvData);
      
      // Note: In a real application with a backend, you would send this to an API:
      // await fetch('/api/save-leave-applications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'text/csv' },
      //   body: csvData
      // });
      
    } catch (error) {
      console.error('Error saving leave applications to CSV:', error);
      throw error;
    }
  }

  // Method to download the updated CSV file
  downloadUpdatedCSV(): void {
    try {
      const csvData = localStorage.getItem('leaveApplicationsCSV');
      if (!csvData) {
        console.warn('No CSV data found in localStorage');
        return;
      }

      // Create blob and download link
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leave_applications_updated_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV file download initiated');
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  }

  findEmployeeByName(name: string): Employee | null {
    const searchName = name.toLowerCase().trim();
    return this.employees.find(emp =>
      emp.Name.toLowerCase().includes(searchName) ||
      emp.Name.toLowerCase().startsWith(searchName) ||
      emp.Name.toLowerCase().endsWith(searchName)
    ) || null;
  }

  findEmployeeByEmail(email: string): Employee | null {
    const searchEmail = email.toLowerCase().trim();
    return this.employees.find(emp =>
      emp.Email.toLowerCase().includes(searchEmail)
    ) || null;
  }

  findEmployeeById(id: string): Employee | null {
    return this.employees.find(emp => emp.Employee_ID === id) || null;
  }

  calculateRemainingLeave(employee: Employee, leaveType: string): number {
    switch (leaveType.toLowerCase()) {
      case 'sick':
      case 'sick leave':
        return employee.Sick_Leave;
      case 'casual':
      case 'casual leave':
        return employee.Casual_Leave;
      case 'earned':
      case 'earned leave':
        return employee.Earned_Leave;
      default:
        return 0;
    }
  }

  validateLeaveRequest(employee: Employee, leaveType: string, days: number): {
    isValid: boolean;
    available: number;
    message: string;
  } {
    const available = this.calculateRemainingLeave(employee, leaveType);

    if (days <= 0) {
      return {
        isValid: false,
        available,
        message: 'Please specify a valid number of days (greater than 0).'
      };
    }

    if (days > available) {
      return {
        isValid: false,
        available,
        message: `You only have ${available} days of ${leaveType} remaining. Please adjust your request.`
      };
    }

    return {
      isValid: true,
      available,
      message: `Your request for ${days} days of ${leaveType} is valid. You will have ${available - days} days remaining.`
    };
  }

  getTeamStats(): TeamStats {
    if (this.employees.length === 0) {
      return {
        totalEmployees: 0,
        avgSickLeave: 0,
        avgCasualLeave: 0,
        avgEarnedLeave: 0
      };
    }

    const totalSick = this.employees.reduce((sum, emp) => sum + emp.Sick_Leave, 0);
    const totalCasual = this.employees.reduce((sum, emp) => sum + emp.Casual_Leave, 0);
    const totalEarned = this.employees.reduce((sum, emp) => sum + emp.Earned_Leave, 0);

    return {
      totalEmployees: this.employees.length,
      avgSickLeave: Math.round((totalSick / this.employees.length) * 10) / 10,
      avgCasualLeave: Math.round((totalCasual / this.employees.length) * 10) / 10,
      avgEarnedLeave: Math.round((totalEarned / this.employees.length) * 10) / 10
    };
  }

  getAllEmployees(): Employee[] {
    return [...this.employees];
  }

  searchEmployees(query: string): Employee[] {
    const searchQuery = query.toLowerCase().trim();
    return this.employees.filter(emp =>
      emp.Name.toLowerCase().includes(searchQuery) ||
      emp.Email.toLowerCase().includes(searchQuery)
    );
  }

  getAllLeaveApplications(): LeaveApplication[] {
    return [...this.leaveApplications];
  }

  getLeaveApplicationsByEmployee(employeeId: string): LeaveApplication[] {
    return this.leaveApplications.filter(app => app.Employee_ID === employeeId);
  }

  getLeaveApplicationsByStatus(status: LeaveApplication['Status']): LeaveApplication[] {
    return this.leaveApplications.filter(app => app.Status === status);
  }

  async approveLeaveApplication(applicationId: string, approvedBy: string, comments?: string): Promise<{ success: boolean; message: string }> {
    try {
      const application = this.leaveApplications.find(app => app.Application_ID === applicationId);
      if (!application) {
        return { success: false, message: 'Application not found' };
      }

      if (application.Status !== 'Pending') {
        return { success: false, message: 'Application has already been processed' };
      }

      // Update application status
      application.Status = 'Approved';
      application.Approved_By = approvedBy;
      application.Approved_Date = new Date().toISOString().split('T')[0];
      application.Manager_Comments = comments || '';

      // Update employee leave balance
      const employee = this.findEmployeeById(application.Employee_ID);
      if (employee) {
        this.updateEmployeeLeaveBalance(employee, application.Leave_Type, application.Days_Requested);
      }

      // Save changes
      await this.saveLeaveApplicationsToCSV();

      return { success: true, message: 'Leave application approved successfully' };
    } catch (error) {
      console.error('Error approving leave application:', error);
      return { success: false, message: 'Failed to approve leave application' };
    }
  }

  async rejectLeaveApplication(applicationId: string, rejectedBy: string, rejectionReason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const application = this.leaveApplications.find(app => app.Application_ID === applicationId);
      if (!application) {
        return { success: false, message: 'Application not found' };
      }

      if (application.Status !== 'Pending') {
        return { success: false, message: 'Application has already been processed' };
      }

      // Update application status
      application.Status = 'Rejected';
      application.Approved_By = rejectedBy;
      application.Approved_Date = new Date().toISOString().split('T')[0];
      application.Manager_Comments = rejectionReason || 'Rejected from dashboard';

      // Save changes
      await this.saveLeaveApplicationsToCSV();

      return { success: true, message: 'Leave application rejected successfully' };
    } catch (error) {
      console.error('Error rejecting leave application:', error);
      return { success: false, message: 'Failed to reject leave application' };
    }
  }

  async updateLeaveApplicationStatus(
    applicationId: string, 
    status: 'Approved' | 'Rejected' | 'Pending',
    approvedBy: string, 
    comments?: string
  ): Promise<boolean> {
    try {
      // Find and update the application
      const applicationIndex = this.leaveApplications.findIndex(app => app.Application_ID === applicationId);
      
      if (applicationIndex === -1) {
        console.error('Application not found:', applicationId);
        return false;
      }

      // Update the application
      this.leaveApplications[applicationIndex] = {
        ...this.leaveApplications[applicationIndex],
        Status: status,
        Approved_By: approvedBy,
        Approved_Date: new Date().toISOString().split('T')[0],
        Manager_Comments: comments || ''
      };

      // Save to localStorage and CSV
      await this.saveLeaveApplicationsToCSV();
      
      console.log(`✅ Application ${applicationId} ${status.toLowerCase()}`);
      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  }

  private updateEmployeeLeaveBalance(employee: Employee, leaveType: string, days: number): void {
    switch (leaveType.toLowerCase()) {
      case 'sick':
      case 'sick leave':
      case 'sick_leave':
        employee.Sick_Leave = Math.max(0, employee.Sick_Leave - days);
        break;
      case 'casual':
      case 'casual leave':
      case 'casual_leave':
        employee.Casual_Leave = Math.max(0, employee.Casual_Leave - days);
        break;
      case 'earned':
      case 'earned leave':
      case 'earned_leave':
        employee.Earned_Leave = Math.max(0, employee.Earned_Leave - days);
        break;
    }
  }

  getLeaveApplicationStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    thisMonth: number;
  } {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return {
      total: this.leaveApplications.length,
      pending: this.leaveApplications.filter(app => app.Status === 'Pending').length,
      approved: this.leaveApplications.filter(app => app.Status === 'Approved').length,
      rejected: this.leaveApplications.filter(app => app.Status === 'Rejected').length,
      thisMonth: this.leaveApplications.filter(app => {
        const appDate = new Date(app.Application_Date);
        return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
      }).length
    };
  }

  async getPendingApplications(): Promise<LeaveApplication[]> {
    await this.loadLeaveApplications();
    return this.getLeaveApplicationsByStatus('Pending');
  }

  // Convert LeaveApplication to dashboard format
  convertToDashboardFormat(applications: LeaveApplication[]): any[] {
    return applications.map(app => ({
      id: app.Application_ID,
      employeeName: app.Employee_Name,
      leaveType: app.Leave_Type === 'Sick Leave' ? 'Sick' : 
                app.Leave_Type === 'Casual Leave' ? 'Personal' :
                app.Leave_Type === 'Earned Leave' ? 'Annual' : 'Emergency',
      startDate: app.Start_Date,
      endDate: app.End_Date,
      days: app.Days_Requested,
      reason: app.Reason,
      submittedDate: app.Application_Date,
      department: app.Department || 'General',
      status: app.Status.toLowerCase(),
      emergency: app.Emergency
    }));
  }

  // Force reload all data (clear cache)
  forceReload(): void {
    this.isLoaded = false;
    this.applicationsLoaded = false;
    this.employees = [];
    this.leaveApplications = [];
    localStorage.removeItem('leaveApplicationsData');
    console.log('🔄 Force reload: All cached data cleared');
  }

  // Force reload only employee data (preserve leave applications in localStorage)
  forceReloadEmployees(): void {
    this.isLoaded = false;
    this.employees = [];
    console.log('🔄 Force reload: Employee data cache cleared');
  }

  // Force reload only leave applications data
  forceReloadApplications(): void {
    this.applicationsLoaded = false;
    this.leaveApplications = [];
    console.log('🔄 Force reload: Leave applications cache cleared');
  }
}

export const employeeDataService = new EmployeeDataService();
