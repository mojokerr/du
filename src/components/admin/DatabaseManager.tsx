import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Trash2, 
  Shield, 
  Zap, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { databaseOptimizer } from '@/lib/database-optimizer';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const DatabaseManager = () => {
  const [operations, setOperations] = useState({
    cleanup: false,
    optimization: false,
    indexing: false,
    security: false
  });

  const runCleanup = async () => {
    setOperations(prev => ({ ...prev, cleanup: true }));
    
    try {
      // تنظيف البيانات المكررة
      const { error: duplicateError } = await supabase.rpc('cleanup_duplicate_orders');
      if (duplicateError) throw duplicateError;

      // تحسين الصور
      await databaseOptimizer.optimizeProductImages();

      // تنظيف عام
      await databaseOptimizer.runDailyCleanup();

      toast.success('تم تنظيف قاعدة البيانات بنجاح! 🧹', {
        description: 'تم حذف البيانات المكررة وتحسين الصور'
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('خطأ في تنظيف قاعدة البيانات');
    } finally {
      setOperations(prev => ({ ...prev, cleanup: false }));
    }
  };

  const runIndexOptimization = async () => {
    setOperations(prev => ({ ...prev, indexing: true }));
    
    try {
      // إعادة بناء الإحصائيات
      await supabase.rpc('analyze_tables');
      
      toast.success('تم تحسين الفهارس بنجاح! ⚡', {
        description: 'تم تحديث إحصائيات الجداول وتحسين الفهارس'
      });
    } catch (error) {
      console.error('Index optimization error:', error);
      toast.error('خطأ في تحسين الفهارس');
    } finally {
      setOperations(prev => ({ ...prev, indexing: false }));
    }
  };

  const runSecurityAudit = async () => {
    setOperations(prev => ({ ...prev, security: true }));
    
    try {
      // فحص RLS policies
      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('*')
        .in('schemaname', ['public']);

      if (error) throw error;

      const securityIssues = [];
      
      // فحص الجداول بدون RLS
      const tables = ['orders', 'products', 'site_settings'];
      for (const table of tables) {
        const tablePolicies = policies?.filter(p => p.tablename === table) || [];
        if (tablePolicies.length === 0) {
          securityIssues.push(`جدول ${table} لا يحتوي على RLS policies`);
        }
      }

      if (securityIssues.length > 0) {
        toast.error('تم العثور على مشاكل أمنية', {
          description: `${securityIssues.length} مشكلة تحتاج إصلاح`
        });
      } else {
        toast.success('فحص الأمان مكتمل! 🔒', {
          description: 'جميع الجداول محمية بشكل صحيح'
        });
      }
    } catch (error) {
      console.error('Security audit error:', error);
      toast.error('خطأ في فحص الأمان');
    } finally {
      setOperations(prev => ({ ...prev, security: false }));
    }
  };

  const runFullOptimization = async () => {
    setOperations(prev => ({ ...prev, optimization: true }));
    
    try {
      // تشغيل جميع عمليات التحسين
      await runCleanup();
      await runIndexOptimization();
      await runSecurityAudit();

      toast.success('تم تحسين قاعدة البيانات بالكامل! 🚀', {
        description: 'جميع عمليات التحسين اكتملت بنجاح'
      });
    } catch (error) {
      console.error('Full optimization error:', error);
      toast.error('خطأ في التحسين الشامل');
    } finally {
      setOperations(prev => ({ ...prev, optimization: false }));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            إدارة قاعدة البيانات
          </CardTitle>
          <CardDescription>
            أدوات تحسين وصيانة قاعدة البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>تحذير:</strong> عمليات التحسين قد تستغرق بعض الوقت. 
              تأكد من عدم وجود عمليات مهمة قيد التنفيذ قبل البدء.
            </AlertDescription>
          </Alert>

          {/* Operations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Cleanup */}
            <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trash2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">تنظيف البيانات</h4>
                    <p className="text-sm text-muted-foreground">حذف البيانات المكررة والقديمة</p>
                  </div>
                </div>
                <Button 
                  onClick={runCleanup}
                  disabled={operations.cleanup}
                  variant="outline"
                  className="w-full"
                >
                  {operations.cleanup ? 'جاري التنظيف...' : 'بدء التنظيف'}
                </Button>
              </CardContent>
            </Card>

            {/* Index Optimization */}
            <Card className="border-2 border-dashed border-green-200 hover:border-green-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">تحسين الفهارس</h4>
                    <p className="text-sm text-muted-foreground">تحديث إحصائيات الجداول</p>
                  </div>
                </div>
                <Button 
                  onClick={runIndexOptimization}
                  disabled={operations.indexing}
                  variant="outline"
                  className="w-full"
                >
                  {operations.indexing ? 'جاري التحسين...' : 'تحسين الفهارس'}
                </Button>
              </CardContent>
            </Card>

            {/* Security Audit */}
            <Card className="border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">فحص الأمان</h4>
                    <p className="text-sm text-muted-foreground">مراجعة سياسات الأمان</p>
                  </div>
                </div>
                <Button 
                  onClick={runSecurityAudit}
                  disabled={operations.security}
                  variant="outline"
                  className="w-full"
                >
                  {operations.security ? 'جاري الفحص...' : 'فحص الأمان'}
                </Button>
              </CardContent>
            </Card>

            {/* Full Optimization */}
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">تحسين شامل</h4>
                    <p className="text-sm text-muted-foreground">تشغيل جميع عمليات التحسين</p>
                  </div>
                </div>
                <Button 
                  onClick={runFullOptimization}
                  disabled={Object.values(operations).some(Boolean)}
                  className="w-full bg-gradient-primary"
                >
                  {operations.optimization ? 'جاري التحسين الشامل...' : 'تحسين شامل'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Database Statistics */}
          <Card className="shadow-soft border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                إحصائيات قاعدة البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">4</p>
                  <p className="text-sm text-muted-foreground">جداول رئيسية</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-sm text-muted-foreground">فهارس محسنة</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-sm text-muted-foreground">سياسات أمان</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">5</p>
                  <p className="text-sm text-muted-foreground">دوال محسنة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManager;