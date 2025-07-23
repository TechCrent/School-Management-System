import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Globe, 
  Shield,
  Save,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notify } from '@/lib/utils';

export const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      homework: true,
      grades: true,
      announcements: false,
    },
    appearance: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      allowMessages: true,
    },
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('app_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
        if (parsed?.appearance?.language) {
          i18n.changeLanguage(parsed.appearance.language);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      notify('push', {
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      notify('push', {
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updateAppearanceSetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }));
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark' | 'system');
    }
    if (key === 'language') {
      i18n.changeLanguage(value);
    }
  };

  const updatePrivacySetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  // Export user data as JSON
  const handleExportData = () => {
    const user = localStorage.getItem('user');
    const settings = localStorage.getItem('app_settings');
    const data = { user: user ? JSON.parse(user) : null, settings: settings ? JSON.parse(settings) : null };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edulite-data.json';
    a.click();
    URL.revokeObjectURL(url);
    notify('push', { title: 'Data Exported', description: 'Your data has been exported as JSON.' });
  };

  // Download privacy report as text
  const handleDownloadPrivacyReport = () => {
    const settings = localStorage.getItem('app_settings');
    const privacy = settings ? JSON.parse(settings).privacy : {};
    const report = `EduLite Privacy Report\n\nPrivacy Settings:\n${JSON.stringify(privacy, null, 2)}\n\nFor more info, contact support.`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edulite-privacy-report.txt';
    a.click();
    URL.revokeObjectURL(url);
    notify('push', { title: 'Privacy Report Downloaded', description: 'Your privacy report has been downloaded.' });
  };

  // Delete account: clear localStorage and redirect
  const handleDeleteAccount = () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    localStorage.clear();
    notify('push', { title: 'Account Deleted', description: 'Your account and data have been deleted.' });
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and privacy settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="font-medium">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="font-medium">
                Push Notifications
              </Label>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <Label htmlFor="homework-notifications" className="font-medium">
                Homework Reminders
              </Label>
              <Switch
                id="homework-notifications"
                checked={settings.notifications.homework}
                onCheckedChange={(checked) => updateNotificationSetting('homework', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="grades-notifications" className="font-medium">
                Grade Updates
              </Label>
              <Switch
                id="grades-notifications"
                checked={settings.notifications.grades}
                onCheckedChange={(checked) => updateNotificationSetting('grades', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="announcements-notifications" className="font-medium">
                School Announcements
              </Label>
              <Switch
                id="announcements-notifications"
                checked={settings.notifications.announcements}
                onCheckedChange={(checked) => updateNotificationSetting('announcements', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={theme}
                onValueChange={(value) => updateAppearanceSetting('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">{t('Language')}</Label>
              <Select
                value={settings.appearance.language}
                onValueChange={(value) => updateAppearanceSetting('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.appearance.timezone}
                onValueChange={(value) => updateAppearanceSetting('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                  <SelectItem value="CST">Central (CST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visible" className="font-medium">
                Make Profile Visible
              </Label>
              <Switch
                id="profile-visible"
                checked={settings.privacy.profileVisible}
                onCheckedChange={(checked) => updatePrivacySetting('profileVisible', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-email" className="font-medium">
                Show Email to Others
              </Label>
              <Switch
                id="show-email"
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked) => updatePrivacySetting('showEmail', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-messages" className="font-medium">
                Allow Messages
              </Label>
              <Switch
                id="allow-messages"
                checked={settings.privacy.allowMessages}
                onCheckedChange={(checked) => updatePrivacySetting('allowMessages', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <CardTitle>Account Management</CardTitle>
            </div>
            <CardDescription>
              Manage your account and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
              <Globe className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={handleDownloadPrivacyReport}>
              <Shield className="h-4 w-4 mr-2" />
              Download Privacy Report
            </Button>
            
            <Separator />
            
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="min-w-32">
          {isLoading ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};