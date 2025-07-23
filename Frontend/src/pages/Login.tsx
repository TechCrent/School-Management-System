import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EduLiteLogo } from '../components/ui/logo';
import { mockAuth } from '../data/mockData';
import { USE_MOCK } from '../config';
import { login as apiLogin } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let authResult;
      if (USE_MOCK) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        authResult = mockAuth.login(email, password);
      } else {
        authResult = await apiLogin(email, password);
      }
      if (authResult) {
        localStorage.setItem('token', authResult.token);
        localStorage.setItem('role', authResult.role);
        localStorage.setItem('user', JSON.stringify(authResult.user));
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <EduLiteLogo size={60} />
            </div>
            <CardTitle className="text-2xl">{t('Welcome Back')}</CardTitle>
            <CardDescription>
              {t('Sign in to your EduLite account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('admin@schoolapp.com')}
                  required
                  className="transition-all duration-200 focus:shadow-glow"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('Password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('Enter your password')}
                    required
                    className="pr-10 transition-all duration-200 focus:shadow-glow"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? t('Hide password') : t('Show password')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{t(error)}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full shadow-glow hover:shadow-glow/50" 
                disabled={isLoading}
              >
                {isLoading ? t('Signing in...') : t('Sign In')}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <a href="/forgot-password" className="text-primary hover:underline text-sm">
                {t('Forgot Password?')}
              </a>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{t('Demo Credentials:')}</p>
              <div className="text-xs space-y-1">
                <div><strong>{t('Admin:')}</strong> {t('admin@schoolapp.com')} / {t('Admin$1234')}</div>
                <div><strong>{t('Teacher:')}</strong> {t('jane.smith@schoolapp.com')} / {t('Teacher$123')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};