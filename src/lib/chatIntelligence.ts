import { Employee, employeeDataService } from './data';

export interface ChatContext {
  currentEmployee: Employee | null;
  conversationState: 'initial' | 'waiting_for_name' | 'waiting_for_leave_type' | 'waiting_for_days' | 'waiting_for_dates' | 'waiting_for_reason' | 'waiting_for_confirmation';
  pendingLeaveType: string | null;
  pendingDays: number | null;
  pendingStartDate: string | null;
  pendingEndDate: string | null;
  pendingReason: string | null;
  conversationHistory: string[];
  userSentiment: 'positive' | 'neutral' | 'negative';
  lastInteraction: Date;
}

export interface ChatResponse {
  message: string;
  actions?: Array<{
    label: string;
    action: () => void | Promise<ChatResponse>;
    variant?: "default" | "outline" | "secondary";
  }>;
  status?: "pending" | "approved" | "rejected";
  showCalendar?: boolean;
}

export class ChatIntelligence {
  private context: ChatContext = {
    currentEmployee: null,
    conversationState: 'initial',
    pendingLeaveType: null,
    pendingDays: null,
    pendingStartDate: null,
    pendingEndDate: null,
    pendingReason: null,
    conversationHistory: [],
    userSentiment: 'neutral',
    lastInteraction: new Date()
  };

  resetContext(): ChatResponse {
    this.clearContext();
    return this.handleGreeting();
  }

  private clearContext(): void {
    this.context = {
      currentEmployee: null,
      conversationState: 'initial',
      pendingLeaveType: null,
      pendingDays: null,
      pendingStartDate: null,
      pendingEndDate: null,
      pendingReason: null,
      conversationHistory: [],
      userSentiment: 'neutral',
      lastInteraction: new Date()
    };
  }

  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced intent detection with synonyms and variations
    const intents = {
      balance: [
        'balance', 'remaining', 'how many days', 'days left', 'available',
        'check', 'status', 'quota', 'entitlement', 'allowance'
      ],
      apply: [
        'apply', 'request', 'take leave', 'need leave', 'want leave',
        'book leave', 'schedule leave', 'planning leave', 'going on leave'
      ],
      team: [
        'team', 'statistics', 'overview', 'dashboard', 'stats',
        'department', 'group', 'colleagues', 'everyone'
      ],
      search: [
        'find', 'search', 'lookup', 'locate', 'who is', 'contact',
        'employee', 'staff', 'person', 'colleague'
      ],
      help: [
        'help', 'what can you do', 'commands', 'options', 'features',
        'assistance', 'support', 'guide', 'how to'
      ],
      cancel: [
        'cancel', 'stop', 'abort', 'quit', 'exit', 'never mind',
        'forget it', 'start over'
      ],
      greeting: [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon',
        'good evening', 'greetings'
      ]
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }

