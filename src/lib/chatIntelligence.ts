import { Employee, employeeDataService } from './data';

export interface ChatContext {
  currentEmployee: Employee | null;
  conversationState: 'initial' | 'waiting_for_name' | 'waiting_for_leave_type' | 'waiting_for_days' | 'waiting_for_dates' | 'waiting_for_reason';
  pendingLeaveType: string | null;
  pendingDays: number | null;
  pendingDates: string | null;
  pendingReason: string | null;
}

export interface ChatResponse {
  message: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: "default" | "outline" | "secondary";
  }>;
  status?: "pending" | "approved" | "rejected";
}

export class ChatIntelligence {
  private context: ChatContext = {
    currentEmployee: null,
    conversationState: 'initial',
    pendingLeaveType: null,
    pendingDays: null,
    pendingDates: null,
    pendingReason: null
  };

  resetContext() {
    this.context = {
      currentEmployee: null,
      conversationState: 'initial',
      pendingLeaveType: null,
      pendingDays: null,
      pendingDates: null,
      pendingReason: null
    };
  }

  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('balance') || lowerMessage.includes('remaining') || lowerMessage.includes('how many days')) {
      return 'balance';
    }

    if (lowerMessage.includes('apply') || lowerMessage.includes('request') || lowerMessage.includes('take leave')) {
      return 'apply';
    }

    if (lowerMessage.includes('team') || lowerMessage.includes('statistics') || lowerMessage.includes('overview')) {
      return 'team';
    }

    if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('lookup')) {
      return 'search';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return 'help';
    }

    return 'unknown';
  }

  private extractEmployeeName(message: string): string | null {
    // Simple name extraction - look for common patterns
    const words = message.split(' ');
    const potentialNames = words.filter(word =>
      word.length > 2 &&
      /^[A-Za-z]+$/.test(word) &&
      word.charAt(0) === word.charAt(0).toUpperCase()
    );

    if (potentialNames.length >= 2) {
      return potentialNames.slice(0, 2).join(' ');
    }

    return null;
  }

  private extractLeaveType(message: string): string | null {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('sick')) {
      return 'sick leave';
    }

    if (lowerMessage.includes('casual')) {
      return 'casual leave';
    }

    if (lowerMessage.includes('earned') || lowerMessage.includes('annual')) {
      return 'earned leave';
    }

    return null;
  }

  private extractLeaveDays(message: string): number | null {
    const numbers = message.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const num = parseInt(numbers[0]);
      if (num > 0 && num <= 30) {
        return num;
      }
    }
    return null;
  }

  async generateResponse(userMessage: string): Promise<ChatResponse> {
    const intent = this.detectIntent(userMessage);

    switch (intent) {
      case 'balance':
        return this.handleBalanceRequest(userMessage);

      case 'apply':
        return this.handleLeaveApplication(userMessage);

      case 'team':
        return this.handleTeamRequest();

      case 'search':
        return this.handleSearchRequest(userMessage);

      case 'help':
        return this.handleHelpRequest();

      default:
        return this.handleUnknownIntent(userMessage);
    }
  }

  private async handleBalanceRequest(message: string): Promise<ChatResponse> {
    // Check if we already have an employee in context
    if (!this.context.currentEmployee) {
      const extractedName = this.extractEmployeeName(message);
      if (extractedName) {
        const employee = employeeDataService.findEmployeeByName(extractedName);
        if (employee) {
          this.context.currentEmployee = employee;
          return this.generateBalanceResponse(employee);
        }
      }

      this.context.conversationState = 'waiting_for_name';
      return {
        message: "I'd be happy to check your leave balance! What's your name?"
      };
    }

    return this.generateBalanceResponse(this.context.currentEmployee);
  }

  private async handleLeaveApplication(message: string): Promise<ChatResponse> {
    // Check if we have an employee
    if (!this.context.currentEmployee) {
      const extractedName = this.extractEmployeeName(message);
      if (extractedName) {
        const employee = employeeDataService.findEmployeeByName(extractedName);
        if (employee) {
          this.context.currentEmployee = employee;
        }
      }

      if (!this.context.currentEmployee) {
        this.context.conversationState = 'waiting_for_name';
        return {
          message: "I can help you apply for leave! What's your name?"
        };
      }
    }

    // Check if we have a leave type
    if (!this.context.pendingLeaveType) {
      const extractedType = this.extractLeaveType(message);
      if (extractedType) {
        this.context.pendingLeaveType = extractedType;
      } else {
        this.context.conversationState = 'waiting_for_leave_type';
        return {
          message: `Hi ${this.context.currentEmployee!.Name}! What type of leave would you like to apply for?`,
          actions: [
            { label: "Sick Leave", action: () => this.setPendingLeaveType("sick leave"), variant: "outline" },
            { label: "Casual Leave", action: () => this.setPendingLeaveType("casual leave"), variant: "outline" },
            { label: "Earned Leave", action: () => this.setPendingLeaveType("earned leave"), variant: "outline" }
          ]
        };
      }
    }

    // Check if we have number of days
    if (!this.context.pendingDays) {
      const extractedDays = this.extractLeaveDays(message);
      if (extractedDays) {
        this.context.pendingDays = extractedDays;
        return this.validateAndProcessLeaveRequest();
      } else {
        this.context.conversationState = 'waiting_for_days';
        return {
          message: `How many days of ${this.context.pendingLeaveType} would you like to apply for?`
        };
      }
    }

    return this.validateAndProcessLeaveRequest();
  }

  private async handleTeamRequest(): Promise<ChatResponse> {
    const stats = employeeDataService.getTeamStats();
    return {
      message: `Here's the team overview:\n\n` +
        `• Total Employees: ${stats.totalEmployees}\n` +
        `• Average Sick Leave Remaining: ${stats.avgSickLeave} days\n` +
        `• Average Casual Leave Remaining: ${stats.avgCasualLeave} days\n` +
        `• Average Earned Leave Remaining: ${stats.avgEarnedLeave} days\n\n` +
        `Would you like to see individual employee details or apply for leave?`
    };
  }

  private async handleSearchRequest(message: string): Promise<ChatResponse> {
    const searchTerm = message.replace(/find|search|lookup/gi, '').trim();
    if (searchTerm) {
      const results = employeeDataService.searchEmployees(searchTerm);
      if (results.length > 0) {
        const employeeList = results.slice(0, 5).map(emp =>
          `• ${emp.Name} (${emp.Email})`
        ).join('\n');

        return {
          message: `Found ${results.length} employee(s):\n\n${employeeList}\n\nWould you like to check their leave balance or apply for leave?`
        };
      } else {
        return {
          message: `No employees found matching "${searchTerm}". Please try a different search term.`
        };
      }
    }

    return {
      message: "Who would you like to search for? Please provide a name or email."
    };
  }

  private handleHelpRequest(): ChatResponse {
    return {
      message: "I'm your Leave Management Assistant! Here's what I can help you with:\n\n" +
        "• Check leave balance (just tell me your name)\n" +
        "• Apply for leave (sick, casual, or earned)\n" +
        "• View team statistics\n" +
        "• Search for employees\n" +
        "• Get help with any leave-related questions\n\n" +
        "What would you like to do?"
    };
  }

  private handleUnknownIntent(message: string): ChatResponse {
    if (this.context.conversationState === 'waiting_for_name') {
      const employee = employeeDataService.findEmployeeByName(message);
      if (employee) {
        this.context.currentEmployee = employee;
        this.context.conversationState = 'initial';
        return this.generateBalanceResponse(employee);
      } else {
        return {
          message: `I couldn't find an employee named "${message}". Please check the spelling or try searching for your name.`
        };
      }
    }

    if (this.context.conversationState === 'waiting_for_leave_type') {
      const leaveType = this.extractLeaveType(message);
      if (leaveType) {
        this.context.pendingLeaveType = leaveType;
        this.context.conversationState = 'waiting_for_days';
        return {
          message: `Great! You've selected ${leaveType}. How many days would you like to apply for?`
        };
      } else {
        return {
          message: "Please specify the type of leave: Sick Leave, Casual Leave, or Earned Leave."
        };
      }
    }

    if (this.context.conversationState === 'waiting_for_days') {
      const days = this.extractLeaveDays(message);
      if (days) {
        this.context.pendingDays = days;
        return this.validateAndProcessLeaveRequest();
      } else {
        return {
          message: "Please specify the number of days you'd like to apply for (e.g., 3 days)."
        };
      }
    }

    return {
      message: "I'm not sure I understand. You can ask me to:\n" +
        "• Check your leave balance\n" +
        "• Apply for leave\n" +
        "• View team statistics\n" +
        "• Search for employees\n" +
        "• Get help\n\n" +
        "What would you like to do?"
    };
  }

  private generateBalanceResponse(employee: Employee): ChatResponse {
    return {
      message: `Hi ${employee.Name}! Here's your current leave balance:\n\n` +
        `• Sick Leave: ${employee.Sick_Leave} days remaining\n` +
        `• Casual Leave: ${employee.Casual_Leave} days remaining\n` +
        `• Earned Leave: ${employee.Earned_Leave} days remaining\n\n` +
        `Would you like to apply for any leave?`
    };
  }

  private validateAndProcessLeaveRequest(): ChatResponse {
    if (!this.context.currentEmployee || !this.context.pendingLeaveType || !this.context.pendingDays) {
      return {
        message: "I need more information to process your leave request. Please provide your name, leave type, and number of days."
      };
    }

    const validation = employeeDataService.validateLeaveRequest(
      this.context.currentEmployee,
      this.context.pendingLeaveType,
      this.context.pendingDays
    );

    if (validation.isValid) {
      // Reset context after successful application
      this.resetContext();
      return {
        message: `✅ Leave application submitted successfully!\n\n` +
          `Employee: ${this.context.currentEmployee.Name}\n` +
          `Leave Type: ${this.context.pendingLeaveType}\n` +
          `Days: ${this.context.pendingDays}\n` +
          `Remaining Balance: ${validation.available - this.context.pendingDays} days\n\n` +
          `Your request has been submitted for approval. You'll receive a notification once it's processed.`,
        status: "pending"
      };
    } else {
      return {
        message: validation.message,
        status: "rejected"
      };
    }
  }

  private setPendingLeaveType(leaveType: string) {
    this.context.pendingLeaveType = leaveType;
    this.context.conversationState = 'waiting_for_days';
  }
}

export const chatIntelligence = new ChatIntelligence();
