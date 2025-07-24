import { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '../components/layout/AuthContext';
import { useTranslation } from 'react-i18next';
import Papa from 'papaparse';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import parentsData from '../data/parents.json';
import allStudentsData from '../data/students.json';
type Parent = {
  parent_id: string;
  full_name: string;
  email: string;
  phone: string;
  children_ids: string[];
};
const parents: Parent[] = parentsData as Parent[];

export const Students = () => {
  const { t } = useTranslation();
  const { customToast } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState<Student[]>([]);
  const studentsPerPage = 20;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { token } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['students', debouncedSearch, currentPage],
    queryFn: () => getStudents({ search: debouncedSearch, page: String(currentPage), pageSize: String(studentsPerPage) }),
    enabled: !!token
  });
  const students = data?.data || [];
  const totalStudents = data?.total || students.length;

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (student: Partial<Student>) => addStudent(student),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
  const updateMutation = useMutation({
    mutationFn: async (student: Partial<Student>) => updateStudent(student),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteStudent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });

  // Get user role from localStorage
  useEffect(() => {
    setUserRole(localStorage.getItem('role') || '');
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm]);

  // Pagination controls
  const totalPages = Math.ceil(totalStudents / studentsPerPage) || 1;
  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = students.slice(startIndex, startIndex + studentsPerPage);

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

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
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
      customToast({ title: 'Student deleted', description: 'The student has been removed.' });
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
        customToast({ title: 'Student added', description: 'A new student has been added.' });
      } else if (modalMode === 'edit' && selectedStudent) {
        await updateMutation.mutateAsync({ ...selectedStudent, ...studentData });
        customToast({ title: 'Student updated', description: 'Student details have been updated.' });
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

  // Calculate stats using the full dataset in mock mode
  let allStudentsForStats: Student[] = students;
  if (localStorage.getItem('USE_MOCK') === 'true') {
    allStudentsForStats = allStudentsData as unknown as Student[];
  }
  // Average age
  const today = new Date();
  const ages = allStudentsForStats.map(s => {
    const dob = new Date(s.date_of_birth);
    return today.getFullYear() - dob.getFullYear() - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
  });
  const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  // Active classes
  const activeClassIds = new Set(allStudentsForStats.map(s => s.class_id).filter(Boolean));
  const activeClassesCount = activeClassIds.size;

  // Get timezone from settings in localStorage
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
  const timezone = settings?.appearance?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Bulk select logic
  const allSelected = selectedIds.length > 0 && selectedIds.length === currentStudents.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < currentStudents.length;
  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(currentStudents.map(s => s.student_id));
  };
  const handleSelectOne = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  // Bulk delete
  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(false);
    const deleted = students.filter(s => selectedIds.includes(s.student_id));
    // TODO: Implement real API bulk delete
    setSelectedIds([]);
    customToast({ title: t('Selected students deleted') });
    queryClient.invalidateQueries({ queryKey: ['students'] });
  };
  // Bulk export
  const handleBulkExport = () => {
    const selected = students.filter(s => selectedIds.includes(s.student_id));
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-export.json';
    a.click();
    URL.revokeObjectURL(url);
    customToast({ title: t('Selected students exported') });
  };

  // Import logic
  const handleImportClick = () => fileInputRef.current?.click();
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let imported: Partial<Student>[] = [];
        if (ext === 'json') {
          imported = JSON.parse(reader.result as string);
        } else if (ext === 'csv') {
          const parsed = Papa.parse(reader.result as string, { header: true });
          imported = parsed.data;
        } else {
          customToast({ title: t('Only JSON or CSV files are allowed'), variant: 'destructive' });
          return;
        }
        // Validate and add to mockStudents
        let added = 0;
        imported.forEach((s) => {
          if (!s.email) return;
          addMutation.mutateAsync({
            full_name: s.full_name || '',
            date_of_birth: s.date_of_birth || '',
            class_id: s.class_id || 'class_1',
            email: s.email || '',
            parent1_email: s.parent1_email || '',
            parent1_name: s.parent1_name || '',
            parent1_contact: s.parent1_contact || '',
            parent2_email: s.parent2_email || '',
            parent2_name: s.parent2_name || '',
            parent2_contact: s.parent2_contact || '',
            grade: s.grade || '',
            status: s.status || 'active',
          });
          added++;
        });
        customToast({ title: t('Imported students'), description: t('{{count}} students imported', { count: added }) });
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } catch {
        customToast({ title: t('Import failed'), variant: 'destructive' });
      }
    };
    if (ext === 'csv') reader.readAsText(file);
    else reader.readAsText(file);
  };
  // Export as CSV
  const handleExportCSV = (studentsToExport: Student[], filename: string) => {
    const csv = Papa.unparse(studentsToExport);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    customToast({ title: t('Exported as CSV') });
  };

  const handleUndo = (studentsToRestore: Student[]) => {
    // Undo not supported in real API mode
    customToast({ title: t('Undo not supported in live mode') });
  };

  if (isLoading) return <Loading size="lg" text="Loading students..." />;
  if (isError) return <div className="text-center text-destructive">Failed to load students.</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Students' }]} />
      {/* Import/Export Bar */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="sm" onClick={handleImportClick}>
          {t('Import Students')}
        </Button>
        <input
          type="file"
          accept=".json,.csv"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImport}
        />
        <Button variant="outline" size="sm" onClick={() => handleBulkExport()}>
          {t('Export All (JSON)')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExportCSV(students, 'students-export.csv')}>
          {t('Export All (CSV)')}
        </Button>
      </div>
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-2 flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)}>
            {t('Delete Selected')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleUndo(recentlyDeleted)}>
            {t('Undo Delete')}
          </Button>
        </div>
      )}
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
        <Card className="shadow-card bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('Total Students')}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {t('Registered students')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('Average Age')}</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{averageAge}</div>
            <p className="text-xs text-muted-foreground">
              {t('years')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('Active Classes')}</CardTitle>
            <BookOpen className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeClassesCount}</div>
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
                aria-label="Search students"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                      aria-label={t('Select all students')}
                      aria-checked={isIndeterminate ? 'mixed' : allSelected}
                      tabIndex={0}
                      onChange={handleSelectAll}
                      className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </TableHead>
                  <TableHead>{t('Student')}</TableHead>
                  <TableHead>{t('Grade')}</TableHead>
                  <TableHead>{t('Age')}</TableHead>
                  <TableHead>{t('Email')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead className="text-right">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  return (
                    <TableRow key={student.student_id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(student.student_id)}
                          aria-label={t('Select student {{name}}', { name: student.full_name })}
                          tabIndex={0}
                          onChange={() => handleSelectOne(student.student_id)}
                          className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </TableCell>
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
                  );
                })}
              </TableBody>
            </Table>

            {students.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('No students found matching your search.')}</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>&larr; Prev</Button>
            <span>Page {currentPage} of {totalPages} ({totalStudents} students)</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next &rarr;</Button>
          </div>
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete Selected Students')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Are you sure you want to delete the selected students? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('Delete')}
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