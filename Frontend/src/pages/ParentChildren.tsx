import { useState, useEffect } from 'react';
import { getStudents, getHomework, getClasses, getStudentPerformance, ApiResponse } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  FileText,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
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

const ParentChildren = () => {
  const [children, setChildren] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [performance, setPerformance] = useState<StudentPerformance[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Get parent from localStorage or use default for testing
  const storedUser = localStorage.getItem('user');
  const parentId = storedUser ? JSON.parse(storedUser).parent_id : 'P0001';
  const parent = parents.find(p => p.parent_id === parentId);

  useEffect(() => {
    loadChildrenData();
  }, [parentId]);

  const loadChildrenData = async () => {
    try {
      const [studentsRes, homeworkRes, classesRes, performanceRes] = await Promise.all([
        getStudents(),
        getHomework(),
        getClasses(),
        getStudentPerformance()
      ]);

      if (studentsRes.status === 'success' && studentsRes.data) {
        // Get children for this parent
        const childrenIds = parent?.children_ids || [];
        const parentChildren = studentsRes.data.filter((student: Student) => 
          childrenIds.includes(student.student_id)
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
      console.error('Error loading children data:', error);
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
      hw.class_id && childClassIds.includes(hw.class_id)
    );
  };

  const getChildPerformance = (studentId: string) => {
    return performance.find(p => p.student_id === studentId);
  };

  const getChildClasses = (studentId: string) => {
    const childEnrollments = studentEnrollments.filter(
      enrollment => enrollment.student_id === studentId && enrollment.status === 'active'
    );
    const childClassIds = childEnrollments.map(enrollment => enrollment.class_id);
    return classes.filter(cls => childClassIds.includes(cls.class_id));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const openChildDetails = (child: Student) => {
    setSelectedChild(child);
  };

  const closeModal = () => {
    setSelectedChild(null);
  };

  if (loading) return <Loading size="lg" text="Loading children..." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'My Children' }]} />
      
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Children</h2>
        <p className="text-muted-foreground">View detailed information about your children's academic progress</p>
      </div>

      {/* Children Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map(child => {
          const childPerformance = getChildPerformance(child.student_id);
          const childHomework = getChildHomework(child.student_id);
          const pendingHomework = childHomework.filter(hw => hw.status === 'pending').length;
          
          return (
            <Card 
              key={child.student_id} 
              className="shadow-card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openChildDetails(child)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.full_name}</CardTitle>
                      <CardDescription>Grade {child.grade}</CardDescription>
                    </div>
                  </div>
                  {childPerformance && (
                    <Badge variant={childPerformance.overall_grade === 'A' ? 'default' : 'secondary'}>
                      {childPerformance.overall_grade}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {childPerformance && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">GPA:</span>
                      <span className="font-medium">{childPerformance.gpa.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Attendance:</span>
                      <span className="font-medium">{childPerformance.attendance_rate}%</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pending:</span>
                    <Badge variant="outline" className="text-xs">
                      {pendingHomework} assignments
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Child Details Modal */}
      {selectedChild && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative text-card-foreground">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedChild.full_name}</h3>
                  <p className="text-muted-foreground">Grade {selectedChild.grade} • {selectedChild.status || 'Active'}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Performance Overview */}
                {getChildPerformance(selectedChild.student_id) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Academic Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getGradeColor(getChildPerformance(selectedChild.student_id)?.overall_grade || '')}`}>
                            {getChildPerformance(selectedChild.student_id)?.overall_grade || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Overall Grade</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {getChildPerformance(selectedChild.student_id)?.gpa.toFixed(2) || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">GPA</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {getChildPerformance(selectedChild.student_id)?.attendance_rate || 'N/A'}%
                          </div>
                          <div className="text-sm text-muted-foreground">Attendance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {getChildPerformance(selectedChild.student_id)?.homework_completion_rate || 'N/A'}%
                          </div>
                          <div className="text-sm text-muted-foreground">Homework</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Enrolled Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getChildClasses(selectedChild.student_id).map(cls => (
                        <div key={cls.class_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">{cls.name}</div>
                            <div className="text-sm text-muted-foreground">{cls.schedule}</div>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Homework */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Recent Homework
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getChildHomework(selectedChild.student_id).slice(0, 5).map(hw => (
                        <div key={hw.homework_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{hw.title}</div>
                            <div className="text-sm text-muted-foreground">Due: {hw.due_date}</div>
                          </div>
                          <Badge variant={hw.status === 'pending' ? 'destructive' : 'default'}>
                            {hw.status === 'pending' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </>
                            )}
                          </Badge>
                        </div>
                      ))}
                      {getChildHomework(selectedChild.student_id).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No homework assignments found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ParentChildren; 