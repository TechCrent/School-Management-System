import { useEffect, useState } from 'react';
import { getClasses, getStudents } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  ExternalLink,
  Clock,
  MapPin
} from 'lucide-react';

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
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await getClasses();
      const allClasses = response.data || [];
      
      // Get current teacher from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const teacherClasses = allClasses.filter((cls: Class) => cls.teacher_id === user.teacher_id);
      
      setClasses(teacherClasses);
      setLoading(false);
    } catch (error) {
      console.error('Error loading classes:', error);
      setLoading(false);
    }
  };

  const openClassDetails = async (cls: Class) => {
    setSelectedClass(cls);
    try {
      const response = await getStudents();
      const allStudents = response.data || [];
      const classStudents = allStudents.filter((student: Student) => student.class_id === cls.class_id);
      setStudents(classStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const closeModal = () => {
    setSelectedClass(null);
    setStudents([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Classes</h2>
        <p className="text-muted-foreground">Manage and view your assigned classes and student rosters</p>
      </div>

      {/* Classes Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Classes ({classes.length})
          </CardTitle>
          <CardDescription>
            Click on a class to view details and student roster
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Classes Assigned</h3>
              <p className="text-muted-foreground">
                You haven't been assigned to any classes yet. Contact your administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.class_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openClassDetails(cls)}
                >
                  <div className="flex items-start justify-between">
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
          )}
        </CardContent>
      </Card>

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg shadow-lg min-w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative text-card-foreground">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">{selectedClass.name}</h3>
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
        </div>
      )}
    </div>
  );
};

export default TeacherClasses; 