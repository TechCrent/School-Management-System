import { useState, useEffect, useRef } from 'react';
import { mockTeachers, mockSubjects, Class } from '../data/mockData';
import { getClasses, addClass, updateClass, deleteClass } from '../api/edulite';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/layout/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { useCustomToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';

const Classes = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { customToast } = useCustomToast();
  const [loading, setLoading] = useState(true);
  const [modalForm, setModalForm] = useState<Partial<Class>>({});

  useEffect(() => {
    setUserRole(localStorage.getItem('role') || '');
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['classes', debouncedSearch],
    queryFn: () => getClasses({ search: debouncedSearch }),
    enabled: !!token
  });
  const classesData = data?.data || [];

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm]);

  const filteredClasses = classesData.filter((cls: Class) =>
    cls.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const canEdit = userRole === 'admin';

  const handleAdd = () => {
    setModalForm({});
    setModalMode('create');
    setModalOpen(true);
  };
  const handleEdit = (cls: Class) => {
    setModalForm({ ...cls });
    setModalMode('edit');
    setModalOpen(true);
  };
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteClass(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    customToast({ title: 'Class deleted', description: 'The class has been removed.' });
  };
  const addMutation = useMutation({
    mutationFn: async (cls: Partial<Class>) => addClass(cls),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
  const updateMutation = useMutation({
    mutationFn: async (cls: Partial<Class>) => updateClass(cls),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
  const handleSave = async (data: Partial<Class>) => {
    // Inline validation
    const errors: { [key: string]: string } = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Class name is required (min 2 characters)';
    } else if (classesData.some(cls => cls.name === data.name && cls.class_id !== selectedClass?.class_id)) {
      errors.name = 'A class with this name already exists.';
    }
    if (!data.teacher_id) {
      errors.teacher_id = 'Teacher is required';
    }
    if (!data.subject_id) {
      errors.subject_id = 'Subject is required';
    }
    if (!data.schedule) {
      errors.schedule = 'Schedule is required';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    if (modalMode === 'create') {
      await addMutation.mutateAsync(data);
      customToast({ title: 'Class added', description: 'A new class has been added.' });
    } else if (modalMode === 'edit' && modalForm.class_id) {
      await updateMutation.mutateAsync({ ...modalForm, ...data });
      customToast({ title: 'Class updated', description: 'Class details have been updated.' });
    }
    setModalOpen(false);
    setModalForm({});
    setSelectedClass(null);
  };

  if (isLoading) return <Loading size="lg" text="Loading classes..." />;
  if (isError) return <div className="text-center text-destructive">Failed to load classes.</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Classes' }]} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Classes</h1>
          <p className="text-muted-foreground mt-2">Manage class information and records</p>
        </div>
        {canEdit && (
          <Button onClick={handleAdd} className="shadow-glow hover:shadow-glow/50">
            <Plus className="h-4 w-4 mr-2" />Add Class
          </Button>
        )}
      </div>
      <Card className="shadow-card bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Class Directory</CardTitle>
          <CardDescription>Search and manage class information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search classes by name, teacher, or subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-200 focus:shadow-glow"
                aria-label="Search classes"
              />
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map(cls => {
                  const teacher = mockTeachers.find(t => t.teacher_id === cls.teacher_id);
                  const subject = mockSubjects.find(s => s.subject_id === cls.subject_id);
                  return (
                    <TableRow key={cls.class_id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {cls.class_id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell>{teacher ? teacher.full_name : '-'}</TableCell>
                      <TableCell>{subject ? subject.name : '-'}</TableCell>
                      <TableCell>{cls.schedule}</TableCell>
                      <TableCell><Badge variant="outline">{cls.student_count}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canEdit && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(cls)} className="h-8 w-8 p-0" title="Edit Class">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(cls.class_id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Delete Class">
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
            {filteredClasses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No classes found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Modal for Add/Edit Class */}
      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg shadow-lg min-w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative text-card-foreground">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">{modalMode === 'create' ? 'Add Class' : 'Edit Class'}</h3>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="sr-only">Close</span>
                </button>
              </div>
              
              <form onSubmit={e => { e.preventDefault(); handleSave(selectedClass || {}); }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Class Name</label>
                  <Input
                    type="text"
                    placeholder="Enter class name"
                    value={modalForm.name || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                    className={formErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    required
                  />
                  {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Teacher</label>
                  <Select value={modalForm.teacher_id || ''} onValueChange={val => setModalForm(prev => ({ ...prev, teacher_id: val }))}>
                    <SelectTrigger className={formErrors.teacher_id ? 'border-destructive focus-visible:ring-destructive' : ''}>
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeachers.map(t => (
                        <SelectItem key={t.teacher_id} value={t.teacher_id}>{t.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.teacher_id && <p className="text-sm text-destructive mt-1">{formErrors.teacher_id}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Select value={modalForm.subject_id || ''} onValueChange={val => setModalForm(prev => ({ ...prev, subject_id: val }))}>
                    <SelectTrigger className={formErrors.subject_id ? 'border-destructive focus-visible:ring-destructive' : ''}>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSubjects.map(s => (
                        <SelectItem key={s.subject_id} value={s.subject_id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.subject_id && <p className="text-sm text-destructive mt-1">{formErrors.subject_id}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Schedule</label>
                  <Input
                    type="text"
                    placeholder="Enter schedule (e.g., Monday 10:00 AM - 11:00 AM)"
                    value={modalForm.schedule || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, schedule: e.target.value }))}
                    className={formErrors.schedule ? 'border-destructive focus-visible:ring-destructive' : ''}
                    required
                  />
                  {formErrors.schedule && <p className="text-sm text-destructive mt-1">{formErrors.schedule}</p>}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    {modalMode === 'create' ? 'Add Class' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => { setModalOpen(false); setModalForm({}); }} 
                    variant="outline"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg shadow-lg min-w-[400px] max-w-[90vw] relative text-card-foreground">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Delete Class</h3>
                <button 
                  onClick={() => setDeleteId(null)} 
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="sr-only">Close</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">Are you sure you want to delete this class? This action cannot be undone.</p>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={confirmDelete} 
                    variant="destructive"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                  >
                    Delete Class
                  </Button>
                  <Button 
                    onClick={() => setDeleteId(null)} 
                    variant="outline"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Cancel
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

export default Classes; 