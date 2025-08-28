import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { databaseOptimizer, healthMonitor } from '@/lib/database-optimizer';
import { toast } from '@/components/ui/sonner';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const [metricsData, healthData] = await Promise.all([
        databaseOptimizer.getPerformanceMetrics(undefined, 24),
        healthMonitor.checkDatabaseHealth()
      ]);

      setMetrics(metricsData);
      setHealthStatus(healthData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('خطأ في تحميل بيانات الأداء');
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    setOptimizing(true);
    
    try {
      const success = await databaseOptimizer.runDailyCleanup();
      
      if (success) {
        toast.success('تم تحسين قاعدة البيانات بنجاح! ✨', {
          description: 'تم تنظيف البيانات وتحسين الأداء'
        });
        
        // إعادة تحميل المقاييس
        await fetchMetrics();
      } else {
        toast.error('فشل في تحسين قاعدة البيانات');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('حدث خطأ أثناء التحسين');
    } finally {
      setOptimizing(false);
    }
  };

  const generateReport = async () => {
    try {
      const report = await healthMonitor.generateHealthReport();
      
      // تحويل التقرير إلى JSON وتنزيله
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast.success('تم تنزيل تقرير الأداء');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('خطأ في إنشاء التقرير');
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // تحديث تلقائي كل دقيقة
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  // حساب المقاييس المجمعة
  const aggregatedMetrics = useMemo(() => {
    if (!metrics.length) return null;

    const queryTimes = metrics.filter(m => m.metric_name.includes('_time'));
    const errors = metrics.filter(m => m.metric_name.includes('_error'));
    const successes = metrics.filter(m => m.metric_name.includes('_success'));

    return {
      averageQueryTime: queryTimes.length > 0 
        ? queryTimes.reduce((sum, m) => sum + m.metric_value, 0) / queryTimes.length 
        : 0,
      totalErrors: errors.length,
      totalSuccesses: successes.length,
      errorRate: (errors.length / Math.max(1, errors.length + successes.length)) * 100,
      successRate: (successes.length / Math.max(1, errors.length + successes.length)) * 100
    };
  }, [metrics]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل مقاييس الأداء...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">مراقب الأداء</h2>
          <p className="text-muted-foreground">مراقبة وتحسين أداء قاعدة البيانات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button variant="outline" onClick={generateReport}>
            <Download className="w-4 h-4 ml-2" />
            تقرير
          </Button>
          <Button 
            onClick={runOptimization}
            disabled={optimizing}
            className="bg-gradient-primary"
          >
            {optimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري التحسين...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 ml-2" />
                تحسين قاعدة البيانات
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {healthStatus && (
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              حالة قاعدة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  healthStatus.connectivity ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {healthStatus.connectivity ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <p className="text-sm font-medium">الاتصال</p>
                <Badge variant={healthStatus.connectivity ? 'default' : 'destructive'}>
                  {healthStatus.connectivity ? 'متصل' : 'منقطع'}
                </Badge>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">وقت الاستجابة</p>
                <Badge variant={healthStatus.responseTime < 100 ? 'default' : 'secondary'}>
                  {healthStatus.responseTime.toFixed(0)}ms
                </Badge>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">الجداول</p>
                <Badge variant="outline">
                  {healthStatus.tableCount}
                </Badge>
              </div>

              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  healthStatus.recentErrors === 0 ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    healthStatus.recentErrors === 0 ? 'text-green-600' : 'text-orange-600'
                  }`} />
                </div>
                <p className="text-sm font-medium">الأخطاء (24س)</p>
                <Badge variant={healthStatus.recentErrors === 0 ? 'default' : 'destructive'}>
                  {healthStatus.recentErrors}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {aggregatedMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط وقت الاستعلام</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {aggregatedMetrics.averageQueryTime.toFixed(1)}ms
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">معدل النجاح</p>
                  <p className="text-2xl font-bold text-green-600">
                    {aggregatedMetrics.successRate.toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={aggregatedMetrics.successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الأخطاء</p>
                  <p className="text-2xl font-bold text-red-600">
                    {aggregatedMetrics.totalErrors}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">العمليات الناجحة</p>
                  <p className="text-2xl font-bold text-primary">
                    {aggregatedMetrics.totalSuccesses}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Metrics */}
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle>المقاييس الأخيرة</CardTitle>
          <CardDescription>آخر 20 مقياس أداء مسجل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {metrics.slice(0, 20).map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{metric.metric_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(metric.recorded_at).toLocaleString('ar-EG')}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">
                    {metric.metric_value.toFixed(2)} {metric.metric_unit}
                  </p>
                  {metric.metric_name.includes('error') && (
                    <AlertTriangle className="w-4 h-4 text-red-500 inline" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;