import { useState, useEffect, useRef } from 'react';
import { mockClasses, mockTeachers, mockSubjects, Class } from '../data/mockData';
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
    setLoading(true);
    setTimeout(() => {
      setClasses([...mockClasses]);
      setUserRole(localStorage.getItem('role') || '');
      setLoading(false);
    }, 600);
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

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    mockTeachers.find(t => t.teacher_id === cls.teacher_id)?.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    mockSubjects.find(s => s.subject_id === cls.subject_id)?.name.toLowerCase().includes(debouncedSearch.toLowerCase())
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
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setClasses(prev => prev.filter(cls => cls.class_id !== deleteId));
    setDeleteId(null);
    customToast({ title: 'Class deleted', description: 'The class has been removed.' });
  };
  const handleSave = (data: Partial<Class>) => {
    // Inline validation
    const errors: { [key: string]: string } = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Class name is required (min 2 characters)';
    } else if (classes.some(cls => cls.name === data.name && cls.class_id !== selectedClass?.class_id)) {
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
      setClasses(prev => [
        { ...modalForm, class_id: crypto.randomUUID(), student_count: 0 } as Class,
        ...prev,
      ]);
      customToast({ title: 'Class added', description: 'A new class has been added.' });
    } else if (modalMode === 'edit' && modalForm.class_id) {
      setClasses(prev => prev.map(cls => cls.class_id === modalForm.class_id ? { ...cls, ...modalForm } as Class : cls));
      customToast({ title: 'Class updated', description: 'Class details have been updated.' });
    }
    setModalOpen(false);
    setModalForm({});
    setSelectedClass(null);
  };

  if (loading) return <Loading size="lg" text="Loading classes..." />;

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
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Class Directory</CardTitle>
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black">&times;</button>
            <h3 className="text-xl font-bold mb-2">{modalMode === 'create' ? 'Add Class' : 'Edit Class'}</h3>
            <form onSubmit={e => { e.preventDefault(); handleSave(selectedClass || {}); }} className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="Class Name"
                value={modalForm.name || ''}
                onChange={e => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                className={`mb-2 ${formErrors.name ? 'border-destructive' : ''}`}
                required
              />
              {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
              <Select value={modalForm.teacher_id || ''} onValueChange={val => setModalForm(prev => ({ ...prev, teacher_id: val }))}>
                <SelectTrigger className={`mb-2 ${formErrors.teacher_id ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeachers.map(t => (
                    <SelectItem key={t.teacher_id} value={t.teacher_id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.teacher_id && <p className="text-sm text-destructive mt-1">{formErrors.teacher_id}</p>}
              <Select value={modalForm.subject_id || ''} onValueChange={val => setModalForm(prev => ({ ...prev, subject_id: val }))}>
                <SelectTrigger className={`mb-2 ${formErrors.subject_id ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map(s => (
                    <SelectItem key={s.subject_id} value={s.subject_id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.subject_id && <p className="text-sm text-destructive mt-1">{formErrors.subject_id}</p>}
              <Input
                type="text"
                placeholder="Schedule"
                value={modalForm.schedule || ''}
                onChange={e => setModalForm(prev => ({ ...prev, schedule: e.target.value }))}
                className={`mb-2 ${formErrors.schedule ? 'border-destructive' : ''}`}
                required
              />
              {formErrors.schedule && <p className="text-sm text-destructive mt-1">{formErrors.schedule}</p>}
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
            <h3 className="text-xl font-bold mb-2">Delete Class</h3>
            <p>Are you sure you want to delete this class? This action cannot be undone.</p>
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

export default Classes; 