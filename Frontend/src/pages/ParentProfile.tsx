import { useEffect, useState } from 'react';
import { getStudents, ApiResponse } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Users, 
  Edit, 
  Save, 
  X,
  Shield,
  Calendar
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import parents from '../data/parents.json';

interface Parent {
  parent_id: string;
  full_name: string;
  email: string;
  phone: string;
  children_ids: string[];
}

interface Student {
  student_id: string;
  full_name: string;
  grade: string;
  email: string;
  status?: string;
}

const ParentProfile = () => {
  const [profile, setProfile] = useState<Parent | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Get parent from localStorage or use default for testing
      const storedUser = localStorage.getItem('user');
      const parentId = storedUser ? JSON.parse(storedUser).parent_id : 'P0001';
      const parent = parents.find(p => p.parent_id === parentId);
      
      if (parent) {
        setProfile(parent);
        
        // Fetch children details
        const studentsRes = await getStudents();
        if (studentsRes.status === 'success' && studentsRes.data) {
          const parentChildren = studentsRes.data.filter((student: Student) => 
            parent.children_ids.includes(student.student_id)
          );
          setChildren(parentChildren);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
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
        phone: profile.phone
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
        <p className="text-muted-foreground">Manage your parent profile and view your children</p>
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
                    <label className="text-sm font-medium text-foreground">Parent ID</label>
                    <div className="font-mono text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {profile.parent_id}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input
                      type="text"
                      name="full_name"
                      value={profile.full_name}
                      onChange={handleChange}
                      disabled={!editing}
                      className="disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="flex items-center space-x-2">
                      <Input
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
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        className="disabled:opacity-50"
                      />
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
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

        {/* Children Overview */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                My Children
              </CardTitle>
              <CardDescription>{children.length} enrolled student{children.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {children.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No children found.</p>
                  </div>
                ) : (
                  children.map(child => (
                    <div key={child.student_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {child.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{child.full_name}</div>
                          <div className="text-xs text-muted-foreground">Grade {child.grade}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {child.status || 'Active'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
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
                <Badge variant="default">Parent</Badge>
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

export default ParentProfile; 