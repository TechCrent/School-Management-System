import { useEffect, useState } from 'react';
import { getParentById, getStudents } from '../api/edulite';

const ParentProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Get parent from localStorage
    const userData = localStorage.getItem('user');
    const parent = userData ? JSON.parse(userData) : null;
    setProfile(parent);
    // Fetch children details if available
    if (parent && parent.children_ids && parent.children_ids.length > 0) {
      getStudents({ noPaginate: 'true' }).then(res => {
        const allStudents = res.data || [];
        const kids = allStudents.filter((s: any) => parent.children_ids.includes(s.student_id));
        setChildren(kids);
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
          <label className="block font-medium mb-1">Parent ID</label>
          <div className="font-mono">{profile.parent_id}</div>
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
        <div className="mb-4">
          <label className="block font-medium mb-1">Children</label>
          <ul className="ml-2">
            {children.length === 0 && <li>No children found.</li>}
            {children.map(child => (
              <li key={child.student_id}>
                <a href={`/student/${child.student_id}`} className="text-blue-600 underline">{child.full_name} ({child.student_id})</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="bg-muted px-4 py-2 rounded">Cancel</button>
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