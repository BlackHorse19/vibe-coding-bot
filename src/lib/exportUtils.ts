import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { employeeDataService, Employee } from "./data";

// Type for leave report data
interface LeaveReportData {
  employeeName: string;
  email: string;
  sickLeave: number;
  casualLeave: number;
  earnedLeave: number;
  totalLeave: number;
  department?: string;
}

// Type for team statistics report
interface TeamStatsReport {
  metric: string;
  value: string | number;
  description: string;
}

// Enhanced type for jsPDF with autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

// Generate leave report data from employee data
export function generateLeaveReportData(): LeaveReportData[] {
  const employees = employeeDataService.getAllEmployees();
  
  return employees.map((employee: Employee) => ({
    employeeName: employee.Name,
    email: employee.Email,
    sickLeave: employee.Sick_Leave,
    casualLeave: employee.Casual_Leave,
    earnedLeave: employee.Earned_Leave,
    totalLeave: employee.Sick_Leave + employee.Casual_Leave + employee.Earned_Leave,
    department: "General" // Default department since it's not in the current data structure
  }));
}

// Generate team statistics report data
export function generateTeamStatsData(): TeamStatsReport[] {
  const stats = employeeDataService.getTeamStats();
  const currentDate = new Date().toLocaleDateString();
  
  return [
    { metric: "Report Date", value: currentDate, description: "Date when this report was generated" },
    { metric: "Total Employees", value: stats.totalEmployees, description: "Total number of employees in the system" },
    { metric: "Average Sick Leave", value: `${stats.avgSickLeave} days`, description: "Average sick leave remaining per employee" },
    { metric: "Average Casual Leave", value: `${stats.avgCasualLeave} days`, description: "Average casual leave remaining per employee" },
    { metric: "Average Earned Leave", value: `${stats.avgEarnedLeave} days`, description: "Average earned leave remaining per employee" }
  ];
}

// Generate leave applications report data
export function generateLeaveApplicationsReportData(): any[] {
  const leaveApplications = employeeDataService.getAllLeaveApplications();
  
  return leaveApplications.map((application) => ({
    applicationId: application.Application_ID,
    employeeName: application.Employee_Name,
    employeeEmail: application.Employee_Email,
    leaveType: application.Leave_Type,
    startDate: application.Start_Date,
    endDate: application.End_Date,
    daysRequested: application.Days_Requested,
    reason: application.Reason || 'Not specified',
    applicationDate: application.Application_Date,
    status: application.Status,
    approvedBy: application.Approved_By || 'Pending',
    approvedDate: application.Approved_Date || 'Pending',
    emergency: application.Emergency ? 'Yes' : 'No',
    department: application.Department || 'General',
    balanceBefore: application.Remaining_Balance_Before,
    balanceAfter: application.Remaining_Balance_After || 'Pending'
  }));
}

// Export employee leave data to Excel
export async function exportLeaveDataToExcel(): Promise<{ success: boolean; message: string }> {
  try {
    const data = generateLeaveReportData();
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ["employeeName", "email", "sickLeave", "casualLeave", "earnedLeave", "totalLeave", "department"]
    });
    
    // Set column headers
    const headers = [
      "Employee Name", "Email", "Sick Leave (Days)", "Casual Leave (Days)", 
      "Earned Leave (Days)", "Total Leave (Days)", "Department"
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    
    // Set column widths
    worksheet["!cols"] = [
      { width: 20 }, // Employee Name
      { width: 25 }, // Email
      { width: 15 }, // Sick Leave
      { width: 15 }, // Casual Leave
      { width: 15 }, // Earned Leave
      { width: 15 }, // Total Leave
      { width: 15 }  // Department
    ];
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Leave Data");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    
    // Save file with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    saveAs(blob, `employee_leave_data_${timestamp}.xlsx`);
    
    return { success: true, message: "Excel file exported successfully!" };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return { success: false, message: "Failed to export Excel file" };
  }
}

