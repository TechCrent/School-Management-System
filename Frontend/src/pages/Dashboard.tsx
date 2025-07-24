import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getStudents, getTeachers, getHomework, getClasses } from '../api/edulite';
import { Student, Class } from '../data/mockData';
import teachersJson from '../data/teachers.json';
import subjectsJson from '../data/subjects.json';
type TeacherType = { teacher_id: string; full_name: string; email: string; subject_name: string; phone?: string };
type SubjectType = { subject_id: string; name: string; description?: string };
const teachersData: TeacherType[] = teachersJson as unknown as TeacherType[];
const subjectsData: SubjectType[] = subjectsJson as unknown as SubjectType[];
type Teacher = { teacher_id: string; full_name: string; email: string; subject_name: string; phone?: string };
type Homework = { homework_id: string; title: string; due_date: string; status: string; subject_id: string; description?: string; feedback?: string };
import { formatDateWithTimezone } from '@/lib/utils';
import { useNotification } from '@/components/layout/NotificationContext';
import { Loading } from '@/components/ui/loading';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalHomework: number;
  totalClasses: number;
  pendingHomework: number;
  completedHomework: number;
}

type HomeworkType = Homework & { teacher_id?: string; grade?: string };
type ClassType = Class & { teacher_id?: string; subject_id?: string; grade?: string };

