import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Activity, 
  Shield, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import PerformanceMonitor from './PerformanceMonitor';
import DatabaseManager from './DatabaseManager';
import { databaseOptimizer, healthMonitor } from '@/lib/database-optimizer';
import { advancedRateLimiter } from '@/lib/rate-limiter';

const OptimizationDashboard = () => {
  const [overallHealth, setOverallHealth] = useState<any>(null);
  const [rateLimitStats, setRateLimitStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      const [health, rateStats] = await Promise.all([
        healthMonitor.checkDatabaseHealth(),
        advancedRateLimiter.getStats(24)
      ]);

      setOverallHealth(health);
      setRateLimitStats(rateStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // تحديث كل 5 دقائق
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getHealthScore = () => {
    if (!overallHealth) return 0;
    
    let score = 0;
    if (overallHealth.connectivity) score += 25;
    if (overallHealth.responseTime < 100) score += 25;
    if (overallHealth.indexHealth) score += 25;
    if (overallHealth.recentErrors === 0) score += 25;
    
    return score;
  };

  const healthScore = getHealthScore();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">جاري تحميل لوحة التحسين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                لوحة تحسين الأداء
              </CardTitle>
              <CardDescription>
                مراقبة وتحسين أداء قاعدة البيانات والنظام
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                healthScore >= 75 ? 'text-green-600' : 
                healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthScore}%
              </div>
              <p className="text-sm text-muted-foreground">نقاط الصحة</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={healthScore} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {overallHealth?.connectivity ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">الاتصال</span>
              </div>
              
              <div className="flex items-center gap-2">
                {overallHealth?.responseTime < 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm">السرعة</span>
              </div>
              
              <div className="flex items-center gap-2">
                {overallHealth?.indexHealth ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm">الفهارس</span>
              </div>
              
              <div className="flex items-center gap-2">
                {overallHealth?.recentErrors === 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">الأخطاء</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting Overview */}
      {rateLimitStats && (
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              إحصائيات Rate Limiting
            </CardTitle>
            <CardDescription>آخر 24 ساعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{rateLimitStats.totalRequests.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{rateLimitStats.uniqueIPs}</p>
                <p className="text-sm text-muted-foreground">عناوين IP فريدة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{rateLimitStats.topEndpoints.length}</p>
                <p className="text-sm text-muted-foreground">نقاط نهاية نشطة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(rateLimitStats.totalRequests / 24)}
                </p>
                <p className="text-sm text-muted-foreground">طلبات/ساعة</p>
              </div>
            </div>

            {/* Top Endpoints */}
            {rateLimitStats.topEndpoints.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">أكثر النقاط استخداماً</h4>
                <div className="space-y-2">
                  {rateLimitStats.topEndpoints.map((endpoint: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-mono">{endpoint.endpoint}</span>
                      <Badge variant="outline">{endpoint.count.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            مراقب الأداء
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            إدارة قاعدة البيانات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            التحليلات المتقدمة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="shadow-soft border-primary/20">
            <CardHeader>
              <CardTitle>التحليلات المتقدمة</CardTitle>
              <CardDescription>تحليل مفصل لأداء النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">قريباً</h3>
                <p className="text-muted-foreground">
                  ستتوفر التحليلات المتقدمة في التحديث القادم
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizationDashboard;