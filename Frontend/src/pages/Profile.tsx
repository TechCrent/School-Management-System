import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Shield, Save } from 'lucide-react';
import { notify } from '@/lib/utils';
import { USE_MOCK } from '../config';
import { useCustomToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ProfileFormData {
  full_name: string;
  email: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Utility to get privacy settings from localStorage
function getPrivacySettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
    return settings?.privacy || { profileVisible: true, showEmail: true, allowMessages: true };
  } catch {
    return { profileVisible: true, showEmail: true, allowMessages: true };
  }
}

export const Profile = () => {
  const { t } = useTranslation();
  const { customToast } = useCustomToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const privacy = getPrivacySettings();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const watchedPasswords = watch(['new_password', 'confirm_password']);

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (USE_MOCK) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update user data in localStorage
        const updatedUser = {
          ...user,
          full_name: data.full_name,
          email: data.email,
        };

        // Password change logic (mock)
        let passwordChanged = false;
        let passwordError = '';
        if (data.current_password || data.new_password || data.confirm_password) {
          if (!data.current_password) {
            passwordError = 'Current password is required.';
          } else if (!user?.password || data.current_password !== user.password) {
            passwordError = 'Current password is incorrect.';
          } else if (!data.new_password) {
            passwordError = 'New password is required.';
          } else if (data.new_password.length < 6) {
            passwordError = 'New password must be at least 6 characters.';
          } else if (data.new_password !== data.confirm_password) {
            passwordError = 'New password and confirmation do not match.';
          } else {
            updatedUser.password = data.new_password;
            passwordChanged = true;
          }
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        customToast({
          title: 'Profile updated',
          description: 'Your profile information has been updated successfully.',
        });

        if (passwordChanged) {
          customToast({
            title: 'Password changed',
            description: 'Your password has been updated.',
          });
        } else if (passwordError) {
          customToast({
            title: 'Password change failed',
            description: passwordError,
            variant: 'destructive',
          });
        }
      } else {
        // TODO: Replace with real API call to update profile and password
        // Example:
        // await apiUpdateProfile(data);
        // setUser(response.user);
        throw new Error('Production profile update not implemented yet.');
      }
    } catch (error) {
      customToast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {t('Profile')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('Manage your account settings and preferences')}
        </p>
      </div>

      {/* Privacy: Profile visibility */}
      {!privacy.profileVisible ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{t('Profile is private')}</h2>
          <p className="text-muted-foreground">{t('This user has hidden their profile.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user?.full_name ? getInitials(user.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{user?.full_name || t('User')}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="capitalize">{localStorage.getItem('role') || t('user')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {privacy.showEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email || t('No email')}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{t('Member since 2024')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{t('ID')}: {user?.user_id?.slice(0, 8) || 'N/A'}...</span>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle>{t('Account Information')}</CardTitle>
              <CardDescription>
                {t('Update your personal information and security settings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('Personal Information')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">{t('Full Name *')}</Label>
                      <Input
                        id="full_name"
                        {...register('full_name', { 
                          required: 'Full name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                        placeholder={t('Enter your full name')}
                        className={errors.full_name ? 'border-destructive' : ''}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-destructive">{errors.full_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('Email *')}</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        placeholder={t('Enter your email')}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Security Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('Security Settings')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('Leave password fields empty if you don\'t want to change your password')}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">{t('Current Password')}</Label>
                      <Input
                        id="current_password"
                        type="password"
                        {...register('current_password')}
                        placeholder={t('Enter current password')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">{t('New Password')}</Label>
                      <Input
                        id="new_password"
                        type="password"
                        {...register('new_password', {
                          minLength: watchedPasswords[0] ? { value: 6, message: 'Password must be at least 6 characters' } : undefined
                        })}
                        placeholder={t('Enter new password')}
                        className={errors.new_password ? 'border-destructive' : ''}
                      />
                      {errors.new_password && (
                        <p className="text-sm text-destructive">{errors.new_password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">{t('Confirm Password')}</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        {...register('confirm_password', {
                          validate: value => 
                            !watchedPasswords[0] || value === watchedPasswords[0] || 'Passwords do not match'
                        })}
                        placeholder={t('Confirm new password')}
                        className={errors.confirm_password ? 'border-destructive' : ''}
                      />
                      {errors.confirm_password && (
                        <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} className="min-w-32">
                    {isLoading ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('Save Changes')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};