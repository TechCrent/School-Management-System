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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h2>
        <p className="text-muted-foreground">Manage your teacher profile and preferences</p>
      </div>
      
      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Teacher ID</label>
                  <div className="font-mono text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">{profile.teacher_id}</div>
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
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <input
                    type="text"
                    name="subject_name"
                    value={profile.subject_name || ''}
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
                    value={profile.phone || ''}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!editing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Classes Taught</label>
                <div className="rounded-md border bg-background">
                  {classes.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>No classes found.</p>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {classes.map(cls => (
                        <li key={cls.class_id} className="px-4 py-3 flex items-center justify-between">
                          <span className="text-sm text-foreground">{cls.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{cls.class_id}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showNotifications"
                  checked={showNotifications}
                  onChange={e => setShowNotifications(e.target.checked)}
                  disabled={!editing}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label htmlFor="showNotifications" className="text-sm font-medium text-foreground select-none cursor-pointer">
                  Show notifications
                </label>
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
                  onClick={() => { setEditing(false); }} 
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

export default TeacherProfile; 