import { useEffect, useState } from 'react';
import { 
  getHomework, 
  addHomework, 
  updateHomework, 
  deleteHomework,
  getHomeworkSubmissions,
  getClasses,
  getStudents,
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
  BookOpen, 
  FileText, 
  Upload, 
  Trash2, 
  Edit, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  Calendar,
  Star,
  Eye
} from 'lucide-react';
import { useCustomToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

interface Homework {
  homework_id: string;
  title: string;
  due_date: string;
  created_at: string;
  status: string;
  teacher_id: string;
  subject_id?: string;
  description?: string;
  class_id?: string;
}

interface HomeworkSubmission {
  submission_id: string;
  homework_id: string;
  student_id: string;
  submitted_at: string;
  content: string;
  attachments: Array<{
    name: string;
    url: string;
    size: string;
  }>;
  status: 'submitted' | 'graded' | 'late';
  grade: string | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
}

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

const TeacherHomework = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  
  const teacherId = JSON.parse(localStorage.getItem('user') || '{}').teacher_id;
  const { customToast } = useCustomToast();

  // Form states
  const [homeworkForm, setHomeworkForm] = useState({
    title: '',
    description: '',
    due_date: '',
    class_id: '',
    subject_id: '',
    status: 'pending'
  });

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    try {
      const [homeworkRes, classesRes, studentsRes] = await Promise.all([
        getHomework(),
        getClasses(),
        getStudents()
      ]);

      if (homeworkRes.status === 'success' && homeworkRes.data) {
        const teacherHomework = homeworkRes.data.filter((hw: Homework) => hw.teacher_id === teacherId);
        setHomework(teacherHomework);
      }

      if (classesRes.status === 'success' && classesRes.data) {
        const teacherClasses = classesRes.data.filter((cls: Class) => cls.teacher_id === teacherId);
        setClasses(teacherClasses);
      }

      if (studentsRes.status === 'success' && studentsRes.data) {
        setStudents(studentsRes.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const openHomeworkDetails = async (hw: Homework) => {
    setSelectedHomework(hw);
    setActiveTab('overview');
    
    try {
      const submissionsRes = await getHomeworkSubmissions(hw.homework_id);
      if (submissionsRes.status === 'success' && submissionsRes.data) {
        setSubmissions(submissionsRes.data);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const closeModal = () => {
    setSelectedHomework(null);
    setSubmissions([]);
  };

  const handleCreateHomework = async () => {
    try {
      await addHomework({
        ...homeworkForm,
        homework_id: Math.random().toString(36).slice(2),
        teacher_id: teacherId,
        created_at: new Date().toISOString().split('T')[0]
      });

      setShowCreateModal(false);
      setHomeworkForm({ title: '', description: '', due_date: '', class_id: '', subject_id: '', status: 'pending' });
      loadData();
      customToast({ title: 'Homework created', description: 'New homework assignment has been created.' });
    } catch (error) {
      console.error('Error creating homework:', error);
      customToast({ title: 'Error', description: 'Failed to create homework.', variant: 'destructive' });
    }
  };

  const handleEditHomework = async () => {
    if (!editingHomework) return;

    try {
      await updateHomework({
        ...editingHomework,
        ...homeworkForm
      });

      setShowCreateModal(false);
      setEditingHomework(null);
      setHomeworkForm({ title: '', description: '', due_date: '', class_id: '', subject_id: '', status: 'pending' });
      loadData();
      customToast({ title: 'Homework updated', description: 'Homework assignment has been updated.' });
    } catch (error) {
      console.error('Error updating homework:', error);
      customToast({ title: 'Error', description: 'Failed to update homework.', variant: 'destructive' });
    }
  };

  const handleDeleteHomework = async (homeworkId: string) => {
    try {
      await deleteHomework(homeworkId);
      loadData();
      customToast({ title: 'Homework deleted', description: 'Homework assignment has been removed.' });
    } catch (error) {
      console.error('Error deleting homework:', error);
      customToast({ title: 'Error', description: 'Failed to delete homework.', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.student_id === studentId);
    return student ? student.full_name : 'Unknown Student';
  };

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.class_id === classId);
    return cls ? cls.name : 'Unknown Class';
  };

  if (loading) return <Loading size="lg" text="Loading homework..." />;

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'My Homework' }]} />
      
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Homework</h2>
        <p className="text-muted-foreground">Create assignments, track submissions, and grade student work</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{homework.length}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {homework.reduce((total, hw) => {
                const hwSubmissions = submissions.filter(s => s.homework_id === hw.homework_id && s.status === 'submitted');
                return total + hwSubmissions.length;
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Submissions to grade</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {homework.reduce((total, hw) => {
                const hwSubmissions = submissions.filter(s => s.homework_id === hw.homework_id && s.status === 'graded');
                return total + hwSubmissions.length;
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Completed reviews</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Active classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Homework Assignments</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Homework List */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid gap-4">
            {homework.map(hw => (
              <div key={hw.homework_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => openHomeworkDetails(hw)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{hw.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{hw.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Class: {getClassName(hw.class_id || '')}</span>
                      </div>
                      <Badge className={getStatusColor(hw.status)}>
                        {hw.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingHomework(hw);
                        setHomeworkForm({
                          title: hw.title,
                          description: hw.description || '',
                          due_date: hw.due_date,
                          class_id: hw.class_id || '',
                          subject_id: hw.subject_id || '',
                          status: hw.status
                        });
                        setShowCreateModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHomework(hw.homework_id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Homework Details Modal */}
      {selectedHomework && (
        <Dialog open={!!selectedHomework} onOpenChange={() => closeModal()}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedHomework.title}</DialogTitle>
              <DialogDescription>
                {selectedHomework.description} • Due: {new Date(selectedHomework.due_date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="grading">Grading</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Assignment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Title:</span> {selectedHomework.title}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span> {selectedHomework.description || 'No description'}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {new Date(selectedHomework.due_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Class:</span> {getClassName(selectedHomework.class_id || '')}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> 
                        <Badge className={`ml-2 ${getStatusColor(selectedHomework.status)}`}>
                          {selectedHomework.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Total Submissions:</span> {submissions.length}
                      </div>
                      <div>
                        <span className="font-medium">Pending Review:</span> {pendingSubmissions.length}
                      </div>
                      <div>
                        <span className="font-medium">Graded:</span> {gradedSubmissions.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Student Submissions</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">{submissions.length} total</Badge>
                    <Badge variant="secondary">{pendingSubmissions.length} pending</Badge>
                    <Badge variant="default">{gradedSubmissions.length} graded</Badge>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map(submission => (
                          <TableRow key={submission.submission_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{getStudentName(submission.student_id)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {submission.attachments.length} attachment(s)
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(submission.status)}>
                                {submission.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {submission.grade ? (
                                <span className="font-medium">{submission.grade}</span>
                              ) : (
                                <span className="text-muted-foreground">Not graded</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {submission.status === 'submitted' && (
                                  <Button variant="ghost" size="sm">
                                    <Star className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grading" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Grading Queue</h3>
                  <Badge variant="outline">{pendingSubmissions.length} submissions to grade</Badge>
                </div>

                <div className="grid gap-4">
                  {pendingSubmissions.map(submission => (
                    <Card key={submission.submission_id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{getStudentName(submission.student_id)}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                            </p>
                            <div className="text-sm mb-2">
                              <strong>Content:</strong> {submission.content.substring(0, 100)}...
                            </div>
                            {submission.attachments.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                <span>{submission.attachments.length} attachment(s)</span>
                              </div>
                            )}
                          </div>
                          <Button>
                            <Star className="h-4 w-4 mr-2" />
                            Grade
                          </Button>
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

      {/* Create/Edit Homework Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHomework ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
            <DialogDescription>
              {editingHomework ? 'Update the homework assignment details.' : 'Create a new homework assignment for your students.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Assignment Title"
              value={homeworkForm.title}
              onChange={(e) => setHomeworkForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Assignment Description"
              value={homeworkForm.description}
              onChange={(e) => setHomeworkForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Input
              type="date"
              value={homeworkForm.due_date}
              onChange={(e) => setHomeworkForm(prev => ({ ...prev, due_date: e.target.value }))}
            />
            <Select 
              value={homeworkForm.class_id} 
              onValueChange={(value) => setHomeworkForm(prev => ({ ...prev, class_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.class_id} value={cls.class_id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={homeworkForm.status} 
              onValueChange={(value) => setHomeworkForm(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={editingHomework ? handleEditHomework : handleCreateHomework}>
              {editingHomework ? 'Update' : 'Create'} Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherHomework; 