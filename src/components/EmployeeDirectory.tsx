import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Mail, Phone, MapPin, Edit } from "lucide-react";
import { employeeDataService, Employee } from "@/lib/data";

const EmployeeDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real employee data
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        await employeeDataService.loadEmployeeData();
        const employeeData = employeeDataService.getAllEmployees();
        setEmployees(employeeData);
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Extract unique departments from employee data
  const departments = Array.from(new Set(employees.map(emp => emp.Email.split('@')[0].split('.')[1] || 'General')
    .map(dept => dept.charAt(0).toUpperCase() + dept.slice(1))));

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.Email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const empDepartment = employee.Email.split('@')[0].split('.')[1] || 'general';
    const matchesDepartment = departmentFilter === "all" || 
                             empDepartment.toLowerCase() === departmentFilter.toLowerCase();
    
    // For now, we'll assume all employees are active since the CSV doesn't have status
    const matchesStatus = statusFilter === "all" || statusFilter === "Active";
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-red-100 text-red-800';
      case 'Remote': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDepartmentFromEmail = (email: string) => {
    const dept = email.split('@')[0].split('.')[1] || 'general';
    return dept.charAt(0).toUpperCase() + dept.slice(1);
  };

  const getTotalLeaveBalance = (employee: Employee) => {
    return employee.Sick_Leave + employee.Casual_Leave + employee.Earned_Leave;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Loading Employee Directory...</h2>
          <p className="text-slate-600">Fetching employee data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Directory</h2>
          <p className="text-slate-600">Manage team members and their information</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.Employee_ID} className="shadow-lg border-0 bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                      {getInitials(employee.Name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{employee.Name}</CardTitle>
                    <CardDescription>ID: {employee.Employee_ID}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Department */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor('Active')}>
                  Active
                </Badge>
                <Badge variant="outline">{getDepartmentFromEmail(employee.Email)}</Badge>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {employee.Email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="h-4 w-4 mr-2" />
                  +91 {Math.floor(Math.random() * 9000000000) + 1000000000}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  Office - {getDepartmentFromEmail(employee.Email)}
                </div>
              </div>

              {/* Leave Balance */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Leave Balance</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-600">{employee.Earned_Leave}</div>
                    <div className="text-xs text-blue-600">Earned</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-red-600">{employee.Sick_Leave}</div>
                    <div className="text-xs text-red-600">Sick</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-purple-600">{employee.Casual_Leave}</div>
                    <div className="text-xs text-purple-600">Casual</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredEmployees.length === 0 && (
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <p className="text-slate-600">No employees found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeDirectory;