    return 'unknown';
  }

  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const lowerMessage = message.toLowerCase();
    
    const positiveWords = [
      'thank', 'thanks', 'great', 'good', 'excellent', 'awesome',
      'perfect', 'wonderful', 'amazing', 'helpful', 'please'
    ];
    
    const negativeWords = [
      'urgent', 'emergency', 'sick', 'problem', 'issue', 'error',
      'wrong', 'bad', 'terrible', 'frustrated', 'angry', 'upset'
    ];

    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractDates(message: string): { startDate: string | null, endDate: string | null } {
    const datePatterns = [
      // DD/MM/YYYY format (prioritized)
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      // MM/DD/YYYY or DD-MM-YYYY
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
      // Month Day, Year
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi,
      // DD Month YYYY
      /\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/gi,
      // Today, tomorrow, next week
      /(today|tomorrow|next\s+week|next\s+monday|next\s+tuesday|next\s+wednesday|next\s+thursday|next\s+friday)/gi
    ];

    const dates: string[] = [];
    
    // Check for date range patterns first (e.g., "15/08/2025 to 18/08/2025")
    const rangePattern = /(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:to|until|-)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;
    const rangeMatch = message.match(rangePattern);
    if (rangeMatch) {
      return {
        startDate: rangeMatch[1],
        endDate: rangeMatch[2]
      };
    }

    // If no range found, look for individual dates
    for (const pattern of datePatterns) {
      const matches = message.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    }

    return {
      startDate: dates[0] || null,
      endDate: dates[1] || dates[0] || null
    };
  }

  private calculateLeaveDays(startDate: string, endDate: string): number {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return 1;
    }
  }

  private generatePersonalizedGreeting(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Good morning!';
    else if (hour < 17) return 'Good afternoon!';
    else return 'Good evening!';
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

  private extractEmployeeId(message: string): string | null {
    // Look for employee ID patterns like EMP001, E001, ID123, etc.
    const empIdPattern = /(?:EMP|E|ID)?(\d{3,})/i;
    const match = message.match(empIdPattern);
    return match ? match[0] : null;
  }

  private findEmployeeByIdOrName(message: string): any | null {
    // First try to find by Employee ID
    const empId = this.extractEmployeeId(message);
    if (empId) {
      const employee = employeeDataService.findEmployeeById(empId);
      if (employee) return employee;
    }

    // If not found by ID, try by name
    const name = this.extractEmployeeName(message);
    if (name) {
      return employeeDataService.findEmployeeByName(name);
    }

    // If still not found, try direct search (handles partial names, emails, etc.)
    const results = employeeDataService.searchEmployees(message);
    return results.length > 0 ? results[0] : null;
  }

  async generateResponse(userMessage: string): Promise<ChatResponse> {
    // Update conversation context
    this.context.conversationHistory.push(userMessage);
    this.context.userSentiment = this.analyzeSentiment(userMessage);
    this.context.lastInteraction = new Date();

    // Keep conversation history manageable
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-10);
    }

    const intent = this.detectIntent(userMessage);

    switch (intent) {
      case 'greeting':
        return this.handleGreeting();

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

      case 'cancel':
        return this.handleCancelRequest();

      default:
        return await this.handleUnknownIntent(userMessage);
    }
  }

  private handleGreeting(): ChatResponse {
    const greeting = this.generatePersonalizedGreeting();
    return {
      message: `${greeting} I can help you check leave balances, apply for leave, view team stats, or find employees. What do you need?`,
      actions: [
        { label: "Check Balance", action: () => this.setIntent('balance'), variant: "default" as const },
        { label: "Apply for Leave", action: () => this.setIntent('apply'), variant: "outline" as const },
        { label: "Search Employees", action: () => this.setIntent('search'), variant: "outline" as const }
      ]
    };
  }

  private handleCancelRequest(): ChatResponse {
    this.clearContext();
    return {
      message: `Okay, I've reset our conversation. What would you like to do?`,
      actions: [
        { label: "Check Balance", action: () => this.setIntent('balance'), variant: "default" as const },
        { label: "Apply for Leave", action: () => this.setIntent('apply'), variant: "outline" as const }
      ]
    };
  }

  private async handleBalanceRequest(message: string): Promise<ChatResponse> {
    // Check if we already have an employee in context
    if (!this.context.currentEmployee) {
      const employee = this.findEmployeeByIdOrName(message);
      if (employee) {
        this.context.currentEmployee = employee;
        return this.generateBalanceResponse(employee);
      }

      this.context.conversationState = 'waiting_for_name';
      return {
        message: "I'd be happy to check your leave balance! Please provide your Employee ID or full name:"
      };
    }

    return this.generateBalanceResponse(this.context.currentEmployee);
  }

  private async handleLeaveApplication(message: string): Promise<ChatResponse> {
    // Check if we have an employee
    if (!this.context.currentEmployee) {
      const employee = this.findEmployeeByIdOrName(message);
      if (employee) {
        this.context.currentEmployee = employee;
      }

      if (!this.context.currentEmployee) {
        this.context.conversationState = 'waiting_for_name';
        const isUrgent = this.context.userSentiment === 'negative';
        const responseMessage = isUrgent
          ? `I understand this is urgent! Let me help you apply for emergency leave quickly. Please provide your Employee ID or full name:`
          : `I'll help you apply for leave. Please provide your Employee ID or full name:`;
        return { message: responseMessage };
      }
    }

    // Extract dates from the message
    const dates = this.extractDates(message);
    if (dates.startDate && !this.context.pendingStartDate) {
      this.context.pendingStartDate = dates.startDate;
      if (dates.endDate && dates.endDate !== dates.startDate) {
        this.context.pendingEndDate = dates.endDate;
        this.context.pendingDays = this.calculateLeaveDays(dates.startDate, dates.endDate);
      }
    }

    // Check if we have a leave type
    if (!this.context.pendingLeaveType) {
      const extractedType = this.extractLeaveType(message);
      if (extractedType) {
        this.context.pendingLeaveType = extractedType;
      } else {
        this.context.conversationState = 'waiting_for_leave_type';
        const empName = this.context.currentEmployee!.Name.split(' ')[0];
        return {
          message: `Hi ${empName}! What type of leave would you like to apply for?`,
          actions: [
            { label: "Sick Leave", action: () => this.setPendingLeaveType("sick leave"), variant: "outline" as const },
            { label: "Casual Leave", action: () => this.setPendingLeaveType("casual leave"), variant: "outline" as const },
            { label: "Earned Leave", action: () => this.setPendingLeaveType("earned leave"), variant: "outline" as const }
          ]
        };
      }
    }

    // Check if we have number of days (if not extracted from dates)
    if (!this.context.pendingDays) {
      const extractedDays = this.extractLeaveDays(message);
      if (extractedDays) {
        this.context.pendingDays = extractedDays;
      } else {
        this.context.conversationState = 'waiting_for_days';
        return {
          message: `How many days of ${this.context.pendingLeaveType} would you like to apply for?`
        };
      }
    }

    // Ask for dates if not provided
    if (!this.context.pendingStartDate) {
      this.context.conversationState = 'waiting_for_dates';
      return {
        message: `When would you like to start your ${this.context.pendingDays}-day ${this.context.pendingLeaveType}?\n\nPlease enter dates in numbers only:\n• Start date (DD/MM/YYYY): Example - 15/08/2025\n• Or date range: 15/08/2025 to 18/08/2025`,
        actions: [
          { label: "📅 Open Calendar", action: () => this.openCalendar(), variant: "outline" as const }
        ]
      };
    }

    // Ask for reason for all leave types
    if (!this.context.pendingReason) {
      this.context.conversationState = 'waiting_for_reason';
      return {
        message: `Please provide a reason for your ${this.context.pendingLeaveType}:`
      };
    }

    // Final confirmation before submission
    if (this.context.conversationState !== 'waiting_for_confirmation') {
      this.context.conversationState = 'waiting_for_confirmation';
      return this.generateLeaveConfirmation();
    }

    return await this.validateAndProcessLeaveRequest();
  }

  private generateLeaveConfirmation(): ChatResponse {
    const startDate = this.context.pendingStartDate || 'Not specified';
    const endDate = this.context.pendingEndDate || this.context.pendingStartDate || 'Not specified';
    const reason = this.context.pendingReason || 'No reason provided';

    return {
      message: `Hey! Please confirm your leave request:\n\n` +
        `• Employee - ${this.context.currentEmployee!.Name}\n` +
        `• Type - ${this.context.pendingLeaveType}\n` +
        `• Duration - ${this.context.pendingDays} Days\n` +
        `• Start Date - ${startDate}\n` +
        `• End Date - ${endDate}\n` +
        `• Reason - ${reason}\n\n` +
        `Ready to submit?`,
      actions: [
        { label: "Yes, Submit", action: () => this.confirmLeaveApplication(), variant: "default" as const },
        { label: "Cancel", action: () => this.handleCancelAction(), variant: "outline" as const }
      ]
    };
  }

  private async handleTeamRequest(): Promise<ChatResponse> {
    const stats = employeeDataService.getTeamStats();
    
    return {
      message: `Hey! Here are your team statistics:\n\n` +
        `• Total Employees - ${stats.totalEmployees} people\n\n` +
        `Average leave balances:\n` +
        `• Sick Leave - ${stats.avgSickLeave.toFixed(1)} Days\n` +
        `• Casual Leave - ${stats.avgCasualLeave.toFixed(1)} Days\n` +
        `• Earned Leave - ${stats.avgEarnedLeave.toFixed(1)} Days\n\n` +
        `${stats.avgSickLeave < 5 ? "⚠️ Some team members are low on sick leave" : "✅ Team has healthy leave balance"}`,
      actions: [
        { label: "Search Employee", action: () => this.setIntent('search'), variant: "outline" as const },
        { label: "Apply for Leave", action: () => this.setIntent('apply'), variant: "default" as const }
      ]
    };
  }

  private async handleSearchRequest(message: string): Promise<ChatResponse> {
    const searchTerm = message.replace(/find|search|lookup|who is|contact/gi, '').trim();
    if (searchTerm) {
      const results = employeeDataService.searchEmployees(searchTerm);
      if (results.length > 0) {
        const employeeList = results.slice(0, 3).map((emp, index) => {
          const totalLeave = emp.Sick_Leave + emp.Casual_Leave + emp.Earned_Leave;
          return `• ${emp.Name} - ${emp.Email}, ${totalLeave} Days Leave Available`;
        }).join('\n');

        const moreResults = results.length > 3 ? `\n\n*Showing top 3 of ${results.length} results*` : '';

        return {
          message: `Hey! Found ${results.length} employee(s):\n\n${employeeList}${moreResults}`,
          actions: [
            { label: "Search Again", action: () => this.setIntent('search'), variant: "outline" as const },
            { label: "Check Leave Balance", action: () => this.setIntent('balance'), variant: "outline" as const },
            { label: "Apply for Leave", action: () => this.setIntent('apply'), variant: "default" as const }
          ]
        };
      } else {
        return {
          message: `No results found for "${searchTerm}". Try checking the spelling or using partial names.`,
          actions: [
            { label: "New Search", action: () => this.setIntent('search'), variant: "default" as const },
            { label: "Check My Balance", action: () => this.setIntent('balance'), variant: "outline" as const }
          ]
        };
      }
    }

    return {
      message: `Who are you looking for? You can search by name, email, or department.`
    };
  }

  private handleHelpRequest(): ChatResponse {
    return {
      message: `Hey! I can help you with:\n\n` +
        `• Check Leave Balance - "What's my balance?"\n` +
        `• Apply for Leave - "I need 3 days sick leave"\n` +
        `• Team Statistics - "Show team stats"\n` +
        `• Find Employees - "Find John Smith"\n\n` +
        `Just ask naturally - I understand!`,
      actions: [
        { label: "Check My Balance", action: () => this.setIntent('balance'), variant: "default" as const },
        { label: "Apply for Leave", action: () => this.setIntent('apply'), variant: "outline" as const },
        { label: "Team Stats", action: () => this.setIntent('team'), variant: "outline" as const },
        { label: "Search People", action: () => this.setIntent('search'), variant: "outline" as const }
      ]
    };
  }

  private async handleUnknownIntent(message: string): Promise<ChatResponse> {
    // Handle conversation flow states
    if (this.context.conversationState === 'waiting_for_name') {
      const employee = this.findEmployeeByIdOrName(message);
      if (employee) {
        this.context.currentEmployee = employee;
        this.context.conversationState = 'initial';
        return this.generateBalanceResponse(employee);
      } else {
        const suggestions = employeeDataService.searchEmployees(message).slice(0, 3);
        if (suggestions.length > 0) {
          const suggestionText = suggestions.map((emp, index) => `${index + 1}. ${emp.Name} (ID: ${emp.Employee_ID})`).join('\n');
          return {
            message: `Couldn't find "${message}". Did you mean one of these?\n\n${suggestionText}\n\nPlease provide your Employee ID or full name.`
          };
        } else {
          return {
            message: `Employee "${message}" not found. Please provide a valid Employee ID (e.g., EMP001) or full name (e.g., John Smith).`
          };
        }
      }
    }

    if (this.context.conversationState === 'waiting_for_leave_type') {
      const leaveType = this.extractLeaveType(message);
      if (leaveType) {
        this.context.pendingLeaveType = leaveType;
        this.context.conversationState = 'waiting_for_days';
        return {
          message: `Great! ${leaveType} selected. How many days would you like to apply for?`
        };
      } else {
        return {
          message: `Please choose a valid leave type:`,
          actions: [
            { label: "Sick Leave", action: () => this.setPendingLeaveType("sick leave"), variant: "outline" as const },
            { label: "Casual Leave", action: () => this.setPendingLeaveType("casual leave"), variant: "outline" as const },
            { label: "Earned Leave", action: () => this.setPendingLeaveType("earned leave"), variant: "outline" as const }
          ]
        };
      }
    }

    if (this.context.conversationState === 'waiting_for_days') {
      const days = this.extractLeaveDays(message);
      if (days) {
        this.context.pendingDays = days;
        this.context.conversationState = 'waiting_for_dates';
        return {
          message: `Perfect! ${days} days of ${this.context.pendingLeaveType} confirmed. When would you like to start? (e.g., "December 20th", "tomorrow")`
        };
      } else {
        return {
          message: `Please specify how many days you'd like to apply for (e.g., "3 days", "1 week").`
        };
      }
    }

    if (this.context.conversationState === 'waiting_for_dates') {
      const dates = this.extractDates(message);
      if (dates.startDate) {
        this.context.pendingStartDate = dates.startDate;
        this.context.pendingEndDate = dates.endDate || dates.startDate;
        
        // After getting dates, ask for reason if not provided
        if (!this.context.pendingReason) {
          this.context.conversationState = 'waiting_for_reason';
          return {
            message: `Great! I've got your dates: ${this.context.pendingStartDate}${this.context.pendingEndDate !== this.context.pendingStartDate ? ` to ${this.context.pendingEndDate}` : ''}.\n\nNow, please provide a reason for your ${this.context.pendingLeaveType}:`
          };
        }
        
        return this.generateLeaveConfirmation();
      } else {
        return {
          message: `Please provide a valid date in DD/MM/YYYY format.\n\nExamples:\n• Single date: 15/08/2025\n• Date range: 15/08/2025 to 18/08/2025`,
          actions: [
            { label: "📅 Open Calendar", action: () => this.openCalendar(), variant: "outline" as const }
          ]
        };
      }
    }

    if (this.context.conversationState === 'waiting_for_reason') {
      this.context.pendingReason = message;
      return this.generateLeaveConfirmation();
    }

    if (this.context.conversationState === 'waiting_for_confirmation') {
      if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('confirm') || message.toLowerCase().includes('submit')) {
        return await this.validateAndProcessLeaveRequest();
      } else if (message.toLowerCase().includes('no') || message.toLowerCase().includes('cancel')) {
        this.clearContext();
        return {
          message: `Leave application cancelled. What would you like to do instead?`,
          actions: [
            { label: "New Application", action: () => this.setIntent('apply'), variant: "default" as const },
            { label: "Check Balance", action: () => this.setIntent('balance'), variant: "outline" as const }
          ]
        };
      }
    }

    // Enhanced fallback with smart suggestions
    const suggestions = this.shouldShowSmartSuggestions() ? this.getContextualSuggestions() : [];
    
    const isUrgent = this.context.userSentiment === 'negative';
    
    const openingMessage = isUrgent
      ? `I sense this might be urgent! Let me help you quickly.`
      : `I'm not sure I understand. Here's what I can help with:`;

    const responseMessage = `${openingMessage}\n\n` +
      `• "Check my leave balance"\n` +
      `• "I need 2 days sick leave"\n` +
      `• "Show team statistics"\n` +
      `• "Find John Smith"`;

    const actions = [
      { label: "Check Balance", action: () => this.setIntent('balance'), variant: "default" as const },
      { label: "Apply for Leave", action: () => this.setIntent('apply'), variant: "outline" as const },
      { label: "Get Help", action: () => this.setIntent('help'), variant: "outline" as const }
    ];

    return { message: responseMessage, actions };
  }

  private generateBalanceResponse(employee: Employee): ChatResponse {
    const totalLeave = employee.Sick_Leave + employee.Casual_Leave + employee.Earned_Leave;
    const firstName = employee.Name.split(' ')[0];
    
    let alertMessage = "";
    if (employee.Sick_Leave < 3) {
      alertMessage = "\n⚠️ Your sick leave is running low!";
    }

    return {
      message: `Hey ${firstName}! Your leave balances are:\n\n` +
        `• Sick Leave - ${employee.Sick_Leave} Days\n` +
        `• Casual Leave - ${employee.Casual_Leave} Days\n` +
        `• Earned Leave - ${employee.Earned_Leave} Days\n\n` +
        `Total: ${totalLeave} days available${alertMessage}`,
      actions: [
        { label: "Apply for Leave", action: () => this.setIntent('apply'), variant: "default" as const },
        { label: "View Team Stats", action: () => this.setIntent('team'), variant: "outline" as const }
      ]
    };
  }

  private async validateAndProcessLeaveRequest(): Promise<ChatResponse> {
    if (!this.context.currentEmployee || !this.context.pendingLeaveType || !this.context.pendingDays) {
      return {
        message: "I need more information to process your leave request. Please provide your name, leave type, and number of days."
      };
    }

    try {
      // Submit the leave application
      const applicationResult = await employeeDataService.submitLeaveApplication({
        employee: this.context.currentEmployee,
        leaveType: this.context.pendingLeaveType,
        days: this.context.pendingDays,
        startDate: this.context.pendingStartDate || new Date().toISOString().split('T')[0],
        endDate: this.context.pendingEndDate,
        reason: this.context.pendingReason,
        isEmergency: this.context.userSentiment === 'negative'
      });

      if (applicationResult.success && applicationResult.application) {
        const isEmergency = this.context.userSentiment === 'negative';

        const responseMessage = `${isEmergency ? '✅ Emergency leave request submitted!' : '✅ Hey! Your leave application was submitted successfully!'}\n\n` +
          `• Application ID - ${applicationResult.application.Application_ID}\n` +
          `• Type - ${this.context.pendingLeaveType}\n` +
          `• Duration - ${this.context.pendingDays} Days\n` +
          `• Status - ${isEmergency ? 'Priority Pending' : 'Pending Approval'}\n\n` +
          `Your manager will review this request. You'll be notified when it's processed!`;

        // Reset context after successful application
        this.clearContext();
        return {
          message: responseMessage,
          status: isEmergency ? "pending" : "pending" as const
        };
      } else {
        return {
          message: `❌ Application failed: ${applicationResult.message}\n\nPlease check your leave balance and try again.`,
          status: "rejected" as const,
          actions: [
            { label: "Check Balance", action: () => this.setIntent('balance'), variant: "outline" as const },
            { label: "Apply Again", action: () => this.setIntent('apply'), variant: "default" as const }
          ]
        };
      }
    } catch (error) {
      console.error('Error processing leave request:', error);
      return {
        message: `❌ System error occurred. Please try again or contact IT support if the problem persists.`,
        status: "rejected" as const,
        actions: [
          { label: "Retry Application", action: () => this.setIntent('apply'), variant: "default" as const },
          { label: "Check Balance", action: () => this.setIntent('balance'), variant: "outline" as const }
        ]
      };
    }
  }

  private confirmLeaveApplication(): Promise<ChatResponse> {
    // This method will be called by action buttons and will trigger async submission
    return this.validateAndProcessLeaveRequest();
  }

  private async setPendingLeaveType(leaveType: string): Promise<ChatResponse> {
    this.context.pendingLeaveType = leaveType;
    this.context.conversationState = 'waiting_for_days';
    
    return {
      message: `Great! ${leaveType} selected. How many days would you like to apply for?`
    };
  }

  private async setIntent(intent: string): Promise<ChatResponse> {
    // Helper method for action buttons to set conversation intent and return appropriate response
    this.context.conversationState = 'initial';
    
    switch (intent) {
      case 'balance':
        return await this.handleBalanceRequest('');
      case 'apply':
        return await this.handleLeaveApplication('');
      case 'team':
        return await this.handleTeamRequest();
      case 'search':
        return await this.handleSearchRequest('');
      case 'help':
        return this.handleHelpRequest();
      default:
        return this.handleGreeting();
    }
  }

  private shouldShowSmartSuggestions(): boolean {
    // Show suggestions based on conversation history and user behavior
    return this.context.conversationHistory.length > 2 && 
           this.context.userSentiment !== 'negative';
  }

  private getContextualSuggestions(): string[] {
    const suggestions = [];
    
    if (this.context.currentEmployee) {
      suggestions.push(`Check ${this.context.currentEmployee.Name}'s balance`);
      suggestions.push("Apply for leave");
    }
    
    if (this.context.conversationHistory.some(msg => msg.includes('team'))) {
      suggestions.push("Show team statistics");
    }
    
    suggestions.push("Search employees", "Get help");
    return suggestions.slice(0, 3);
  }

  private async handleCancelAction(): Promise<ChatResponse> {
    return this.resetContext();
  }

  public async openCalendar(): Promise<ChatResponse> {
    console.log('openCalendar method called');
    // Return a special response that triggers the calendar UI
    const response = {
      message: `📅 **Calendar Widget**\n\nPlease select your dates using the calendar below, or type them manually in DD/MM/YYYY format:\n\n**Examples:**\n• Single day: 15/08/2025\n• Date range: 15/08/2025 to 18/08/2025`,
      showCalendar: true
    };
    console.log('openCalendar returning:', response);
    return response;
  }
}

export const chatIntelligence = new ChatIntelligence();
