# Leave Management Chatbot MVP - Technical Stack Options

## 1. Recommended Tech Stack (Primary Option)

### 1.1 Bot Framework & Teams Integration
- **Microsoft Bot Framework SDK v4** (Node.js or C#)
- **Bot Framework Composer** (optional, for visual bot building)
- **Teams Toolkit for Visual Studio Code**
- **Microsoft Graph API** (for Teams and user data)
- **Adaptive Cards** (for rich UI components)

### 1.2 Backend Development
- **Node.js with TypeScript** (Primary recommendation)
  - Express.js framework
  - Bot Builder SDK for Node.js
  - Axios for HTTP requests
  - Moment.js for date handling
  - Winston for logging

**Alternative:**
- **C# .NET Core 6/7**
  - ASP.NET Core Web API
  - Bot Builder SDK for .NET
  - Entity Framework Core
  - Serilog for logging

### 1.3 Database
- **Azure Cosmos DB** (NoSQL, globally distributed)
  - Document-based storage
  - Automatic scaling
  - Good for conversation state

**Alternative:**
- **Azure SQL Database** (Relational)
  - Structured data storage
  - Familiar SQL queries
  - Better for reporting

### 1.4 Cloud Hosting & Services
- **Azure App Service** (for bot hosting)
- **Azure Functions** (for serverless operations like CSV generation)
- **Azure Blob Storage** (for CSV file storage)
- **Azure Key Vault** (for secrets management)
- **Application Insights** (for monitoring and analytics)

### 1.5 Authentication & Security
- **Azure Active Directory** (SSO through Teams)
- **Microsoft Authentication Library (MSAL)**
- **JWT tokens** for API authentication
- **HTTPS/TLS 1.2+** for secure communication

## 2. Alternative Tech Stack Options

### 2.1 Option A: Full Microsoft Stack
```
Frontend: Microsoft Teams (Adaptive Cards)
Bot Framework: C# Bot Builder SDK v4
Backend: ASP.NET Core 6 Web API
Database: Azure SQL Database
Hosting: Azure App Service
Authentication: Azure AD B2C
Monitoring: Application Insights
CI/CD: Azure DevOps
```

### 2.2 Option B: Node.js Focused
```
Frontend: Microsoft Teams (Adaptive Cards)
Bot Framework: Node.js Bot Builder SDK v4
Backend: Node.js + Express + TypeScript
Database: Azure Cosmos DB
Hosting: Azure App Service
Authentication: Azure AD via MSAL
Monitoring: Application Insights
CI/CD: GitHub Actions
```

### 2.3 Option C: Serverless Architecture
```
Frontend: Microsoft Teams (Adaptive Cards)
Bot Framework: Azure Bot Service
Backend: Azure Functions (Node.js/C#)
Database: Azure Cosmos DB
Storage: Azure Blob Storage
Authentication: Azure AD
Monitoring: Application Insights
CI/CD: Azure DevOps
```

## 3. Detailed Technology Breakdown

### 3.1 Bot Development Framework

#### Microsoft Bot Framework SDK v4 (Recommended)
```javascript
// Example: Node.js Bot Framework
const { ActivityHandler, MessageFactory, CardFactory } = require('botbuilder');
const { AdaptiveCards } = require('@microsoft/adaptivecards-tools');

class LeaveBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            // Handle leave request logic
        });
    }
}
```

**Pros:**
- Native Teams integration
- Rich conversation management
- Built-in state management
- Extensive documentation

**Cons:**
- Microsoft ecosystem lock-in
- Learning curve for non-Microsoft developers

### 3.2 Backend API Options

#### Option 1: Node.js + Express + TypeScript
```typescript
// Example API structure
import express from 'express';
import { BotFrameworkAdapter } from 'botbuilder';

const app = express();
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Bot logic here
    });
});
```

**Dependencies:**
```json
{
  "dependencies": {
    "botbuilder": "^4.20.0",
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "axios": "^1.4.0",
    "moment": "^2.29.4",
    "winston": "^3.8.2"
  }
}
```

#### Option 2: C# ASP.NET Core
```csharp
// Example controller
[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IBotFrameworkHttpAdapter _adapter;
    private readonly IBot _bot;

    [HttpPost]
    public async Task PostAsync()
    {
        await _adapter.ProcessAsync(Request, Response, _bot);
    }
}
```

### 3.3 Database Schema Design

#### Cosmos DB Document Structure
```json
{
  "id": "leave-request-001",
  "partitionKey": "employee-12345",
  "employeeId": "12345",
  "managerId": "67890",
  "leaveType": "vacation",
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "reason": "Family vacation",
  "status": "submitted",
  "hcmRequestId": "HCM-2024-001",
  "submittedAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

#### SQL Database Schema
```sql
CREATE TABLE LeaveRequests (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    EmployeeId NVARCHAR(50) NOT NULL,
    ManagerId NVARCHAR(50) NOT NULL,
    LeaveType NVARCHAR(20) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Reason NVARCHAR(500),
    Status NVARCHAR(20) NOT NULL,
    HCMRequestId NVARCHAR(100),
    SubmittedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL
);
```

### 3.4 HCM Integration Options

#### REST API Integration
```typescript
// HCM API service
class HCMService {
    private baseUrl: string;
    private apiKey: string;

    async submitLeaveRequest(request: LeaveRequest): Promise<HCMResponse> {
        const response = await axios.post(`${this.baseUrl}/leave-requests`, {
            employeeId: request.employeeId,
            leaveType: request.leaveType,
            startDate: request.startDate,
            endDate: request.endDate,
            reason: request.reason
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    }
}
```

### 3.5 CSV Export Implementation

#### Azure Functions for CSV Generation
```typescript
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

const csvExport: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const { managerId, dateFrom, dateTo, status } = req.query;

    // Fetch leave data
    const leaveData = await getLeaveData(managerId, dateFrom, dateTo, status);

    // Generate CSV
    const csv = generateCSV(leaveData);

    // Upload to blob storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient("csv-exports");
    const blobName = `leave-export-${Date.now()}.csv`;

    await containerClient.uploadBlockBlob(blobName, csv, csv.length);

    context.res = {
        status: 200,
        body: {
            downloadUrl: `https://yourstorageaccount.blob.core.windows.net/csv-exports/${blobName}`,
            fileName: blobName
        }
    };
};
```

## 4. Development Tools & Environment

### 4.1 Development Environment
- **Visual Studio Code** with Teams Toolkit extension
- **Node.js 18+ or .NET 6/7 SDK**
- **Azure CLI** for cloud resource management
- **Bot Framework Emulator** for local testing
- **ngrok** for local development tunneling

### 4.2 Testing Tools
- **Jest** (for Node.js) or **xUnit** (for C#)
- **Supertest** for API testing
- **Bot Framework Emulator** for conversation testing
- **Postman** for API testing
- **Azure DevTest Labs** for integration testing

### 4.3 CI/CD Pipeline

#### GitHub Actions (Node.js)
```yaml
name: Deploy Bot to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'your-bot-app'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

## 5. Cost Estimation (Monthly)

### 5.1 Azure Services Cost (Estimated)
- **Azure App Service (Basic B1)**: $13/month
- **Azure Cosmos DB (400 RU/s)**: $24/month
- **Azure Blob Storage (1GB)**: $0.02/month
- **Application Insights**: $2.30/month (5GB data)
- **Azure Bot Service**: Free tier available
- **Total Estimated**: ~$40-50/month

### 5.2 Development Licenses
- **Visual Studio Code**: Free
- **Azure DevOps (Basic)**: Free for up to 5 users
- **GitHub**: Free for public repos, $4/user for private
- **Microsoft 365 Developer**: Free developer tenant

## 6. Recommended Implementation Approach

### 6.1 Phase 1: MVP Setup (Week 1-2)
1. Set up Azure subscription and resource group
2. Create Bot Framework registration
3. Set up development environment with Teams Toolkit
4. Create basic "Hello World" Teams bot
5. Set up CI/CD pipeline

### 6.2 Phase 2: Core Development (Week 3-12)
1. Implement conversation flows with Adaptive Cards
2. Build HCM integration service
3. Create database schema and data access layer
4. Implement CSV export functionality
5. Add error handling and logging

### 6.3 Phase 3: Testing & Deployment (Week 13-16)
1. Unit and integration testing
2. User acceptance testing
3. Performance optimization
4. Security review
5. Production deployment

## 7. Security Considerations

### 7.1 Authentication & Authorization
- Azure AD integration through Teams
- Role-based access control (Employee vs Manager)
- Secure API key management with Azure Key Vault
- Token validation and refresh

### 7.2 Data Protection
- HTTPS/TLS encryption for all communications
- Data encryption at rest in database
- Minimal data storage (rely on HCM system)
- Audit logging for all operations

### 7.3 Compliance
- GDPR compliance for EU users
- SOC 2 compliance through Azure services
- Regular security updates and patches
- Vulnerability scanning

## 8. Performance Optimization

### 8.1 Bot Performance
- Implement conversation state caching
- Use connection pooling for database
- Optimize API calls to HCM system
- Implement retry logic with exponential backoff

### 8.2 Scalability
- Use Azure App Service auto-scaling
- Implement database connection pooling
- Use Azure CDN for static assets
- Consider Azure Functions for compute-intensive tasks

---

**Recommendation**: Start with **Node.js + TypeScript + Azure Cosmos DB** stack for faster development and easier maintenance, especially if your team has JavaScript/TypeScript experience. This stack offers good performance, scalability, and integrates well with Microsoft Teams ecosystem.
