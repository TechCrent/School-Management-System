import { useEffect, useState } from 'react';
import { getClasses, getStudents, getHomework, ApiResponse } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Plus,
  Eye
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/components/layout/NotificationContext';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

interface Class {
  class_id: string;
  name: string;
  schedule: string;
  student_count: number;
  teacher_id: string;
  subject_id: string;
}

interface Student {
  student_id: string;
  full_name: string;
  class_id: string;
  email: string;
}

interface Homework {
  homework_id: string;
  title: string;
  due_date: string;
  status: string;
  teacher_id: string;
  subject_id?: string;
  description?: string;
}

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalHomework: number;
  pendingHomework: number;
  completedHomework: number;
  averageAttendance: number;
}

export const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalHomework: 0,
    pendingHomework: 0,
    completedHomework: 0,
    averageAttendance: 0
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const { addNotification } = useNotification();

  // Get teacher ID from localStorage
  const storedUser = localStorage.getItem('user');
  const teacherId = storedUser ? JSON.parse(storedUser).teacher_id : 't-1';

  useEffect(() => {
    console.log('TeacherDashboard: Loading data for teacher:', teacherId);
    setLoading(true);
    
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    const user = userInfo ? JSON.parse(userInfo) : null;
    setUserName(user?.full_name || 'Teacher');

    const isMock = localStorage.getItem('USE_MOCK') === null ? true : localStorage.getItem('USE_MOCK') === 'true';
    
    Promise.all([
      getClasses(isMock ? { noPaginate: 'true' } : {}),
      getStudents(isMock ? { noPaginate: 'true' } : {}),
      getHomework()
    ]).then(([classesRes, studentsRes, homeworkRes]) => {
      console.log('TeacherDashboard data:', {
        classesRes,
        studentsRes,
        homeworkRes
      });

      // Filter data for this teacher
      const teacherClasses = (classesRes.data || []).filter((cls: Class) => cls.teacher_id === teacherId);
      const teacherHomework = (homeworkRes.data || []).filter((hw: Homework) => hw.teacher_id === teacherId);
      
      // Get students enrolled in teacher's classes
      const teacherClassIds = teacherClasses.map(cls => cls.class_id);
      const teacherStudents = (studentsRes.data || []).filter((student: Student) => 
        teacherClassIds.includes(student.class_id)
      );

      setClasses(teacherClasses);
      setStudents(teacherStudents);
      setHomework(teacherHomework);

      // Calculate stats
      const pendingHW = teacherHomework.filter((hw: Homework) => hw.status === 'pending').length;
      const completedHW = teacherHomework.filter((hw: Homework) => hw.status === 'submitted' || hw.status === 'graded').length;
      
      setStats({
        totalClasses: teacherClasses.length,
        totalStudents: teacherStudents.length,
        totalHomework: teacherHomework.length,
        pendingHomework: pendingHW,
        completedHomework: completedHW,
        averageAttendance: 92.5 // Mock data for now
      });

      // Add welcome notification
      addNotification({
        title: 'Welcome back!',
        description: `You have ${pendingHW} homework assignments to review.`
      });

      setLoading(false);
    }).catch((err) => {
      console.error('TeacherDashboard data load error:', err);
      setLoading(false);
    });
  }, [teacherId, addNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpcomingClasses = () => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return classes.filter(cls => 
      cls.schedule.toLowerCase().includes(dayOfWeek)
    ).slice(0, 3);
  };

  const getRecentHomework = () => {
    return homework
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
      .slice(0, 3);
  };

  if (loading) return <Loading size="lg" text="Loading your dashboard..." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      
      {/* Welcome Header */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {userName}!
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with your classes today
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Active classes this semester</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students across all classes</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pendingHomework}</div>
            <p className="text-xs text-muted-foreground">Homework to grade</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">Average class attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/teacher/classes">
          <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Classes</h3>
                  <p className="text-sm text-muted-foreground">View and manage your classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/teacher/homework">
          <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Homework</h3>
                  <p className="text-sm text-muted-foreground">Create and grade assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/teacher/students">
          <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">My Students</h3>
                  <p className="text-sm text-muted-foreground">Track student progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Classes
            </CardTitle>
            <CardDescription>Your scheduled classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getUpcomingClasses().length > 0 ? (
                getUpcomingClasses().map(cls => (
                  <div key={cls.class_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{cls.name}</h4>
                      <p className="text-sm text-muted-foreground">{cls.schedule}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">{cls.student_count} students</span>
                      </div>
                    </div>
                    <Link to="/teacher/classes">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Homework */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Homework
            </CardTitle>
            <CardDescription>Latest assignments and submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentHomework().length > 0 ? (
                getRecentHomework().map(hw => (
                  <div key={hw.homework_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{hw.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(hw.due_date).toLocaleDateString()}
                      </p>
                      <Badge className={`mt-1 ${getStatusColor(hw.status)}`}>
                        {hw.status}
                      </Badge>
                    </div>
                    <Link to="/teacher/homework">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <p>No homework assignments yet</p>
                  <Link to="/teacher/homework">
                    <Button className="mt-2" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>Quick insights into your teaching metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalClasses}</div>
              <div className="text-sm text-muted-foreground">Active Classes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{stats.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.averageAttendance}%</div>
              <div className="text-sm text-muted-foreground">Average Attendance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 