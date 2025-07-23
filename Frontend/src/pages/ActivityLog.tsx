import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const mockLog = [
  { action: 'Student added', user: 'Admin', timestamp: '2024-05-01 10:00' },
  { action: 'Student deleted', user: 'Admin', timestamp: '2024-05-01 10:05' },
  { action: 'Profile updated', user: 'Jane Smith', timestamp: '2024-05-01 11:00' },
  { action: 'Logged in', user: 'John Doe', timestamp: '2024-05-01 12:00' },
];

export const ActivityLog = () => {
  const { t } = useTranslation();
  const [log] = useState(mockLog);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="text-center">
          <CardTitle>{t('Activity Log')}</CardTitle>
          <CardDescription>{t('See recent actions and changes in the system.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">{t('Action')}</th>
                <th className="text-left p-2">{t('User')}</th>
                <th className="text-left p-2">{t('Timestamp')}</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-2">{t(entry.action)}</td>
                  <td className="p-2">{entry.user}</td>
                  <td className="p-2 text-muted-foreground">{entry.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}; 