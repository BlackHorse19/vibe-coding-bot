import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  exportLeaveDataToExcel, 
  exportLeaveDataToPDF, 
  exportTeamStatsToExcel, 
  exportTeamStatsToPDF,
  exportAllDataToExcel,
  exportLeaveApplicationsToExcel,
  exportLeaveApplicationsToPDF 
} from "@/lib/exportUtils";
import { employeeDataService } from "@/lib/data";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  BarChart3, 
  Package,
  ClipboardList 
} from "lucide-react";

export const Reports = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (exportFunction: () => Promise<{ success: boolean; message: string }>, type: string) => {
    setIsExporting(type);
    try {
      const result = await exportFunction();
      toast({
        title: result.success ? "Export Successful" : "Export Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An unexpected error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadUpdatedCSV = () => {
    try {
      employeeDataService.downloadUpdatedCSV();
      toast({
        title: "Download Started",
        description: "Updated leave applications CSV file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the updated CSV file.",
        variant: "destructive",
      });
    }
  };

  const reportCards = [
    {
      id: "employee-data",
      title: "Employee Leave Data",
      description: "Complete employee leave balances and details",
      icon: Users,
      color: "bg-blue-500",
      exports: [
        {
          type: "excel",
          label: "Export to Excel",
          icon: FileSpreadsheet,
          action: () => handleExport(exportLeaveDataToExcel, "employee-excel"),
          loading: isExporting === "employee-excel"
        },
        {
          type: "pdf",
          label: "Export to PDF",
          icon: FileText,
          action: () => handleExport(exportLeaveDataToPDF, "employee-pdf"),
          loading: isExporting === "employee-pdf"
        }
      ]
    },
    {
      id: "team-stats",
      title: "Team Statistics",
      description: "Team overview and statistical analysis",
      icon: BarChart3,
      color: "bg-green-500",
      exports: [
        {
          type: "excel",
          label: "Export to Excel",
          icon: FileSpreadsheet,
          action: () => handleExport(exportTeamStatsToExcel, "stats-excel"),
          loading: isExporting === "stats-excel"
        },
        {
          type: "pdf",
          label: "Export to PDF",
          icon: FileText,
          action: () => handleExport(exportTeamStatsToPDF, "stats-pdf"),
          loading: isExporting === "stats-pdf"
        }
      ]
    },
    {
      id: "leave-applications",
      title: "Leave Applications",
      description: "All submitted leave applications and their status",
      icon: ClipboardList,
      color: "bg-orange-500",
      exports: [
        {
          type: "excel",
          label: "Export to Excel",
          icon: FileSpreadsheet,
          action: () => handleExport(exportLeaveApplicationsToExcel, "applications-excel"),
          loading: isExporting === "applications-excel"
        },
        {
          type: "pdf",
          label: "Export to PDF",
          icon: FileText,
          action: () => handleExport(exportLeaveApplicationsToPDF, "applications-pdf"),
          loading: isExporting === "applications-pdf"
        },
        {
          type: "csv",
          label: "Download Updated CSV",
          icon: Download,
          action: handleDownloadUpdatedCSV,
          loading: false,
          variant: "outline" as const
        }
      ]
    },
    {
      id: "complete-report",
      title: "Complete Report",
      description: "All data combined in a comprehensive report",
      icon: Package,
      color: "bg-purple-500",
      exports: [
        {
          type: "excel",
          label: "Export Complete Report",
          icon: FileSpreadsheet,
          action: () => handleExport(exportAllDataToExcel, "complete-excel"),
          loading: isExporting === "complete-excel"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Reports & Export</h2>
        <p className="text-muted-foreground">
          Generate and download comprehensive reports of your leave management data.
        </p>
      </div>

      {/* Quick Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Quick Export
          </CardTitle>
          <CardDescription>
            Quickly export the most commonly used reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleExport(exportLeaveDataToExcel, "quick-employee-excel")}
              disabled={isExporting === "quick-employee-excel"}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isExporting === "quick-employee-excel" ? "Exporting..." : "Employee Data (Excel)"}
            </Button>
            <Button 
              onClick={() => handleExport(exportLeaveDataToPDF, "quick-employee-pdf")}
              disabled={isExporting === "quick-employee-pdf"}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isExporting === "quick-employee-pdf" ? "Exporting..." : "Employee Data (PDF)"}
            </Button>
            <Button 
              onClick={() => handleExport(exportLeaveApplicationsToExcel, "quick-applications-excel")}
              disabled={isExporting === "quick-applications-excel"}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              {isExporting === "quick-applications-excel" ? "Exporting..." : "Applications (Excel)"}
            </Button>
            <Button 
              onClick={handleDownloadUpdatedCSV}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Updated CSV
            </Button>
            <Button 
              onClick={() => handleExport(exportAllDataToExcel, "quick-complete")}
              disabled={isExporting === "quick-complete"}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              {isExporting === "quick-complete" ? "Exporting..." : "Complete Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${report.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {report.exports.length} format{report.exports.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.exports.map((exportOption, index) => {
                  const ExportIcon = exportOption.icon;
                  return (
                    <Button
                      key={index}
                      onClick={exportOption.action}
                      disabled={exportOption.loading}
                      variant={exportOption.variant || (index === 0 ? "default" : "outline")}
                      size="sm"
                      className="w-full flex items-center gap-2 justify-start"
                    >
                      <ExportIcon className="h-4 w-4" />
                      {exportOption.loading ? "Exporting..." : exportOption.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Export Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Tips</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Important Note about CSV Updates */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Download className="h-4 w-4" />
              About CSV File Updates
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Important:</strong> Due to browser security restrictions, new leave applications cannot directly update the original CSV file. 
              Instead, they are stored in browser memory and can be downloaded as an updated CSV file using the "Download Updated CSV" button. 
              In a real application with a backend server, this data would be automatically saved to the database.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Excel Files (.xlsx)
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Perfect for data analysis and calculations</li>
                <li>• Can be opened in Microsoft Excel, Google Sheets</li>
                <li>• Supports multiple sheets in complete reports</li>
                <li>• Maintains data formatting and structure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-600" />
                PDF Files (.pdf)
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Professional format for presentations</li>
                <li>• Preserves exact formatting and layout</li>
                <li>• Easy to share and print</li>
                <li>• Includes summary statistics and analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
