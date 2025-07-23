import { useState, useEffect, useRef } from 'react';
import { mockSubjects, Subject } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useCustomToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
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

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSubjects([...mockSubjects]);
      setUserRole(localStorage.getItem('role') || '');
      setLoading(false);
    }, 600); // Simulate loading
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

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    s.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const canEdit = userRole === 'admin';

  const handleAdd = () => {
    setSelectedSubject(null);
    setModalMode('create');
    setModalOpen(true);
  };
  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setModalMode('edit');
    setModalOpen(true);
  };
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setSubjects(prev => prev.filter(s => s.subject_id !== deleteId));
    setDeleteId(null);
    customToast({ title: 'Subject deleted', description: 'The subject has been removed.' });
  };
  const handleSave = (data: Partial<Subject>) => {
    // Inline validation
    const errors: { [key: string]: string } = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Subject name is required (min 2 characters)';
    } else if (subjects.some(s => s.name === data.name && s.subject_id !== selectedSubject?.subject_id)) {
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
      setSubjects(prev => [
        { ...data, subject_id: crypto.randomUUID() } as Subject,
        ...prev,
      ]);
      customToast({ title: 'Subject added', description: 'A new subject has been added.' });
    } else if (modalMode === 'edit' && selectedSubject) {
      setSubjects(prev => prev.map(s => s.subject_id === selectedSubject.subject_id ? { ...s, ...data } as Subject : s));
      customToast({ title: 'Subject updated', description: 'Subject details have been updated.' });
    }
    setModalOpen(false);
    setSelectedSubject(null);
  };

  if (loading) return <Loading size="lg" text="Loading subjects..." />;
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black">&times;</button>
            <h3 className="text-xl font-bold mb-2">{modalMode === 'create' ? 'Add Subject' : 'Edit Subject'}</h3>
            <form onSubmit={e => { e.preventDefault(); handleSave(selectedSubject || {}); }} className="flex flex-col gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={selectedSubject?.name || ''}
                  onChange={e => setSelectedSubject(prev => ({ ...prev, name: e.target.value } as Subject))}
                  className={`border rounded p-2 ${formErrors.name ? 'border-destructive' : ''}`}
                  required
                />
                {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <textarea
                  placeholder="Description"
                  value={selectedSubject?.description || ''}
                  onChange={e => setSelectedSubject(prev => ({ ...prev, description: e.target.value } as Subject))}
                  className={`border rounded p-2 ${formErrors.description ? 'border-destructive' : ''}`}
                  rows={3}
                  required
                />
                {formErrors.description && <p className="text-sm text-destructive mt-1">{formErrors.description}</p>}
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="submit" className="bg-primary text-white px-4 py-2 rounded">{modalMode === 'create' ? 'Add' : 'Save'}</Button>
                <Button type="button" onClick={() => setModalOpen(false)} className="bg-muted px-4 py-2 rounded">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative">
            <h3 className="text-xl font-bold mb-2">Delete Subject</h3>
            <p>Are you sure you want to delete this subject? This action cannot be undone.</p>
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

export default Subjects; 