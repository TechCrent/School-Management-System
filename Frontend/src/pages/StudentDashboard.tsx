import { useEffect, useState } from 'react';
import { getStudents, getHomework, getClasses } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Users, AlertCircle } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

interface Student {
  student_id: string;
  full_name: string;
  class_id: string;
  email: string;
  grade?: string;
}

interface Homework {
  homework_id: string;
  title: string;
  due_date: string;
  status: string;
  subject_id: string;
  description?: string;
  feedback?: string;
}

interface Class {
  class_id: string;
  name: string;
  schedule: string;
  student_count: number;
  subject_id?: string;
  grade?: string;
}

export const StudentDashboard = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const userInfo = localStorage.getItem('user');
    const user = userInfo ? JSON.parse(userInfo) : null;
    setStudent(user);
    const isMock = localStorage.getItem('USE_MOCK') === null ? true : localStorage.getItem('USE_MOCK') === 'true';
    Promise.all([
      getHomework(),
      getClasses()
    ]).then(([homeworkRes, classesRes]) => {
      // Filter homework for this student/class
      let studentClass: Class | null = null;
      if (user && classesRes.data) {
        studentClass = classesRes.data.find((cls: Class) => cls.class_id === user.class_id) || null;
      }
      setClassInfo(studentClass);
      let studentHomework: Homework[] = [];
      if (user && homeworkRes.data && studentClass) {
        studentHomework = homeworkRes.data.filter((hw: Homework) => hw.subject_id === studentClass.subject_id);
      }
      setHomework(studentHomework);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loading size="lg" text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Student Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {student?.full_name || 'Student'}!
        </p>
      </div>
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Homework</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{homework.length}</div>
            <p className="text-xs text-muted-foreground">Assignments for your class</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Class</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {classInfo ? (
              <>
                <div className="font-medium">{classInfo.name}</div>
                <div className="text-sm text-muted-foreground">Schedule: {classInfo.schedule}</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No class assigned</div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Profile</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {student ? (
              <div>
                <div className="font-medium">{student.full_name}</div>
                <div className="text-sm text-muted-foreground">{student.email}</div>
                <div className="text-sm text-muted-foreground">Grade: {student.grade || '-'}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No profile info</div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Recent Homework & Class Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Recent Homework
            </CardTitle>
            <CardDescription>Latest assignments and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {homework.slice(0, 3).map((hw) => (
                <div key={hw.homework_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{hw.title}</p>
                    <p className="text-sm text-muted-foreground">Due: {hw.due_date}</p>
                  </div>
                  <Badge 
                    variant={hw.status === 'pending' ? 'destructive' : 'default'}
                    className="capitalize"
                  >
                    {hw.status}
                  </Badge>
                </div>
              ))}
              {homework.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No homework assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              My Class
            </CardTitle>
            <CardDescription>Your class schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classInfo ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{classInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{classInfo.schedule}</p>
                  </div>
                  <Badge variant="outline">
                    {classInfo.student_count} students
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No class scheduled</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 