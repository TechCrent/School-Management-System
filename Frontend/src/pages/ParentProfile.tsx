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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h2>
        <p className="text-muted-foreground">Manage your parent profile and view your children</p>
      </div>
      
      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Parent ID</label>
                  <div className="font-mono text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">{profile.parent_id}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!editing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Children</label>
                <div className="rounded-md border bg-background">
                  {children.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>No children found.</p>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {children.map(child => (
                        <li key={child.student_id} className="px-4 py-3 flex items-center justify-between">
                          <a 
                            href={`/student/${child.student_id}`} 
                            className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                          >
                            {child.full_name}
                          </a>
                          <span className="text-xs text-muted-foreground font-mono">{child.student_id}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {editing ? (
              <>
                <button 
                  type="submit" 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditing(false)} 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={() => setEditing(true)} 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentProfile; 