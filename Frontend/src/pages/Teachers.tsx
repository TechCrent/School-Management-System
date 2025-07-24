import { useState, useEffect, useRef } from 'react';
import { Teacher } from '../data/mockData';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from '../api/edulite';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/layout/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Mail, BookOpen } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useCustomToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

const Teachers = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('');
  const { customToast } = useCustomToast();
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [modalForm, setModalForm] = useState<Partial<Teacher>>({});

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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['teachers', debouncedSearch],
    queryFn: () => getTeachers({ search: debouncedSearch }),
    enabled: !!token
  });
  const teachers = data?.data || [];

  const filteredTeachers = teachers.filter(t =>
    t.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    t.subject_name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const canEdit = userRole === 'admin';

  const handleAdd = () => {
    setModalForm({});
    setModalMode('create');
    setModalOpen(true);
  };
  const handleEdit = (teacher: Teacher) => {
    setModalForm({ ...teacher });
    setModalMode('edit');
    setModalOpen(true);
  };
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteTeacher(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    customToast({ title: 'Teacher deleted', description: 'The teacher has been removed.' });
  };
  const addMutation = useMutation({
    mutationFn: async (teacher: Partial<Teacher>) => addTeacher(teacher),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });
  const updateMutation = useMutation({
    mutationFn: async (teacher: Partial<Teacher>) => updateTeacher(teacher),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });
  const handleSave = async (data: Partial<Teacher>) => {
    // Inline validation
    const errors: { [key: string]: string } = {};
    if (!data.full_name || data.full_name.trim().length < 2) {
      errors.full_name = 'Full name is required (min 2 characters)';
    }
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = 'Invalid email address';
    } else if (teachers.some((t: Teacher) => t.email === data.email && t.teacher_id !== selectedTeacher?.teacher_id)) {
      errors.email = 'A teacher with this email already exists.';
    }
    if (!data.subject_name) {
      errors.subject_name = 'Subject is required';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    if (modalMode === 'create') {
      await addMutation.mutateAsync(data);
      customToast({ title: 'Teacher added', description: 'A new teacher has been added.' });
    } else if (modalMode === 'edit' && modalForm.teacher_id) {
      await updateMutation.mutateAsync({ ...modalForm, ...data });
      customToast({ title: 'Teacher updated', description: 'Teacher details have been updated.' });
    }
    setModalOpen(false);
    setModalForm({});
    setSelectedTeacher(null);
  };

  if (isLoading) return <Loading size="lg" text="Loading teachers..." />;
  if (isError) return <div className="text-center text-destructive">Failed to load teachers.</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Teachers' }]} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Teachers</h1>
          <p className="text-muted-foreground mt-2">Manage teacher information and records</p>
        </div>
        {canEdit && (
          <Button onClick={handleAdd} className="shadow-glow hover:shadow-glow/50">
            <Plus className="h-4 w-4 mr-2" />Add Teacher
          </Button>
        )}
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Teacher Directory</CardTitle>
          <CardDescription>Search and manage teacher information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search teachers by name, email, or subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-200 focus:shadow-glow"
                aria-label="Search teachers"
              />
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map(teacher => (
                  <TableRow key={teacher.teacher_id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{teacher.full_name}</div>
                      <div className="text-sm text-muted-foreground">ID: {teacher.teacher_id.slice(0, 8)}...</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{teacher.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.subject_name}</Badge>
                    </TableCell>
                    <TableCell>{teacher.phone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canEdit && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(teacher)} className="h-8 w-8 p-0" title="Edit Teacher">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(teacher.teacher_id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Delete Teacher">
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
            {filteredTeachers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teachers found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Modal for Add/Edit Teacher */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black">&times;</button>
            <h3 className="text-xl font-bold mb-2">{modalMode === 'create' ? 'Add Teacher' : 'Edit Teacher'}</h3>
            <form onSubmit={e => { e.preventDefault(); handleSave(selectedTeacher || {}); }} className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="Full Name"
                value={modalForm.full_name || ''}
                onChange={e => setModalForm(prev => ({ ...prev, full_name: e.target.value }))}
                className={`mb-2 ${formErrors.full_name ? 'border-destructive' : ''}`}
                required
              />
              {formErrors.full_name && <p className="text-sm text-destructive mt-1">{formErrors.full_name}</p>}
              <Input
                type="email"
                placeholder="Email"
                value={modalForm.email || ''}
                onChange={e => setModalForm(prev => ({ ...prev, email: e.target.value }))}
                className={`mb-2 ${formErrors.email ? 'border-destructive' : ''}`}
                required
              />
              {formErrors.email && <p className="text-sm text-destructive mt-1">{formErrors.email}</p>}
              <Input
                type="text"
                placeholder="Subject Name"
                value={modalForm.subject_name || ''}
                onChange={e => setModalForm(prev => ({ ...prev, subject_name: e.target.value }))}
                className={`mb-2 ${formErrors.subject_name ? 'border-destructive' : ''}`}
                required
              />
              {formErrors.subject_name && <p className="text-sm text-destructive mt-1">{formErrors.subject_name}</p>}
              <Input
                type="tel"
                placeholder="Phone"
                value={modalForm.phone || ''}
                onChange={e => setModalForm(prev => ({ ...prev, phone: e.target.value }))}
                className="mb-2"
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit" className="bg-primary text-white px-4 py-2 rounded">{modalMode === 'create' ? 'Add' : 'Save'}</Button>
                <Button type="button" onClick={() => { setModalOpen(false); setModalForm({}); }} className="bg-muted px-4 py-2 rounded">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative">
            <h3 className="text-xl font-bold mb-2">Delete Teacher</h3>
            <p>Are you sure you want to delete this teacher? This action cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={confirmDelete} className="bg-destructive text-white px-4 py-2 rounded">Delete</Button>
              <Button onClick={() => setDeleteId(null)} className="bg-muted px-4 py-2 rounded">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers; 