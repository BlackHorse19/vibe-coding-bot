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

class EmployeeDataService {
  private employees: Employee[] = [];
  private isLoaded = false;

  async loadEmployeeData(): Promise<Employee[]> {
    if (this.isLoaded) {
      return this.employees;
    }

    try {
      const response = await fetch('/dummydata/employee_data.csv');
      const csvText = await response.text();

      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Convert leave fields to numbers
          if (['Sick_Leave', 'Casual_Leave', 'Earned_Leave'].includes(field)) {
            return parseInt(value) || 0;
          }
          return value;
        }
      });

      this.employees = result.data as Employee[];
      this.isLoaded = true;
      return this.employees;
    } catch (error) {
      console.error('Error loading employee data:', error);
      return [];
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
}

export const employeeDataService = new EmployeeDataService();
