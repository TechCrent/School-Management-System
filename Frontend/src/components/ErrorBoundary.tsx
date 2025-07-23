import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  t?: (key: string) => string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryBase extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    toast({
      title: this.props.t ? this.props.t('A global error occurred') : 'A global error occurred',
      description: error.message,
      variant: 'destructive',
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReport = () => {
    const subject = encodeURIComponent('EduLite App Error Report');
    const body = encodeURIComponent(
      `Error: ${this.state.error?.message || ''}\n\nPlease describe what you were doing when the error occurred:`
    );
    window.open(`mailto:support@edulite.com?subject=${subject}&body=${body}`);
  };

  public render() {
    const { t } = this.props;
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">{t ? t('Something went wrong') : 'Something went wrong'}</CardTitle>
              <CardDescription>
                {t ? t('An unexpected error occurred. Please try refreshing the page.') : 'An unexpected error occurred. Please try refreshing the page.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm text-muted-foreground">
                    {this.state.error.message}
                  </code>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t ? t('Try Again') : 'Try Again'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  {t ? t('Refresh Page') : 'Refresh Page'}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={this.handleReport}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t ? t('Report Error') : 'Report Error'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);