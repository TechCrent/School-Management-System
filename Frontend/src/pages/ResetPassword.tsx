import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

export const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(t('Password must be at least 6 characters'));
      return;
    }
    if (password !== confirm) {
      setError(t('Passwords do not match'));
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <CardTitle>{t('Reset Password')}</CardTitle>
          <CardDescription>{t('Enter your new password below.')}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <p className="mb-4">{t('Your password has been reset successfully.')}</p>
              <a href="/login" className="text-primary hover:underline">{t('Back to Login')}</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">{t('New Password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('Enter new password')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t('Confirm Password')}</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={t('Confirm new password')}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('Resetting...') : t('Reset Password')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 