// Export team statistics to Excel
export async function exportTeamStatsToExcel(): Promise<{ success: boolean; message: string }> {
  try {
    const data = generateTeamStatsData();
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Team Statistics");
    
    // Set column widths
    worksheet["!cols"] = [
      { width: 20 }, // Metric
      { width: 15 }, // Value
      { width: 40 }  // Description
    ];
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    saveAs(blob, `team_statistics_${timestamp}.xlsx`);
    
    return { success: true, message: "Team statistics exported successfully!" };
  } catch (error) {
    console.error("Error exporting team stats to Excel:", error);
    return { success: false, message: "Failed to export team statistics" };
  }
}

// Export employee leave data to PDF
export async function exportLeaveDataToPDF(): Promise<{ success: boolean; message: string }> {
  try {
    const data = generateLeaveReportData();
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Leave Data Report", 14, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Employees: ${data.length}`, 14, 38);
    
    // Prepare table data
    const tableColumns = [
      "Employee Name", "Email", "Sick", "Casual", "Earned", "Total", "Department"
    ];
    
    const tableRows = data.map(row => [
      row.employeeName,
      row.email,
      row.sickLeave.toString(),
      row.casualLeave.toString(),
      row.earnedLeave.toString(),
      row.totalLeave.toString(),
      row.department || "General"
    ]);
    
    // Add table
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 45,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Employee Name
        1: { cellWidth: 45 }, // Email
        2: { cellWidth: 15 }, // Sick
        3: { cellWidth: 15 }, // Casual
        4: { cellWidth: 15 }, // Earned
        5: { cellWidth: 15 }, // Total
        6: { cellWidth: 20 }  // Department
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Save file
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    doc.save(`employee_leave_data_${timestamp}.pdf`);
    
    return { success: true, message: "PDF exported successfully!" };
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return { success: false, message: "Failed to export PDF" };
  }
}

// Export team statistics to PDF
export async function exportTeamStatsToPDF(): Promise<{ success: boolean; message: string }> {
  try {
    const data = generateTeamStatsData();
    const leaveData = generateLeaveReportData();
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Team Statistics Report", 14, 20);
    
    // Add generation info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Statistics table
    const statsColumns = ["Metric", "Value", "Description"];
    const statsRows = data.map(row => [row.metric, row.value.toString(), row.description]);
    
    doc.autoTable({
      head: [statsColumns],
      body: statsRows,
      startY: 40,
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 80 }
      }
    });
    
    // Add summary section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Leave Distribution Summary", 14, finalY);
    
    // Calculate leave distribution
    const totalSick = leaveData.reduce((sum, emp) => sum + emp.sickLeave, 0);
    const totalCasual = leaveData.reduce((sum, emp) => sum + emp.casualLeave, 0);
    const totalEarned = leaveData.reduce((sum, emp) => sum + emp.earnedLeave, 0);
    const grandTotal = totalSick + totalCasual + totalEarned;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Sick Leave Remaining: ${totalSick} days`, 14, finalY + 10);
    doc.text(`Total Casual Leave Remaining: ${totalCasual} days`, 14, finalY + 18);
    doc.text(`Total Earned Leave Remaining: ${totalEarned} days`, 14, finalY + 26);
    doc.text(`Grand Total Leave Remaining: ${grandTotal} days`, 14, finalY + 34);
    
    // Save file
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    doc.save(`team_statistics_${timestamp}.pdf`);
    
    return { success: true, message: "Team statistics PDF exported successfully!" };
  } catch (error) {
    console.error("Error exporting team stats to PDF:", error);
    return { success: false, message: "Failed to export team statistics PDF" };
  }
}

// Export leave applications to Excel
export async function exportLeaveApplicationsToExcel(): Promise<{ success: boolean; message: string }> {
  try {
    const data = generateLeaveApplicationsReportData();
    
    if (data.length === 0) {
      return { success: false, message: "No leave applications found to export." };
    }
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column headers
    const headers = [
      "Application ID", "Employee Name", "Employee Email", "Leave Type", 
      "Start Date", "End Date", "Days Requested", "Reason", "Application Date",
      "Status", "Approved By", "Approved Date", "Emergency", "Department",
      "Balance Before", "Balance After"
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    
    // Set column widths
    worksheet["!cols"] = [
      { width: 15 }, // Application ID
      { width: 20 }, // Employee Name
      { width: 25 }, // Employee Email
      { width: 15 }, // Leave Type
      { width: 12 }, // Start Date
      { width: 12 }, // End Date
      { width: 12 }, // Days Requested
      { width: 30 }, // Reason
      { width: 15 }, // Application Date
      { width: 12 }, // Status
      { width: 20 }, // Approved By
      { width: 15 }, // Approved Date
      { width: 10 }, // Emergency
      { width: 15 }, // Department
      { width: 12 }, // Balance Before
      { width: 12 }  // Balance After
    ];
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Applications");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    
    // Save file with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    saveAs(blob, `leave_applications_${timestamp}.xlsx`);
    
    return { success: true, message: "Leave applications exported successfully!" };
  } catch (error) {
    console.error("Error exporting leave applications to Excel:", error);
    return { success: false, message: "Failed to export leave applications" };
  }
}

// Export leave applications to PDF
export async function exportLeaveApplicationsToPDF(): Promise<{ success: boolean; message: string }> {
  try {
    const data = generateLeaveApplicationsReportData();
    
    if (data.length === 0) {
      return { success: false, message: "No leave applications found to export." };
    }
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Leave Applications Report", 14, 20);
    
    // Add generation date and stats
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Applications: ${data.length}`, 14, 38);
    
    const stats = employeeDataService.getLeaveApplicationStats();
    doc.text(`Pending: ${stats.pending} | Approved: ${stats.approved} | Rejected: ${stats.rejected}`, 14, 46);
    
    // Prepare table data
    const tableColumns = [
      "App ID", "Employee", "Type", "Start", "Days", "Status", "Emergency"
    ];
    
    const tableRows = data.map(row => [
      row.applicationId,
      row.employeeName.length > 15 ? row.employeeName.substring(0, 12) + "..." : row.employeeName,
      row.leaveType.replace("_", " "),
      row.startDate,
      row.daysRequested.toString(),
      row.status,
      row.emergency
    ]);
    
    // Add table
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 55,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 20 }, // App ID
        1: { cellWidth: 35 }, // Employee
        2: { cellWidth: 25 }, // Type
        3: { cellWidth: 20 }, // Start
        4: { cellWidth: 15 }, // Days
        5: { cellWidth: 20 }, // Status
        6: { cellWidth: 20 }  // Emergency
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Save file
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    doc.save(`leave_applications_${timestamp}.pdf`);
    
    return { success: true, message: "Leave applications PDF exported successfully!" };
  } catch (error) {
    console.error("Error exporting leave applications to PDF:", error);
    return { success: false, message: "Failed to export leave applications PDF" };
  }
}

// Export all data (combined Excel file with multiple sheets)
export async function exportAllDataToExcel(): Promise<{ success: boolean; message: string }> {
  try {
    const leaveData = generateLeaveReportData();
    const statsData = generateTeamStatsData();
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add leave data sheet
    const leaveWorksheet = XLSX.utils.json_to_sheet(leaveData);
    const leaveHeaders = [
      "Employee Name", "Email", "Sick Leave (Days)", "Casual Leave (Days)", 
      "Earned Leave (Days)", "Total Leave (Days)", "Department"
    ];
    XLSX.utils.sheet_add_aoa(leaveWorksheet, [leaveHeaders], { origin: "A1" });
    leaveWorksheet["!cols"] = [
      { width: 20 }, { width: 25 }, { width: 15 }, { width: 15 }, 
      { width: 15 }, { width: 15 }, { width: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, leaveWorksheet, "Employee Leave Data");
    
    // Add stats sheet
    const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
    statsWorksheet["!cols"] = [{ width: 20 }, { width: 15 }, { width: 40 }];
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, "Team Statistics");
    
    // Export file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    saveAs(blob, `complete_leave_report_${timestamp}.xlsx`);
    
    return { success: true, message: "Complete report exported successfully!" };
  } catch (error) {
    console.error("Error exporting complete report:", error);
    return { success: false, message: "Failed to export complete report" };
  }
}
