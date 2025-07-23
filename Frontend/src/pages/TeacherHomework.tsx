import { useEffect, useState } from 'react';
import { getHomework, addHomework, updateHomework, deleteHomework, ApiResponse } from '../api/edulite';

interface Homework {
  homework_id: string;
  title: string;
  due_date: string;
  created_at: string;
  status: string;
  teacher_id: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: Omit<Homework, 'homework_id' | 'teacher_id'> = {
  title: '',
  due_date: '',
  created_at: today(),
  status: 'pending',
};

const TeacherHomework = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const teacherId = JSON.parse(localStorage.getItem('user') || '{}').teacher_id;

  const fetchHomework = () => {
    setLoading(true);
    getHomework().then((res: ApiResponse<Homework[]>) => {
      if (res.status === 'success' && res.data) {
        setHomework(res.data.filter((hw: Homework) => hw.teacher_id === teacherId));
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchHomework();
  }, [teacherId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateHomework({ ...form, homework_id: editingId, teacher_id: teacherId });
      setEditingId(null);
    } else {
      await addHomework({
        ...form,
        homework_id: Math.random().toString(36).slice(2),
        teacher_id: teacherId,
      });
    }
    setForm({ ...emptyForm, created_at: today() });
    fetchHomework();
  };

  const handleEdit = (hw: Homework) => {
    setForm({ title: hw.title, due_date: hw.due_date, created_at: hw.created_at, status: hw.status });
    setEditingId(hw.homework_id);
  };

  const handleDelete = async (id: string) => {
    await deleteHomework(id);
    fetchHomework();
  };

  const handleReview = async (hw: Homework) => {
    await updateHomework({ ...hw, status: 'graded' });
    fetchHomework();
  };

  if (loading) return <div>Loading...</div>;

  const submittedHomework = homework.filter(hw => hw.status === 'submitted');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Homework</h2>
      {/* Homework Review Section */}
      {submittedHomework.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Homework to Review</h3>
          <ul>
            {submittedHomework.map(hw => (
              <li key={hw.homework_id} className="mb-4 p-4 border rounded-lg shadow-card flex justify-between items-center">
                <div>
                  <div className="font-semibold">{hw.title}</div>
                  <div>Date Given: {hw.created_at}</div>
                  <div>Due: {hw.due_date}</div>
                  <div>Status: {hw.status}</div>
                </div>
                <button onClick={() => handleReview(hw)} className="bg-green-600 text-white px-3 py-1 rounded">Mark as Graded</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-card flex flex-col gap-2 max-w-md">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="p-2 border rounded"
          required
        />
        <input
          name="created_at"
          value={form.created_at}
          onChange={handleChange}
          type="date"
          className="p-2 border rounded"
          required
        />
        <input
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
          type="date"
          className="p-2 border rounded"
          required
        />
        <select name="status" value={form.status} onChange={handleChange} className="p-2 border rounded">
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
        </select>
        <button type="submit" className="bg-primary text-white rounded p-2 mt-2">
          {editingId ? 'Update Homework' : 'Add Homework'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ ...emptyForm, created_at: today() }); }} className="text-sm text-gray-500 mt-1">Cancel Edit</button>
        )}
      </form>
      <ul>
        {homework.map(hw => (
          <li key={hw.homework_id} className="mb-4 p-4 border rounded-lg shadow-card flex justify-between items-center">
            <div>
              <div className="font-semibold">{hw.title}</div>
              <div>Date Given: {hw.created_at}</div>
              <div>Due: {hw.due_date}</div>
              <div>Status: {hw.status}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(hw)} className="text-blue-600">Edit</button>
              <button onClick={() => handleDelete(hw.homework_id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherHomework; 