export const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalHomework: 0,
    totalClasses: 0,
    pendingHomework: 0,
    completedHomework: 0
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<Student | null>(null);
  const { addNotification } = useNotification();

  // Compute student-specific class and homework at the top level for use in JSX and functions
  const studentClass: Class | undefined = (userRole === 'student' && userProfile)
    ? classes.find(cls => cls.class_id === userProfile.class_id)
    : undefined;
  const studentHomework: Homework[] = (userRole === 'student' && studentClass)
    ? homework.filter((hw: Homework) => hw.subject_id === studentClass.subject_id)
    : [];

  useEffect(() => {
    console.log('Dashboard: USE_MOCK =', localStorage.getItem('USE_MOCK'));
    setLoading(true);
    // Get user info from localStorage
    const role = localStorage.getItem('role') || '';
    const userInfo = localStorage.getItem('user');
    const user = userInfo ? JSON.parse(userInfo) : null;
    setUserRole(role);
    setUserName(user?.full_name || 'User');
    setUserId(user?.student_id || user?.id || '');
    setUserProfile(user);
    const isMock = localStorage.getItem('USE_MOCK') === null ? true : localStorage.getItem('USE_MOCK') === 'true';
    Promise.all([
      getStudents(isMock ? { noPaginate: 'true' } : {}),
      getTeachers(isMock ? { noPaginate: 'true' } : {}),
      getHomework(),
      getClasses()
    ]).then(([studentsRes, teachersRes, homeworkRes, classesRes]) => {
      console.log('Dashboard data:', {
        studentsRes,
        teachersRes,
        homeworkRes,
        classesRes
      });
      setStudents(studentsRes.data || []);
      setTeachers(teachersRes.data || []);
      setHomework(homeworkRes.data || []);
      setClasses(classesRes.data || []);
      const pendingHW = (homeworkRes.data || []).filter((hw: Homework) => hw.status === 'pending').length;
      const completedHW = (homeworkRes.data || []).filter((hw: Homework) => hw.status === 'submitted' || hw.status === 'graded').length;
      setStats({
        totalStudents: typeof studentsRes.total === 'number' ? studentsRes.total : (Array.isArray(studentsRes.data) ? studentsRes.data.length : 0),
        totalTeachers: typeof teachersRes.total === 'number' ? teachersRes.total : (Array.isArray(teachersRes.data) ? teachersRes.data.length : 0),
        totalHomework: typeof homeworkRes.total === 'number' ? homeworkRes.total : (Array.isArray(homeworkRes.data) ? homeworkRes.data.length : 0),
        totalClasses: typeof classesRes.total === 'number' ? classesRes.total : (Array.isArray(classesRes.data) ? classesRes.data.length : 0),
        pendingHomework: pendingHW,
        completedHomework: completedHW
      });
      // Add mock notifications for students
      if (role === 'student') {
        addNotification({
          title: 'New Homework Assigned',
          description: 'Algebra Practice is due soon!'
        });
        addNotification({
          title: 'Class Rescheduled',
          description: 'Your English class has a new time.'
        });
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Dashboard data load error:', err);
      setLoading(false);
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('Good Morning');
    if (hour < 18) return t('Good Afternoon');
    return t('Good Evening');
  };

  const getRoleSpecificContent = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('Total Students')}</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('Active students in system')}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300 bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('Total Teachers')}</CardTitle>
                  <GraduationCap className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalTeachers}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('Active teaching staff')}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300 bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('Active Classes')}</CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalClasses}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('Scheduled classes')}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300 bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('Homework Tasks')}</CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalHomework}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('Total assignments')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        );
      case 'teacher':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  My Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClasses}</div>
                <p className="text-sm text-muted-foreground">Active classes</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingHomework}</div>
                <p className="text-sm text-muted-foreground">Assignments to review</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  My Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-sm text-muted-foreground">Students in my classes</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'student':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Homework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentHomework.length}</div>
                <p className="text-sm text-muted-foreground">Assignments for your class</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  My Class
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentClass ? (
                  <>
                    <div className="font-medium">{studentClass.name}</div>
                    <div className="text-sm text-muted-foreground">Schedule: {studentClass.schedule}</div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No class assigned</div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProfile ? (
                  <div>
                    <div className="font-medium">{userProfile.full_name}</div>
                    <div className="text-sm text-muted-foreground">{userProfile.email}</div>
                    <div className="text-sm text-muted-foreground">Grade: {userProfile.grade || '-'}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No profile info</div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending Homework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingHomework}</div>
                <p className="text-sm text-muted-foreground">Assignments due</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedHomework}</div>
                <p className="text-sm text-muted-foreground">Assignments done</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Get timezone from settings in localStorage
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
  const timezone = settings?.appearance?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (loading) return <Loading size="lg" text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('Welcome to your EduLite dashboard')}
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {userRole?.toUpperCase()}
          </Badge>
        </div>
      </div>
      {/* Role-specific content */}
      {getRoleSpecificContent()}
      {/* Recent Activity */}
      {userRole === 'student' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Homework
              </CardTitle>
              <CardDescription>
                Latest assignments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentHomework.slice(0, 3).map((hw) => (
                  <div key={hw.homework_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{hw.title}</p>
                      <p className="text-sm text-muted-foreground">Due: {formatDateWithTimezone(hw.due_date, timezone, 'yyyy-MM-dd HH:mm zzz')}</p>
                    </div>
                    <Badge 
                      variant={hw.status === 'pending' ? 'destructive' : 'default'}
                      className="capitalize"
                    >
                      {hw.status}
                    </Badge>
                  </div>
                ))}
                {studentHomework.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>{t('No homework assigned')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                Upcoming Class
              </CardTitle>
              <CardDescription>
                Your class schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentClass ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{studentClass.name}</p>
                      <p className="text-sm text-muted-foreground">{studentClass.schedule}</p>
                    </div>
                    <Badge variant="outline">
                      {studentClass.student_count} students
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>{t('No class scheduled')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Homeworks
              </CardTitle>
              <CardDescription>
                Latest assignments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {homework.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>{t('No homeworks assigned')}</p>
                  </div>
                )}
                {homework.map((hw) => {
                  const hwTyped = hw as HomeworkType;
                  const subject = subjectsData.find((subj) => subj.subject_id === hwTyped.subject_id);
                  const teacher = teachersData.find((t) => t.teacher_id === hwTyped.teacher_id);
                  return (
                    <div key={hw.homework_id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-muted rounded-lg gap-2">
                      <div>
                        <p className="font-medium">{hw.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {formatDateWithTimezone(hw.due_date, timezone, 'yyyy-MM-dd HH:mm zzz')}</p>
                        <p className="text-xs text-muted-foreground">
                          {subject ? `Subject: ${subject.name}` : ''}
                          {hwTyped.grade ? ` | Grade: ${hwTyped.grade}` : ''}
                          {teacher ? ` | Teacher: ${teacher.full_name}` : ''}
                        </p>
                      </div>
                      <Badge 
                        variant={hw.status === 'pending' ? 'destructive' : 'default'}
                        className="capitalize"
                      >
                        {hw.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                Upcoming Classes
              </CardTitle>
              <CardDescription>
                Your scheduled classes for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classes.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>{t('No classes scheduled for today')}</p>
                  </div>
                )}
                {classes.map((cls) => {
                  const clsTyped = cls as ClassType;
                  const teacher = teachersData.find((t) => t.teacher_id === clsTyped.teacher_id);
                  const subject = subjectsData.find((subj) => subj.subject_id === clsTyped.subject_id);
                  return (
                    <div key={cls.class_id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-muted rounded-lg gap-2">
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDateWithTimezone(cls.schedule, timezone, 'yyyy-MM-dd HH:mm zzz')}</p>
                        <p className="text-xs text-muted-foreground">
                          {subject ? `Subject: ${subject.name}` : ''}
                          {clsTyped.grade ? ` | Grade: ${clsTyped.grade}` : ''}
                          {teacher ? ` | Teacher: ${teacher.full_name}` : ''}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {cls.student_count} students
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};