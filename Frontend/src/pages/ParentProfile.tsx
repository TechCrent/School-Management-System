import { useState } from 'react';

// Mock parent profile data
const mockParentProfile = {
  full_name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  phone: '+1-555-1234',
};

const ParentProfile = () => {
  const [profile, setProfile] = useState({ ...mockParentProfile });
  const [editing, setEditing] = useState(false);

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
        <div className="flex gap-2">
          {editing ? (
            <>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => { setProfile({ ...mockParentProfile }); setEditing(false); }} className="bg-muted px-4 py-2 rounded">Cancel</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="bg-primary text-white px-4 py-2 rounded">Edit</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ParentProfile; 