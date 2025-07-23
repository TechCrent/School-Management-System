import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Calendar,
  Users,
  Eye,
  BookOpen
} from 'lucide-react';
import { Student } from '../data/mockData';
import { StudentModal } from '../components/students/StudentModal';
import { useCustomToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { formatDateWithTimezone } from '@/lib/utils';
import { notify } from '@/lib/utils';
import { getStudents, addStudent, updateStudent, deleteStudent } from '@/api/edulite';
import { USE_MOCK } from '../config';
import { mockStudents } from '../data/mockData';
import { useTranslation } from 'react-i18next';

export const Students = () => {
  const { t } = useTranslation();
  const { customToast } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const studentsPerPage = 10;
  const queryClient = useQueryClient();

  // Fetch students
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      if (USE_MOCK) return mockStudents;
      return getStudents();
    },
  });
  const students = studentsQuery.data || [];
  const isLoading = studentsQuery.isLoading;
  const isError = studentsQuery.isError;

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (student: Partial<Student>) => {
      if (USE_MOCK) {
        mockStudents.push({
          student_id: crypto.randomUUID(),
          full_name: student.full_name || '',
          date_of_birth: student.date_of_birth || '',
          class_id: student.class_id || 'class_1',
          email: student.email || '',
          parent1_email: student.parent1_email || '',
          parent2_email: student.parent2_email || '',
          grade: student.grade || '',
          status: student.status || 'active',
        });
        return;
      }
      return addStudent(student);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
  const updateMutation = useMutation({
    mutationFn: async (vars: { id: string, student: Partial<Student> }) => {
      if (USE_MOCK) {
        const idx = mockStudents.findIndex(s => s.student_id === vars.id);
        if (idx !== -1) mockStudents[idx] = { ...mockStudents[idx], ...vars.student };
        return;
      }
      return updateStudent(vars.id, vars.student);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) {
        const idx = mockStudents.findIndex(s => s.student_id === id);
        if (idx !== -1) mockStudents.splice(idx, 1);
        return;
      }
      return deleteStudent(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });

  // Get user role from localStorage
  useEffect(() => {
    setUserRole(localStorage.getItem('role') || '');
  }, []);

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  const canEdit = userRole === 'admin';

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleDelete = (studentId: string) => {
    setStudentToDelete(studentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteMutation.mutateAsync(studentToDelete);
      notify('homework', {
        title: 'Student deleted',
        description: 'The student has been successfully removed.',
      });
    } catch (error) {
      notify('homework', {
        title: 'Error',
        description: 'Failed to delete student. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      if (modalMode === 'create') {
        await addMutation.mutateAsync(studentData);
      } else if (modalMode === 'edit' && selectedStudent) {
        await updateMutation.mutateAsync({ id: selectedStudent.student_id, student: studentData });
      }
    } catch (error) {
      notify('homework', {
        title: 'Error',
        description: `Failed to ${modalMode} student. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate average age
  const averageAge = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + calculateAge(s.date_of_birth), 0) / students.length)
    : 0;

  // Calculate unique active classes
  const activeClasses = Array.from(new Set(students.map(s => s.grade))).length;

  // Get timezone from settings in localStorage
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
  const timezone = settings?.appearance?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (isLoading) return <Loading size="lg" text="Loading students..." />;
  if (isError) return <div className="text-center text-destructive">Failed to load students.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('Students')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('Manage student information and records')}
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleAdd} className="shadow-glow hover:shadow-glow/50">
            <Plus className="h-4 w-4 mr-2" />
            {t('Add Student')}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Total Students')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('Registered students')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Average Age')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{averageAge}</div>
            <p className="text-xs text-muted-foreground">
              {t('years')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Active Classes')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{activeClasses}</div>
            <p className="text-xs text-muted-foreground">
              {t('Unique classes with students')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t('Student Directory')}</CardTitle>
          <CardDescription>
            {t('Search and manage student information')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('Search students by name, email, or grade...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-200 focus:shadow-glow"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('Student')}</TableHead>
                  <TableHead>{t('Grade')}</TableHead>
                  <TableHead>{t('Age')}</TableHead>
                  <TableHead>{t('Email')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead className="text-right">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.map((student) => (
                  <TableRow key={student.student_id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {student.student_id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.grade}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateWithTimezone(student.date_of_birth, timezone, 'yyyy-MM-dd')} ({calculateAge(student.date_of_birth)} years)
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(student)}
                          className="h-8 w-8 p-0"
                          title={t('View Details')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(student)}
                              className="h-8 w-8 p-0"
                              title={t('Edit Student')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(student.student_id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title={t('Delete Student')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('No students found matching your search.')}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                {t('Showing')} {startIndex + 1} {t('to')} {Math.min(startIndex + studentsPerPage, filteredStudents.length)} {t('of')} {filteredStudents.length} {t('students')}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  {t('Previous')}
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  {t('Next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Modal */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStudent}
        student={selectedStudent}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete Student')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Are you sure you want to delete this student? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.status === 'pending'}
            >
              {deleteMutation.status === 'pending' ? t('Deleting...') : t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay for mutations */}
      {(addMutation.status === 'pending' || updateMutation.status === 'pending') && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading size="lg" text="Processing..." />
        </div>
      )}
    </div>
  );
};