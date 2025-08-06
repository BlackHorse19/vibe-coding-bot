# OneLeave Manager

A comprehensive, enterprise-grade leave management system with an AI-powered chat assistant for seamless leave applications, approvals, and analytics.

## 🚀 Features

### 🤖 **AI-Powered Chat Interface**
- Natural language leave applications
- Interactive calendar widget for date selection
- Intelligent prompting for Employee ID, dates, and reasons
- Real-time conversation flow with suggestion chips

### 📊 **Comprehensive Dashboard**
- **Employee Search**: Quick lookup by ID or name with detailed profiles
- **At a Glance**: Total employees, leave balances, current status overview
- **Actionable Items**: Pending requests with one-click approve/reject
- **Calendar View**: Visual leave schedule with monthly statistics
- **Analytics**: Leave trends, charts, and insights

### 🔧 **Management Features**
- **Approve/Reject Workflow**: Functional buttons with confirmation dialogs
- **Comments System**: Manager comments for approvals/rejections
- **Real-time Updates**: Dashboard refreshes automatically after actions
- **CSV Export**: Download action history and reports
- **Data Persistence**: Saves to CSV files and localStorage

### 🔐 **Authentication & Security**
- Admin authentication system
- Protected routes and role-based access
- Secure session management

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Storage**: CSV files + localStorage
- **Calendar**: Custom DatePicker component

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── ChatInterface.tsx      # Main chat component
│   ├── ChatInput.tsx          # Chat input with suggestions
│   ├── ChatMessage.tsx        # Message display component
│   ├── ComprehensiveDashboard.tsx  # Main dashboard
│   ├── DatePicker.tsx         # Calendar widget
│   ├── LoginForm.tsx          # Authentication form
│   └── ProtectedRoute.tsx     # Route protection
├── lib/
│   ├── data.ts               # Employee data service & CSV handling
│   ├── chatIntelligence.ts   # Chat logic & AI responses
│   └── utils.ts              # Utility functions
├── pages/
│   ├── Dashboard.tsx         # Dashboard page with view switching
│   ├── Index.tsx             # Main application entry
│   └── NotFound.tsx          # 404 page
├── contexts/
│   └── AuthContext.tsx       # Authentication context
└── hooks/                    # Custom React hooks
```

## 📊 Data Sources

The application uses CSV files for data storage:

- **`dummydata/employee_data.csv`**: Employee information, leave balances
- **`dummydata/leave_applications.csv`**: Leave application records

### Employee Data Structure
```csv
Employee_ID,Name,Email,Department,Sick_Leave,Casual_Leave,Earned_Leave
EMP001,John Doe,john@company.com,Engineering,10,15,20
```

### Leave Applications Structure
```csv
Application_ID,Employee_ID,Employee_Name,Leave_Type,Start_Date,End_Date,Days_Requested,Reason,Application_Date,Status
LA001,EMP001,John Doe,Sick Leave,2025-08-10,2025-08-12,3,Medical checkup,2025-08-05,Pending
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Verify data files**
   Ensure the following CSV files exist in the `dummydata/` directory:
   - `employee_data.csv`
   - `leave_applications.csv`

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:xxxx`

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
- Starts Vite development server
- Hot reload enabled
- Available at `http://localhost:xxxx`

## 🔑 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📱 How to Use

### 1. **Login**
- Use admin credentials to access the dashboard
- Authentication is required for all features

### 2. **Chat Interface**
- Click "Chat" tab to access the leave application interface
- Use natural language: "I want to apply for sick leave"
- Follow prompts for Employee ID, dates, and reason
- Use the calendar widget for date selection

### 3. **Dashboard Management**
- Click "Dashboard" tab to access management features
- **Employee Search**: Find employees by ID or name
- **Pending Requests**: Review and approve/reject applications
- **Analytics**: View leave trends and statistics

### 4. **Approve/Reject Workflow**
- Click "Pending Requests" card to see all pending applications
- Use "Review", "Approve", or "Reject" buttons
- Add manager comments for decisions
- Changes are saved automatically

## 🔧 Configuration

### Adding New Employees
Add entries to `dummydata/employee_data.csv`:
```csv
EMP004,Jane Smith,jane@company.com,HR,12,18,25
```

### Customizing Leave Types
Modify the leave type logic in `src/lib/chatIntelligence.ts` and `src/lib/data.ts`

### Authentication
Update credentials in `src/contexts/AuthContext.tsx`

## 🐛 Troubleshooting

### Common Issues

1. **CSV files not loading**
   - Ensure files are in `dummydata/` directory
   - Check file permissions
   - Verify CSV format matches expected structure

2. **Employee names not showing**
   - Ensure Employee_IDs match between CSV files
   - Check for trailing spaces or formatting issues

3. **Chat not working**
   - Verify `chatIntelligence.ts` is properly configured
   - Check browser console for errors

4. **Dashboard not refreshing**
   - Use the "Refresh Data" button
   - Clear browser localStorage if needed

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Preview production build
npm run preview
```

**OneLeave Manager** - Making leave management simple, intelligent, and efficient.
