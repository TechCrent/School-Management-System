import { useEffect, useState } from 'react';
import { getStudents, getTeachers, getClasses, getSubjects, getHomework, getStudentPerformance, getAttendanceByClass, getStudentAnalytics } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Filter,
  Search,
  Eye,
  FileText,
  Award,
  Target,
  AlertTriangle
} from 'lucide-react';

type StudentPerformance = { 
  performance_id: string; 
  student_id: string; 
  class_id: string; 
  subject_id: string; 
  semester: string; 
  overall_grade: string; 
  gpa: number; 
  attendance_rate: number; 
  homework_completion_rate: number; 
  participation_score: number; 
  last_updated: string 
};

type Attendance = { 
  attendance_id: string; 
  class_id: string; 
  date: string; 
  student_id: string; 
  status: 'present' | 'absent' | 'late' | 'excused'; 
  notes?: string 
};

type Student = {
  student_id: string;
  full_name: string;
  email: string;
  grade: string;
  date_of_birth: string;
  address: string;
  parent1_id: string;
  parent2_id: string;
  parent1_email?: string;
  parent1_name?: string;
  parent1_contact?: string;
  parent2_email?: string;
  parent2_name?: string;
  parent2_contact?: string;
  status?: 'active' | 'inactive';
  class_id?: string;
};

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [homework, setHomework] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  
  // Analytics states
  const [gradeDistribution, setGradeDistribution] = useState({ A: 0, B: 0, C: 0, D: 0, F: 0 });
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, excused: 0 });
  const [subjectPerformance, setSubjectPerformance] = useState<Record<string, { avgGPA: number, totalStudents: number }>>({});
  const [topPerformers, setTopPerformers] = useState<Array<{ student: Student, gpa: number }>>([]);
  const [needsAttention, setNeedsAttention] = useState<Array<{ student: Student, issues: string[] }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, subjectsRes, homeworkRes, performanceRes, attendanceRes] = await Promise.all([
          getStudents(),
          getTeachers(),
          getClasses(),
          getSubjects(),
          getHomework(),
          getStudentPerformance('all'),
          getAttendanceByClass('class_1')
        ]);

        const studentsData = studentsRes.data || [];
        const teachersData = teachersRes.data || [];
        const classesData = classesRes.data || [];
        const subjectsData = subjectsRes.data || [];
        const homeworkData = homeworkRes.data || [];
        const performanceData = performanceRes.data || [];
        const attendanceData = attendanceRes.data || [];

        setStudents(studentsData);
        setTeachers(teachersData);
        setClasses(classesData);
        setSubjects(subjectsData);
        setHomework(homeworkData);
        setStudentPerformance(performanceData);
        setAttendanceData(attendanceData);

        // Calculate analytics
        calculateAnalytics(performanceData, attendanceData, studentsData, subjectsData);

      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateAnalytics = (performance: StudentPerformance[], attendance: Attendance[], students: Student[], subjects: any[]) => {
    // Grade distribution
    const grades = performance.reduce((acc: any, perf: any) => {
      const grade = perf.overall_grade?.charAt(0) || 'F';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    setGradeDistribution({
      A: grades.A || 0,
      B: grades.B || 0,
      C: grades.C || 0,
      D: grades.D || 0,
      F: grades.F || 0
    });

    // Attendance statistics
    const attendanceStats = attendance.reduce((acc: any, record: any) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    setAttendanceStats({
      present: attendanceStats.present || 0,
      absent: attendanceStats.absent || 0,
      late: attendanceStats.late || 0,
      excused: attendanceStats.excused || 0
    });

    // Subject performance
    const subjectPerf = subjects.reduce((acc: any, subject: any) => {
      const subjectGrades = performance.filter(p => p.subject_id === subject.subject_id);
      const avgGPA = subjectGrades.length > 0 
        ? subjectGrades.reduce((sum, p) => sum + p.gpa, 0) / subjectGrades.length 
        : 0;
      
      acc[subject.name] = {
        avgGPA: Math.round(avgGPA * 100) / 100,
        totalStudents: subjectGrades.length
      };
      return acc;
    }, {});

    setSubjectPerformance(subjectPerf);

    // Top performers
    const studentGPAs = students.map(student => {
      const studentPerf = performance.find(p => p.student_id === student.student_id);
      return {
        student,
        gpa: studentPerf?.gpa || 0
      };
    }).sort((a, b) => b.gpa - a.gpa).slice(0, 5);

    setTopPerformers(studentGPAs);

    // Students needing attention
    const needsAttentionStudents = students.map(student => {
      const studentPerf = performance.find(p => p.student_id === student.student_id);
      const issues = [];
      
      if (studentPerf) {
        if (studentPerf.gpa < 2.0) issues.push('Low GPA');
        if (studentPerf.attendance_rate < 80) issues.push('Poor Attendance');
        if (studentPerf.homework_completion_rate < 70) issues.push('Missing Homework');
      }
      
      return { student, issues };
    }).filter(item => item.issues.length > 0).slice(0, 5);

    setNeedsAttention(needsAttentionStudents);
  };

  const getAverageGPA = () => {
    if (studentPerformance.length === 0) return 0;
    const totalGPA = studentPerformance.reduce((sum, perf) => sum + perf.gpa, 0);
    return (totalGPA / studentPerformance.length).toFixed(2);
  };

  const getAttendanceRate = () => {
    const total = attendanceStats.present + attendanceStats.absent + attendanceStats.late + attendanceStats.excused;
    if (total === 0) return 0;
    return ((attendanceStats.present / total) * 100).toFixed(1);
  };

  const getHomeworkCompletionRate = () => {
    if (studentPerformance.length === 0) return 0;
    const totalRate = studentPerformance.reduce((sum, perf) => sum + perf.homework_completion_rate, 0);
    return (totalRate / studentPerformance.length).toFixed(1);
  };

  const exportReport = (type: string) => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
    // In a real implementation, this would generate and download a file
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Reports</h2>
          <p className="text-muted-foreground">Loading comprehensive reports...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
              <div className="p-6 text-center">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Reports</h2>
            <p className="text-muted-foreground">Comprehensive analytics and performance insights</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => exportReport('summary')}>
              <Download className="h-4 w-4 mr-2" />
              Export Summary
            </Button>
            <Button variant="outline" onClick={() => exportReport('detailed')}>
              <FileText className="h-4 w-4 mr-2" />
              Export Detailed
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Semester</SelectItem>
                  <SelectItem value="previous">Previous Semester</SelectItem>
                  <SelectItem value="year">Academic Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Grade Level</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.subject_id} value={subject.subject_id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageGPA()}</div>
            <Progress value={parseFloat(getAverageGPA()) * 20} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 3.5 GPA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAttendanceRate()}%</div>
            <Progress value={parseFloat(getAttendanceRate())} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 95%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Homework Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getHomeworkCompletionRate()}%</div>
            <Progress value={parseFloat(getHomeworkCompletionRate())} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 90%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active: {students.filter(s => s.status === 'active').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Overall performance across all students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={grade === 'A' ? 'default' : grade === 'B' ? 'secondary' : 'outline'}>
                          {grade}
                        </Badge>
                        <span className="text-sm">{count} students</span>
                      </div>
                      <div className="w-32">
                        <Progress 
                          value={(count / Math.max(...Object.values(gradeDistribution))) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>Current attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                    <div className="text-sm text-muted-foreground">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                    <div className="text-sm text-muted-foreground">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
                    <div className="text-sm text-muted-foreground">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{attendanceStats.excused}</div>
                    <div className="text-sm text-muted-foreground">Excused</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Students with highest GPA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.student.student_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{performer.student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{performer.student.grade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{performer.gpa.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">GPA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Academic performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Performers (A-B)</span>
                    <Badge variant="default">
                      {gradeDistribution.A + gradeDistribution.B} students
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Performers (C)</span>
                    <Badge variant="secondary">
                      {gradeDistribution.C} students
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Needs Improvement (D-F)</span>
                    <Badge variant="outline">
                      {gradeDistribution.D + gradeDistribution.F} students
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analysis</CardTitle>
              <CardDescription>Detailed attendance statistics and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{getAttendanceRate()}%</div>
                  <p className="text-sm text-muted-foreground">Overall Attendance Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {attendanceStats.absent + attendanceStats.late}
                  </div>
                  <p className="text-sm text-muted-foreground">Absences & Late</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{attendanceStats.excused}</div>
                  <p className="text-sm text-muted-foreground">Excused Absences</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Performance breakdown by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(subjectPerformance).map(([subject, data]) => (
                  <div key={subject} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{subject}</p>
                        <p className="text-sm text-muted-foreground">{data.totalStudents} students</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{data.avgGPA}</p>
                      <p className="text-xs text-muted-foreground">Average GPA</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
              <CardDescription>Comprehensive student statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{students.length}</div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {students.filter(s => s.status === 'active').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {students.filter(s => s.status === 'inactive').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Inactive Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Students Needing Attention</CardTitle>
              <CardDescription>Students with academic or attendance issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {needsAttention.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No students currently need attention</p>
                  </div>
                ) : (
                  needsAttention.map((item) => (
                    <div key={item.student.student_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">{item.student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{item.student.grade}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {item.issues.map((issue, index) => (
                          <Badge key={index} variant="destructive">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports; 