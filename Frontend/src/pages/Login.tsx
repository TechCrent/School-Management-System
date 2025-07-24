import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EduLiteLogo } from '../components/ui/logo';
import { USE_MOCK } from '../config';
import { login as apiLogin } from '../api/edulite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/layout/AuthContext';
import { Switch } from '@/components/ui/switch';

type AuthResponse = {
  status: string;
  data?: unknown;
  error?: string;
};

export const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Universal mock/live toggle
  const [isMock, setIsMock] = useState(() => {
    const stored = localStorage.getItem('USE_MOCK');
    if (stored === null) {
      localStorage.setItem('USE_MOCK', 'true');
      return true;
    }
    return stored === 'true';
  });

  useEffect(() => {
    // Ensure default is set on first load
    if (localStorage.getItem('USE_MOCK') === null) {
      localStorage.setItem('USE_MOCK', 'true');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await login(username, password);
      if (res.status === 'success') {
        // Redirect based on role
        const role = localStorage.getItem('role');
        let redirectPath = '/';
        if (role === 'student' || role === 'parent') {
          redirectPath = '/homework';
        }
        navigate(redirectPath);
      } else {
        setError(res.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-2">
        <Switch
          checked={isMock}
          onCheckedChange={(checked) => {
            localStorage.setItem('USE_MOCK', checked ? 'true' : 'false');
            setIsMock(checked);
            window.location.reload();
          }}
          id="mock-toggle-login"
        />
        <label htmlFor="mock-toggle-login" className="text-xs text-muted-foreground select-none">
          {isMock ? 'Mock Data' : 'Live Data'}
        </label>
      </div>
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
                <Label htmlFor="username">{t('Username')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('admin')}
                  required
                  className="transition-all duration-200 focus:shadow-glow"
                  aria-describedby={error ? 'login-error' : undefined}
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
                    aria-describedby={error ? 'login-error' : undefined}
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
                  <AlertDescription id="login-error">{t(error)}</AlertDescription>
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
              <p className="text-sm text-muted-foreground mb-2">{t('Demo Credentials (for testing only):')}</p>
              <div className="text-xs space-y-1">
                <div><strong>{t('Admin:')}</strong> admin@schoolapp.com / Admin$1234</div>
                <div><strong>{t('Teacher:')}</strong> jane.smith@schoolapp.com / Teacher$123</div>
                <div><strong>{t('Student:')}</strong> student1@example.com / Student$1234</div>
                <div><strong>{t('Parent:')}</strong> parent1@example.com / Parent$1234</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};