import { useEffect, useState } from 'react';
import { getClasses } from '../api/edulite';

const TeacherProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(() => {
    const stored = localStorage.getItem('showNotifications');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    // Get teacher from localStorage
    const userData = localStorage.getItem('user');
    const teacher = userData ? JSON.parse(userData) : null;
    setProfile(teacher);
    // Fetch classes taught by this teacher
    if (teacher && teacher.teacher_id) {
      getClasses({ noPaginate: 'true' }).then(res => {
        const allClasses = res.data || [];
        const myClasses = allClasses.filter((c: any) => c.teacher_id === teacher.teacher_id);
        setClasses(myClasses);
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    // In a real app, save profile changes to backend
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <form onSubmit={handleSave} className="max-w-md p-4 border rounded-lg shadow-card bg-white">
        <div className="mb-4">
          <label className="block font-medium mb-1">Teacher ID</label>
          <div className="font-mono">{profile.teacher_id}</div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={!editing}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={!editing}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Subject</label>
          <input
            type="text"
            name="subject_name"
            value={profile.subject_name || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={!editing}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={!editing}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Classes Taught</label>
          <ul className="ml-2">
            {classes.length === 0 && <li>No classes found.</li>}
            {classes.map(cls => (
              <li key={cls.class_id}>{cls.name} ({cls.class_id})</li>
            ))}
          </ul>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="showNotifications"
            checked={showNotifications}
            onChange={e => setShowNotifications(e.target.checked)}
            disabled={!editing}
          />
          <label htmlFor="showNotifications" className="font-medium select-none cursor-pointer">Show notifications</label>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => { setEditing(false); }} className="bg-muted px-4 py-2 rounded">Cancel</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="bg-primary text-white px-4 py-2 rounded">Edit</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TeacherProfile; 