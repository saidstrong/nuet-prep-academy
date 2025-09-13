"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { performanceMonitor } from '@/lib/performance';
import { cache } from '@/lib/cache';

interface PerformanceStats {
  averagePageLoad: number;
  averageApiCall: number;
  slowestOperations: Array<{
    name: string;
    value: number;
    timestamp: number;
    url: string;
  }>;
  webVitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  };
  cacheStats: {
    size: number;
    hitRate: number;
  };
}

const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const performanceSummary = performanceMonitor.getPerformanceSummary();
      const webVitals = await performanceMonitor.getWebVitals();
      
      setStats({
        ...performanceSummary,
        webVitals,
        cacheStats: {
          size: cache.size(),
          hitRate: 0.85 // Mock hit rate - in real implementation, track this
        }
      });
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <Badge variant="success">Good</Badge>;
    if (value <= thresholds.warning) return <Badge variant="warning">Warning</Badge>;
    return <Badge variant="error">Poor</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading performance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-600">Unable to load performance data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Performance Dashboard</h2>
          <p className="text-slate-600">Monitor your application's performance metrics</p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Page Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(stats.averagePageLoad)}ms
            </div>
            <div className="flex items-center mt-2">
              {getPerformanceBadge(stats.averagePageLoad, { good: 2000, warning: 4000 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              API Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(stats.averageApiCall)}ms
            </div>
            <div className="flex items-center mt-2">
              {getPerformanceBadge(stats.averageApiCall, { good: 500, warning: 1000 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Cache Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.cacheStats.size}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {Math.round(stats.cacheStats.hitRate * 100)}% hit rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.webVitals.LCP ? Math.round(stats.webVitals.LCP) : 'N/A'}ms
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Largest Contentful Paint
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Web Vitals Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'FCP', value: stats.webVitals.FCP, threshold: 1800, unit: 'ms' },
              { name: 'LCP', value: stats.webVitals.LCP, threshold: 2500, unit: 'ms' },
              { name: 'FID', value: stats.webVitals.FID, threshold: 100, unit: 'ms' },
              { name: 'CLS', value: stats.webVitals.CLS, threshold: 0.1, unit: '' },
              { name: 'TTFB', value: stats.webVitals.TTFB, threshold: 800, unit: 'ms' }
            ].map((metric) => (
              <div key={metric.name} className="text-center">
                <div className="text-sm text-slate-600 mb-1">{metric.name}</div>
                <div className={`text-lg font-semibold ${
                  metric.value && metric.value <= metric.threshold 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {metric.value ? Math.round(metric.value) : 'N/A'}{metric.unit}
                </div>
                <div className="text-xs text-slate-500">
                  {metric.value && metric.value <= metric.threshold ? 'Good' : 'Needs improvement'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slowest Operations */}
      {stats.slowestOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Slowest Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.slowestOperations.map((operation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{operation.name}</div>
                    <div className="text-sm text-slate-500">{operation.url}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{Math.round(operation.value)}ms</div>
                    <div className="text-xs text-slate-500">
                      {new Date(operation.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Optimization Suggestions</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Enable image optimization and lazy loading</li>
                <li>• Implement code splitting for large components</li>
                <li>• Use CDN for static assets</li>
                <li>• Optimize database queries</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Cache Strategy</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• API responses cached for 10 minutes</li>
                <li>• Course content cached for 30 minutes</li>
                <li>• User profiles cached for 30 minutes</li>
                <li>• Automatic cache cleanup every 5 minutes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;
