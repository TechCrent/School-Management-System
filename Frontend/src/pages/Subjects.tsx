import { useState, useEffect, useRef } from 'react';
import { Subject } from '../data/mockData';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../api/edulite';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/layout/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useCustomToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

const Subjects = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const { customToast } = useCustomToast();
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [modalForm, setModalForm] = useState<Partial<Subject>>({});

  useEffect(() => {
    setUserRole(localStorage.getItem('role') || '');
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subjects', debouncedSearch],
    queryFn: () => getSubjects({ search: debouncedSearch }),
    enabled: !!token
  });
  const subjectsData = data?.data || [];

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm]);

  const filteredSubjects = subjectsData.filter((s: Subject) =>
    s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    s.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const canEdit = userRole === 'admin';

  const handleAdd = () => {
    setModalForm({});
    setModalMode('create');
    setModalOpen(true);
  };
  const handleEdit = (subject: Subject) => {
    setModalForm({ ...subject });
    setModalMode('edit');
    setModalOpen(true);
  };
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteSubject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] })
  });
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    customToast({ title: 'Subject deleted', description: 'The subject has been removed.' });
  };
  const addMutation = useMutation({
    mutationFn: async (subject: Partial<Subject>) => addSubject(subject),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] })
  });
  const updateMutation = useMutation({
    mutationFn: async (subject: Partial<Subject>) => updateSubject(subject),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] })
  });
  const handleSave = async (data: Partial<Subject>) => {
    // Inline validation
    const errors: { [key: string]: string } = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Subject name is required (min 2 characters)';
    } else if (subjectsData.some(s => s.name === data.name && s.subject_id !== selectedSubject?.subject_id)) {
      errors.name = 'A subject with this name already exists.';
    }
    if (!data.description || data.description.trim().length < 2) {
      errors.description = 'Description is required (min 2 characters)';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    if (modalMode === 'create') {
      await addMutation.mutateAsync(data);
      customToast({ title: 'Subject added', description: 'A new subject has been added.' });
    } else if (modalMode === 'edit' && modalForm.subject_id) {
      await updateMutation.mutateAsync({ ...modalForm, ...data });
      customToast({ title: 'Subject updated', description: 'Subject details have been updated.' });
    }
    setModalOpen(false);
    setModalForm({});
    setSelectedSubject(null);
  };

  if (isLoading) return <Loading size="lg" text="Loading subjects..." />;
  if (isError) return <div className="text-center text-destructive">Failed to load subjects.</div>;
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Subjects' }]} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Subjects</h1>
          <p className="text-muted-foreground mt-2">Manage subject information and records</p>
        </div>
        {canEdit && (
          <Button onClick={handleAdd} className="shadow-glow hover:shadow-glow/50">
            <Plus className="h-4 w-4 mr-2" />Add Subject
          </Button>
        )}
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Subject Directory</CardTitle>
          <CardDescription>Search and manage subject information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search subjects by name or description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-200 focus:shadow-glow"
                aria-label="Search subjects"
              />
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map(subject => (
                  <TableRow key={subject.subject_id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{subject.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {subject.subject_id.slice(0, 8)}...</div>
                    </TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canEdit && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(subject)} className="h-8 w-8 p-0" title="Edit Subject">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(subject.subject_id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Delete Subject">
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
            {filteredSubjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subjects found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Modal for Add/Edit Subject */}
      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg shadow-lg min-w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative text-card-foreground">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">{modalMode === 'create' ? 'Add Subject' : 'Edit Subject'}</h3>
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
              
              <form onSubmit={e => { e.preventDefault(); handleSave(modalForm); }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Subject Name</label>
                  <Input
                    type="text"
                    placeholder="Enter subject name"
                    value={modalForm.name || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                    className={formErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    required
                  />
                  {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    placeholder="Enter subject description"
                    value={modalForm.description || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      formErrors.description ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                    rows={3}
                    required
                  />
                  {formErrors.description && <p className="text-sm text-destructive mt-1">{formErrors.description}</p>}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    {modalMode === 'create' ? 'Add Subject' : 'Save Changes'}
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
                <h3 className="text-xl font-semibold text-foreground">Delete Subject</h3>
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
                <p className="text-muted-foreground">Are you sure you want to delete this subject? This action cannot be undone.</p>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={confirmDelete} 
                    variant="destructive"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                  >
                    Delete Subject
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

export default Subjects; 