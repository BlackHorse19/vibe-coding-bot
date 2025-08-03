# Leave Management Chatbot MVP

A CSV-powered leave management chatbot that connects to employee data and provides intelligent responses.

## Features

### 🤖 Intelligent Chat Interface
- **Real-time Responses**: Chat with the bot using natural language
- **Context Awareness**: The bot remembers your conversation and employee details
- **Smart Intent Detection**: Understands various ways to ask for leave balance, applications, etc.

### 📊 CSV Data Integration
- **Employee Database**: Loads employee data from `dummydata/employee_data.csv`
- **Real Leave Balances**: Shows actual remaining leave for each employee
- **Team Statistics**: Provides overview of team leave patterns

### 💬 Chat Capabilities

#### 1. **Leave Balance Check**
```
User: "What's my leave balance?"
Bot: "I'd be happy to check your leave balance! What's your name?"
User: "Ayush Prakash"
Bot: "Hi Ayush! Here's your current leave balance:
      • Sick Leave: 8 days remaining
      • Casual Leave: 5 days remaining
      • Earned Leave: 12 days remaining"
```

#### 2. **Leave Application**
```
User: "I want to apply for 3 days of sick leave"
Bot: "I need to know who you are. What's your name?"
User: "Priya Sharma"
Bot: "Hi Priya! You have 4 days of sick leave remaining.
      Your request for 3 days is valid.
      Please provide the dates and reason for your leave."
```

#### 3. **Team Statistics**
```
User: "Show team statistics"
Bot: "Here's the team overview:
      • Total Employees: 50
      • Average Sick Leave Remaining: 6.8 days
      • Average Casual Leave Remaining: 4.9 days
      • Average Earned Leave Remaining: 10.7 days"
```

#### 4. **Employee Search**
```
User: "Find employee"
Bot: "Who would you like to search for? Please provide a name or email."
User: "Ayush"
Bot: "Found 1 employee(s):
      • Ayush Prakash (ayush.prakash@vibecode.com)"
```

### 🎯 Quick Actions
- **Check Balance**: "What's my leave balance?"
- **Apply Leave**: "I want to apply for leave"
- **Team Stats**: "Show team statistics"
- **Search Employee**: "Find employee"
- **Help**: "What can you do?"

## Technical Implementation

### Data Layer (`src/lib/data.ts`)
- **CSV Parser**: Uses `papaparse` to load employee data
- **Employee Search**: Find employees by name, email, or ID
- **Leave Validation**: Validates leave requests against available balance
- **Team Statistics**: Calculates team-wide leave statistics

### Chat Intelligence (`src/lib/chatIntelligence.ts`)
- **Intent Detection**: Recognizes user intentions from natural language
- **Context Management**: Maintains conversation state and employee context
- **Response Generation**: Creates contextual responses based on data
- **Action Buttons**: Provides interactive buttons for quick actions

### Components
- **ChatInterface**: Main chat component with intelligent responses
- **ChatMessage**: Displays messages with action buttons
- **ChatInput**: Text input with file upload capability
- **SuggestionChips**: Quick action buttons for common tasks

## CSV Data Structure

The application expects a CSV file with the following columns:
```csv
Employee_ID,Name,Email,Sick_Leave,Casual_Leave,Earned_Leave
2345678,Ayush Prakash,ayush.prakash@vibecode.com,8,5,12
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open `http://localhost:8080`
   - The app will automatically load employee data from the CSV

## Usage Examples

### Example 1: Check Leave Balance
1. Type "What's my leave balance?"
2. Bot asks for your name
3. Type your name (e.g., "Ayush Prakash")
4. Bot shows your leave balance

### Example 2: Apply for Leave
1. Type "I want to apply for leave"
2. Bot asks for your name
3. Type your name
4. Bot asks for leave type (Sick, Casual, or Earned)
5. Bot asks for number of days
6. Bot validates and processes the request

### Example 3: Team Overview
1. Type "Show team statistics"
2. Bot displays team-wide leave statistics

## Future Enhancements

- **Multiple CSV Files**: Support for leave history, policies, etc.
- **File Upload**: Allow uploading new CSV data
- **Data Export**: Export leave applications and reports
- **Admin Interface**: Manage employee data through UI
- **Real-time Updates**: Live data synchronization
- **Advanced AI**: Integration with OpenAI or similar services

## Architecture

```
Frontend (React + TypeScript)
├── Data Layer (CSV Parser)
├── Chat Intelligence (Intent Detection)
├── UI Components (Chat Interface)
└── State Management (React Hooks)
```

This MVP demonstrates a lightweight, CSV-powered chatbot that provides real value without requiring a complex backend infrastructure.
