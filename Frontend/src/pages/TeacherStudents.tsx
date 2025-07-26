import { useEffect, useState } from 'react';
import { 
  getClasses, 
  getStudents, 
  getHomework,
  getStudentPerformance,
  getStudentNotes,
  addStudentNote,
  getStudentAnalytics,
  ApiResponse 
} from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  User,
  Target
} from 'lucide-react';
import { useCustomToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

interface Student {
  student_id: string;
  full_name: string;
  class_id: string;
  email: string;
}

interface Class {
  class_id: string;
  name: string;
  teacher_id: string;
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

interface StudentNote {
  note_id: string;
  student_id: string;
  teacher_id: string;
  note_type: 'observation' | 'concern' | 'improvement' | 'achievement' | 'behavior';
  title: string;
  content: string;
  created_at: string;
  is_private: boolean;
  tags: string[];
}

const TeacherStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance | null>(null);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  
  const teacherId = JSON.parse(localStorage.getItem('user') || '{}').teacher_id;
  const { customToast } = useCustomToast();

  // Form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    note_type: 'observation' as const,
    is_private: false,
    tags: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        getClasses(),
        getStudents()
      ]);

      if (classesRes.status === 'success' && classesRes.data) {
        const teacherClasses = classesRes.data.filter((cls: Class) => cls.teacher_id === teacherId);
        setClasses(teacherClasses);
      }

      if (studentsRes.status === 'success' && studentsRes.data) {
        const teacherClasses = classesRes.data?.filter((cls: Class) => cls.teacher_id === teacherId).map((cls: Class) => cls.class_id) || [];
        const myStudents = studentsRes.data.filter((stu: Student) => teacherClasses.includes(stu.class_id));
        setStudents(myStudents);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const openStudentDetails = async (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('overview');
    
    try {
      const [performanceRes, notesRes, analyticsRes] = await Promise.all([
        getStudentPerformance(student.student_id, student.class_id),
        getStudentNotes(student.student_id),
        getStudentAnalytics(student.student_id)
      ]);

      if (performanceRes.status === 'success' && performanceRes.data) {
        setStudentPerformance(performanceRes.data[0] || null);
      }

      if (notesRes.status === 'success' && notesRes.data) {
        setStudentNotes(notesRes.data);
      }

      if (analyticsRes.status === 'success' && analyticsRes.data) {
        setStudentAnalytics(analyticsRes.data);
      }
    } catch (error) {
      console.error('Error loading student details:', error);
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setStudentPerformance(null);
    setStudentNotes([]);
    setStudentAnalytics(null);
  };

  const handleCreateNote = async () => {
    if (!selectedStudent) return;

    try {
      await addStudentNote({
        ...noteForm,
        student_id: selectedStudent.student_id,
        teacher_id: teacherId
      });

      setShowNoteModal(false);
      setNoteForm({ title: '', content: '', note_type: 'observation', is_private: false, tags: [] });
      
      // Reload notes
      const notesRes = await getStudentNotes(selectedStudent.student_id);
      if (notesRes.status === 'success' && notesRes.data) {
        setStudentNotes(notesRes.data);
      }

      customToast({ title: 'Note added', description: 'Student note has been added successfully.' });
    } catch (error) {
      console.error('Error creating note:', error);
      customToast({ title: 'Error', description: 'Failed to add note.', variant: 'destructive' });
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-4 w-4 text-green-600" />;
      case 'improvement': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'concern': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'behavior': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-green-100 text-green-800';
      case 'improvement': return 'bg-blue-100 text-blue-800';
      case 'concern': return 'bg-yellow-100 text-yellow-800';
      case 'behavior': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith('A')) return 'text-green-600';
    if (grade?.startsWith('B')) return 'text-blue-600';
    if (grade?.startsWith('C')) return 'text-yellow-600';
    if (grade?.startsWith('D')) return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-gray-600';
  };

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.class_id === classId);
    return cls ? cls.name : 'Unknown Class';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (loading) return <Loading size="lg" text="Loading students..." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'My Students' }]} />
      
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Students</h2>
        <p className="text-muted-foreground">Track student progress, manage performance, and maintain communication</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{students.length}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Classes this semester</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average GPA</CardTitle>
            <Star className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3.4</div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">92.5%</div>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4 flex-1">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.class_id} value={cls.class_id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>Click on a student to view detailed information and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredStudents.map(student => (
              <div key={student.student_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => openStudentDetails(student)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium">{student.full_name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{student.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{getClassName(student.class_id)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => closeModal()}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedStudent.full_name}</DialogTitle>
              <DialogDescription>
                {selectedStudent.email} • {getClassName(selectedStudent.class_id)}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {selectedStudent.full_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedStudent.email}
                      </div>
                      <div>
                        <span className="font-medium">Class:</span> {getClassName(selectedStudent.class_id)}
                      </div>
                      <div>
                        <span className="font-medium">Student ID:</span> {selectedStudent.student_id}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {studentPerformance ? (
                        <>
                          <div>
                            <span className="font-medium">Overall Grade:</span>
                            <span className={`ml-2 font-semibold ${getGradeColor(studentPerformance.overall_grade)}`}>
                              {studentPerformance.overall_grade}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">GPA:</span> {studentPerformance.gpa}
                          </div>
                          <div>
                            <span className="font-medium">Attendance:</span> {studentPerformance.attendance_rate}%
                          </div>
                          <div>
                            <span className="font-medium">Homework Completion:</span> {studentPerformance.homework_completion_rate}%
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No performance data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {studentAnalytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span>Grade Trend: {studentAnalytics.gradeTrend}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-gray-600" />
                          <span>Attendance: {studentAnalytics.attendanceTrend}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span>Participation: {studentAnalytics.participationTrend}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                {studentPerformance ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Academic Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${getGradeColor(studentPerformance.overall_grade)}`}>
                              {studentPerformance.overall_grade}
                            </div>
                            <div className="text-sm text-muted-foreground">Overall Grade</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                              {studentPerformance.gpa}
                            </div>
                            <div className="text-sm text-muted-foreground">GPA</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Attendance Rate</span>
                              <span>{studentPerformance.attendance_rate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${studentPerformance.attendance_rate}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Homework Completion</span>
                              <span>{studentPerformance.homework_completion_rate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${studentPerformance.homework_completion_rate}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Participation Score</span>
                              <span>{studentPerformance.participation_score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${studentPerformance.participation_score}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Semester:</span>
                            <span className="font-medium">{studentPerformance.semester}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated:</span>
                            <span className="font-medium">
                              {new Date(studentPerformance.last_updated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {studentAnalytics && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Recent Achievements</h4>
                            {studentAnalytics.recentAchievements.length > 0 ? (
                              <div className="space-y-2">
                                {studentAnalytics.recentAchievements.map((note: StudentNote) => (
                                  <div key={note.note_id} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                                    <Award className="h-4 w-4 text-green-600 mt-0.5" />
                                    <div>
                                      <div className="font-medium text-sm">{note.title}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(note.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No recent achievements</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No performance data available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Student Notes</h3>
                  <Button onClick={() => setShowNoteModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                <div className="grid gap-4">
                  {studentNotes.map(note => (
                    <Card key={note.note_id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getNoteTypeIcon(note.note_type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{note.title}</h4>
                              <Badge className={getNoteTypeColor(note.note_type)}>
                                {note.note_type}
                              </Badge>
                              {note.is_private && (
                                <Badge variant="outline">Private</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(note.created_at).toLocaleDateString()}</span>
                              {note.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Tags: {note.tags.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student Note</DialogTitle>
            <DialogDescription>
              Add a new note about this student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Note Title"
              value={noteForm.title}
              onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Select 
              value={noteForm.note_type} 
              onValueChange={(value: any) => setNoteForm(prev => ({ ...prev, note_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Note Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="observation">Observation</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="concern">Concern</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Note content..."
              value={noteForm.content}
              onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={noteForm.is_private}
                onChange={(e) => setNoteForm(prev => ({ ...prev, is_private: e.target.checked }))}
              />
              <label htmlFor="private" className="text-sm">Private note (not visible to parents)</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherStudents; 