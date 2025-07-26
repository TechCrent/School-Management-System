import { useEffect, useState } from 'react';
import { getStudents, getTeachers, getClasses, getSubjects, getHomework, getStudentPerformance, getAttendanceByClass } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Activity
} from 'lucide-react';

type Homework = { homework_id: string; title: string; due_date: string; status: string; subject_id: string; description?: string; feedback?: string };
type StudentPerformance = { performance_id: string; student_id: string; class_id: string; subject_id: string; semester: string; overall_grade: string; gpa: number; attendance_rate: number; homework_completion_rate: number; participation_score: number; last_updated: string };
type Attendance = { attendance_id: string; class_id: string; date: string; student_id: string; status: 'present' | 'absent' | 'late' | 'excused'; notes?: string };

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Students', value: 0, icon: Users, trend: 0, color: 'text-blue-600' },
    { label: 'Total Teachers', value: 0, icon: GraduationCap, trend: 0, color: 'text-green-600' },
    { label: 'Total Classes', value: 0, icon: Calendar, trend: 0, color: 'text-purple-600' },
    { label: 'Total Subjects', value: 0, icon: BookOpen, trend: 0, color: 'text-orange-600' },
  ]);
  const [recentHomework, setRecentHomework] = useState<Homework[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeDistribution, setGradeDistribution] = useState({ A: 0, B: 0, C: 0, D: 0, F: 0 });
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, excused: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, subjectsRes, homeworkRes, performanceRes, attendanceRes] = await Promise.all([
          getStudents(),
          getTeachers(),
          getClasses(),
          getSubjects(),
          getHomework(),
          getStudentPerformance('all'), // Mock API will return all performance data
          getAttendanceByClass('class_1') // Mock API will return attendance data
        ]);

        const students = studentsRes.data || [];
        const teachers = teachersRes.data || [];
        const classes = classesRes.data || [];
        const subjects = subjectsRes.data || [];
        const homework = homeworkRes.data || [];
        const performance = performanceRes.data || [];
        const attendance = attendanceRes.data || [];

        setStats([
          { label: 'Total Students', value: students.length, icon: Users, trend: 5.2, color: 'text-blue-600' },
          { label: 'Total Teachers', value: teachers.length, icon: GraduationCap, trend: 2.1, color: 'text-green-600' },
          { label: 'Total Classes', value: classes.length, icon: Calendar, trend: 8.7, color: 'text-purple-600' },
          { label: 'Total Subjects', value: subjects.length, icon: BookOpen, trend: 0, color: 'text-orange-600' },
        ]);

        setRecentHomework(homework.slice(0, 5));
        setStudentPerformance(performance);
        setAttendanceData(attendance);

        // Fix: Use explicit types for reducers
        // For grades
        const grades = performance.reduce((acc: Record<string, number>, perf: StudentPerformance) => {
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

        // For attendance
        const attendanceStats = attendance.reduce((acc: Record<string, number>, record: Attendance) => {
          acc[record.status] = (acc[record.status] || 0) + 1;
          return acc;
        }, {});

        setAttendanceStats({
          present: attendanceStats.present || 0,
          absent: attendanceStats.absent || 0,
          late: attendanceStats.late || 0,
          excused: attendanceStats.excused || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard data...</p>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h2>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive overview of school management system statistics and analytics</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                {stat.trend > 0 ? '+' : ''}{stat.trend}% from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New student registration</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Homework assignment created</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Grade update completed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors" aria-label="Add Student" onClick={() => window.location.href='/students'}>
                    <Users className="h-4 w-4 mb-2" />
                    <p className="text-sm font-medium">Add Student</p>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors" aria-label="Add Teacher" onClick={() => window.location.href='/teachers'}>
                    <GraduationCap className="h-4 w-4 mb-2" />
                    <p className="text-sm font-medium">Add Teacher</p>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors" aria-label="Create Class" onClick={() => window.location.href='/classes'}>
                    <Calendar className="h-4 w-4 mb-2" />
                    <p className="text-sm font-medium">Create Class</p>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors" aria-label="Add Subject" onClick={() => window.location.href='/subjects'}>
                    <BookOpen className="h-4 w-4 mb-2" />
                    <p className="text-sm font-medium">Add Subject</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>Overall performance across all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(gradeDistribution).map(([grade, count]) => {
                  let badgeVariant: 'default' | 'secondary' | 'outline' = 'outline';
                  if (grade === 'A') badgeVariant = 'default';
                  else if (grade === 'B') badgeVariant = 'secondary';
                  const countNum = Number(count);
                  return (
                    <div key={String(grade)} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={badgeVariant}>
                          {grade}
                        </Badge>
                        <span className="text-sm">{countNum} students</span>
                      </div>
                      <div className="w-32">
                        <Progress 
                          value={
                            Math.max(...(Object.values(gradeDistribution) as number[])) === 0
                              ? 0
                              : (countNum / Math.max(...(Object.values(gradeDistribution) as number[]))) * 100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Statistics</CardTitle>
              <CardDescription>Current attendance patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </TabsContent>

        <TabsContent value="homework" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Homework Activity</CardTitle>
              <CardDescription>Latest assignments and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentHomework.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No recent homework activity</p>
                  </div>
                ) : (
                  recentHomework.map((hw: Homework) => (
                    <div key={hw.homework_id} className="rounded-lg border bg-background p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="font-medium text-foreground">{hw.title}</div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {hw.due_date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className={`h-2 w-2 rounded-full ${
                                hw.status === 'pending' ? 'bg-yellow-500' :
                                hw.status === 'submitted' ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}></div>
                              <span className="capitalize">{hw.status}</span>
                            </div>
                          </div>
                        </div>
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

export default AdminDashboard; 