import { useEffect, useState } from 'react';
import { getClasses, getStudents, ApiResponse } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, BookOpen } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

interface Class {
  class_id: string;
  name: string;
  schedule: string;
  student_count: number;
  teacher_id: string;
  subject_id: string;
  zoom_link?: string;
}

interface Student {
  student_id: string;
  full_name: string;
  class_id: string;
  email: string;
}

const TeacherClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const teacherId = JSON.parse(localStorage.getItem('user') || '{}').teacher_id;

  useEffect(() => {
    loadClasses();
  }, [teacherId]);

  const loadClasses = async () => {
    try {
      const res: ApiResponse<Class[]> = await getClasses();
      if (res.status === 'success' && res.data) {
        const teacherClasses = res.data.filter((cls: Class) => cls.teacher_id === teacherId);
        setClasses(teacherClasses);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading classes:', error);
      setLoading(false);
    }
  };

  const openClassDetails = async (cls: Class) => {
    setSelectedClass(cls);
    
    try {
      const studentsRes: ApiResponse<Student[]> = await getStudents();
      if (studentsRes.status === 'success' && studentsRes.data) {
        const classStudents = studentsRes.data.filter((stu: Student) => stu.class_id === cls.class_id);
        setStudents(classStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const closeModal = () => {
    setSelectedClass(null);
    setStudents([]);
  };

  if (loading) return <Loading size="lg" text="Loading classes..." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'My Classes' }]} />
      
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Classes</h2>
        <p className="text-muted-foreground">Manage your classes, track attendance, and share materials</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Active classes this semester</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {classes.reduce((total, cls) => total + cls.student_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Students across all classes</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {classes.filter(cls => cls.schedule.toLowerCase().includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())).length}
            </div>
            <p className="text-xs text-muted-foreground">Classes scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Class Directory</CardTitle>
          <CardDescription>Click on a class to view details and manage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {classes.map(cls => (
              <div key={cls.class_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => openClassDetails(cls)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">{cls.schedule}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {cls.student_count} students
                      </Badge>
                      {cls.zoom_link && (
                        <Badge variant="secondary">
                          <Calendar className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedClass.name}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-black">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Class Information</h4>
                <p><strong>Schedule:</strong> {selectedClass.schedule}</p>
                <p><strong>Students:</strong> {students.length}</p>
                {selectedClass.zoom_link && (
                  <p>
                    <strong>Zoom Link:</strong>
                    <a href={selectedClass.zoom_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      Join Meeting
                    </a>
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Student Roster</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {students.map(student => (
                    <div key={student.student_id} className="flex items-center space-x-2 p-2 border rounded">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{student.full_name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{student.full_name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
                <Button variant="outline" className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
                <Button variant="outline" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Post Announcement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses; 