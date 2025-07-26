import { useEffect, useState } from 'react';
import { getClasses } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Edit, 
  Save, 
  X,
  Shield,
  Calendar
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

const TeacherProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(() => {
    const stored = localStorage.getItem('showNotifications');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Get teacher from localStorage
      const userData = localStorage.getItem('user');
      const teacher = userData ? JSON.parse(userData) : null;
      setProfile(teacher);
      
      // Fetch classes taught by this teacher
      if (teacher && teacher.teacher_id) {
        const res = await getClasses({ noPaginate: 'true' });
        const allClasses = res.data || [];
        const myClasses = allClasses.filter((c: any) => c.teacher_id === teacher.teacher_id);
        setClasses(myClasses);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    // In a real app, save profile changes to backend
    // For now, just update localStorage
    if (profile) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        subject_name: profile.subject_name
      }));
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reload original data
    loadProfileData();
  };

  if (loading) return <Loading size="lg" text="Loading profile..." />;

  if (!profile) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Profile' }]} />
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground">
              Unable to load your profile information. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Profile' }]} />
      
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h2>
        <p className="text-muted-foreground">Manage your teacher profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your contact information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Teacher ID</Label>
                    <div className="font-mono text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {profile.teacher_id}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      name="full_name"
                      value={profile.full_name}
                      onChange={handleChange}
                      disabled={!editing}
                      className="disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        disabled={!editing}
                        className="disabled:opacity-50"
                      />
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={profile.phone || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        className="disabled:opacity-50"
                      />
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject_name">Subject</Label>
                    <Input
                      id="subject_name"
                      type="text"
                      name="subject_name"
                      value={profile.subject_name || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Classes Taught</Label>
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
                  <Switch
                    id="showNotifications"
                    checked={showNotifications}
                    onCheckedChange={setShowNotifications}
                    disabled={!editing}
                  />
                  <Label htmlFor="showNotifications" className="text-sm font-medium">
                    Show notifications
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  {editing ? (
                    <>
                      <Button type="submit" className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancel} className="flex items-center">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setEditing(true)} className="flex items-center">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <Badge variant="default">Teacher</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">2024</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile; 