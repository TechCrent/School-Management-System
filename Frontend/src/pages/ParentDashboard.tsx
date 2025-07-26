import { useEffect, useState } from 'react';
import { getStudents, getHomework, getClasses, getStudentPerformance, ApiResponse } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  FileText,
  Bell
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import parents from '../data/parents.json';
import studentEnrollments from '../data/studentEnrollments.json';

interface Student {
  student_id: string;
  full_name: string;
  grade: string;
  email: string;
  status?: string;
  parent1_id?: string;
  parent2_id?: string;
}

interface Homework {
  homework_id: string;
  title: string;
  due_date: string;
  status: string;
  description?: string;
}

interface Class {
  class_id: string;
  name: string;
  teacher_id: string;
  schedule: string;
}

interface StudentPerformance {
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
  last_updated: string;
}

const ParentDashboard = () => {
  const [children, setChildren] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [performance, setPerformance] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  // Get parent from localStorage or use default for testing
  const storedUser = localStorage.getItem('user');
  const parentId = storedUser ? JSON.parse(storedUser).parent_id : 'P0001';
  const parent = parents.find(p => p.parent_id === parentId);

  useEffect(() => {
    loadDashboardData();
  }, [parentId]);

  const loadDashboardData = async () => {
    try {
      const [studentsRes, homeworkRes, classesRes, performanceRes] = await Promise.all([
        getStudents(),
        getHomework(),
        getClasses(),
        getStudentPerformance()
      ]);

      if (studentsRes.status === 'success' && studentsRes.data) {
        // Get children for this parent using parent1_id and parent2_id
        const parentChildren = studentsRes.data.filter((student: Student) => 
          student.parent1_id === parent?.parent_id || student.parent2_id === parent?.parent_id
        );
        setChildren(parentChildren);
      }

      if (homeworkRes.status === 'success' && homeworkRes.data) {
        setHomework(homeworkRes.data);
      }

      if (classesRes.status === 'success' && classesRes.data) {
        setClasses(classesRes.data);
      }

      if (performanceRes.status === 'success' && performanceRes.data) {
        setPerformance(performanceRes.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const getChildHomework = (studentId: string) => {
    // Get classes the child is enrolled in
    const childEnrollments = studentEnrollments.filter(
      enrollment => enrollment.student_id === studentId && enrollment.status === 'active'
    );
    const childClassIds = childEnrollments.map(enrollment => enrollment.class_id);
    
    // Get homework for those classes
    return homework.filter(hw => 
      hw.class_id && childClassIds.includes(hw.class_id) && hw.status === 'pending'
    ).slice(0, 3);
  };

  const getChildPerformance = (studentId: string) => {
    return performance.find(p => p.student_id === studentId);
  };

  const getUpcomingDeadlines = () => {
    const allHomework = children.flatMap(child => getChildHomework(child.student_id));
    return allHomework
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5);
  };

  const getOverallStats = () => {
    const totalChildren = children.length;
    const totalHomework = children.reduce((sum, child) => sum + getChildHomework(child.student_id).length, 0);
    const averageGPA = children.length > 0 
      ? children.reduce((sum, child) => {
          const perf = getChildPerformance(child.student_id);
          return sum + (perf?.gpa || 0);
        }, 0) / children.length
      : 0;
    
    return { totalChildren, totalHomework, averageGPA };
  };

  if (loading) return <Loading size="lg" text="Loading dashboard..." />;

  const stats = getOverallStats();
  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }]} />
      
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Parent Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {parent?.full_name || 'Parent'}! Here's an overview of your children's progress.
        </p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Children</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalChildren}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Homework</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalHomework}</div>
            <p className="text-xs text-muted-foreground">Assignments due</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.averageGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all children</p>
          </CardContent>
        </Card>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map(child => {
          const childHomework = getChildHomework(child.student_id);
          const childPerformance = getChildPerformance(child.student_id);
          
          return (
            <Card key={child.student_id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{child.full_name}</CardTitle>
                    <CardDescription>Grade {child.grade} • {child.status || 'Active'}</CardDescription>
                  </div>
                  <Badge variant={childPerformance?.overall_grade === 'A' ? 'default' : 'secondary'}>
                    {childPerformance?.overall_grade || 'N/A'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Summary */}
                {childPerformance && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">GPA:</span>
                      <span className="ml-2 font-medium">{childPerformance.gpa.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attendance:</span>
                      <span className="ml-2 font-medium">{childPerformance.attendance_rate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Homework:</span>
                      <span className="ml-2 font-medium">{childPerformance.homework_completion_rate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Participation:</span>
                      <span className="ml-2 font-medium">{childPerformance.participation_score}/10</span>
                    </div>
                  </div>
                )}

                {/* Upcoming Homework */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Upcoming Homework
                  </h4>
                  {childHomework.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending homework</p>
                  ) : (
                    <div className="space-y-2">
                      {childHomework.map(hw => (
                        <div key={hw.homework_id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{hw.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {hw.due_date}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Important dates for all your children</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map(hw => {
                const child = children.find(c => {
                  const childEnrollments = studentEnrollments.filter(
                    enrollment => enrollment.student_id === c.student_id && enrollment.status === 'active'
                  );
                  return childEnrollments.some(enrollment => enrollment.class_id === hw.class_id);
                });
                
                return (
                  <div key={hw.homework_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{hw.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {child?.full_name} • Due: {hw.due_date}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Due Soon
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">View Children</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Homework</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Progress</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Bell className="h-6 w-6" />
              <span className="text-sm">Notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {children.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Children Found</h3>
            <p className="text-muted-foreground">
              Please contact your administrator to link your children to your account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentDashboard; 