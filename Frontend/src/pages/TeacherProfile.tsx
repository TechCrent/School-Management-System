import { useState, useEffect } from 'react';

// Mock teacher profile data
const mockTeacherProfile = {
  full_name: 'Jane Smith',
  email: 'jane.smith@schoolapp.com',
  subject: 'Mathematics',
  phone: '+1-555-0101',
};

const TeacherProfile = () => {
  const [profile, setProfile] = useState({ ...mockTeacherProfile });
  const [editing, setEditing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(() => {
    const stored = localStorage.getItem('showNotifications');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('showNotifications', String(showNotifications));
  }, [showNotifications]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    // In a real app, save profile changes to backend
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <form onSubmit={handleSave} className="max-w-md p-4 border rounded-lg shadow-card bg-white">
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
            name="subject"
            value={profile.subject}
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
            value={profile.phone}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={!editing}
          />
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
              <button type="button" onClick={() => { setProfile({ ...mockTeacherProfile }); setEditing(false); }} className="bg-muted px-4 py-2 rounded">Cancel</button>
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