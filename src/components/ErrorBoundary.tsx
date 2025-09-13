"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send the error to a service like Sentry
      console.error('Production error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">
                Oops! Something went wrong
              </CardTitle>
              <p className="text-slate-600 mt-2">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="error">
                  <Bug className="w-4 h-4" />
                  <div>
                    <h4 className="font-semibold">Error Details (Development)</h4>
                    <p className="text-sm mt-1 font-mono">
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">
                          Stack Trace
                        </summary>
                        <pre className="text-xs mt-2 overflow-auto bg-slate-100 p-2 rounded">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </Alert>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Help text */}
              <div className="text-center text-sm text-slate-500">
                <p>
                  If this problem persists, please contact our support team.
                </p>
                <p className="mt-1">
                  Error ID: {Date.now().toString(36)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to catch errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // You can add additional error handling logic here
    // such as sending to an error reporting service
  };
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
