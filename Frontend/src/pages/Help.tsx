import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

export const Help = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="text-center">
          <CardTitle>{t('Help & Support')}</CardTitle>
          <CardDescription>{t('Find answers to common questions or contact us below.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{t('Frequently Asked Questions')}</h2>
            <ul className="space-y-2 text-sm">
              <li><strong>{t('How do I reset my password?')}</strong> {t('Use the Forgot Password link on the login page.')}</li>
              <li><strong>{t('How do I contact support?')}</strong> {t('Use the form below or email support@edulite.com.')}</li>
              <li><strong>{t('How do I update my profile?')}</strong> {t('Go to your Profile page and click Save Changes.')}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">{t('Contact Support')}</h2>
            {submitted ? (
              <div className="text-center py-8">
                <p className="mb-4">{t('Your message has been sent. We will get back to you soon!')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t('Your Name')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t('Your Email')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t('How can we help you?')}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('Sending...') : t('Send Message')}
                </Button>
              </form>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}; 