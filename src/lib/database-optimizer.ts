/**
 * نظام تحسين قاعدة البيانات والأداء
 * Database Performance Optimizer
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheManager } from '@/lib/cache';
import { performanceMonitor } from '@/lib/performance';

interface QueryOptimizer {
  enableCache: boolean;
  cacheTTL: number;
  enablePagination: boolean;
  pageSize: number;
}

interface PerformanceMetric {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  metadata?: Record<string, any>;
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * تحسين استعلام الطلبات مع البحث والتصفية
   */
  async getOptimizedOrders(options: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    useCache?: boolean;
  } = {}) {
    const {
      search = '',
      status = 'all',
      page = 1,
      pageSize = 50,
      useCache = true
    } = options;

    const cacheKey = `orders_${search}_${status}_${page}_${pageSize}`;
    
    // التحقق من الكاش أولاً
    if (useCache) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const startTime = performance.now();

    try {
      // استخدام الدالة المحسنة للبحث
      const { data, error } = await supabase
        .rpc('search_orders', {
          search_term: search,
          status_filter: status
        })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      // تسجيل مقياس الأداء
      await this.recordPerformanceMetric({
        metric_name: 'orders_query_time',
        metric_value: queryTime,
        metric_unit: 'milliseconds',
        metadata: { search, status, page, pageSize, resultCount: data?.length || 0 }
      });

      // حفظ في الكاش
      if (useCache) {
        cacheManager.set(cacheKey, data, 2 * 60 * 1000); // 2 دقيقة
      }

      return data;
    } catch (error) {
      console.error('Error in optimized orders query:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات لوحة التحكم بكفاءة
   */
  async getDashboardStats(useCache: boolean = true) {
    const cacheKey = 'dashboard_stats';
    
    if (useCache) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const startTime = performance.now();

    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) throw error;

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      // تسجيل مقياس الأداء
      await this.recordPerformanceMetric({
        metric_name: 'dashboard_stats_query_time',
        metric_value: queryTime,
        metric_unit: 'milliseconds'
      });

      // حفظ في الكاش لمدة 5 دقائق
      if (useCache) {
        cacheManager.set(cacheKey, data, 5 * 60 * 1000);
      }

      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * البحث المتقدم في جميع البيانات
   */
  async advancedSearch(query: string, filters: Record<string, any> = {}) {
    const cacheKey = `advanced_search_${query}_${JSON.stringify(filters)}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    const startTime = performance.now();

    try {
      const { data, error } = await supabase.rpc('advanced_search', {
        search_query: query,
        filters: filters
      });

      if (error) throw error;

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      await this.recordPerformanceMetric({
        metric_name: 'advanced_search_time',
        metric_value: queryTime,
        metric_unit: 'milliseconds',
        metadata: { query, filters, resultCount: data?.length || 0 }
      });

      // حفظ في الكاش لمدة دقيقة واحدة
      cacheManager.set(cacheKey, data, 60 * 1000);

      return data;
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw error;
    }
  }

  /**
   * تحسين استعلام المنتجات
   */
  async getOptimizedProducts(options: {
    activeOnly?: boolean;
    includeImages?: boolean;
    useCache?: boolean;
  } = {}) {
    const { activeOnly = true, includeImages = true, useCache = true } = options;
    const cacheKey = `products_${activeOnly}_${includeImages}`;
    
    if (useCache) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const startTime = performance.now();

    try {
      let query = supabase.from(activeOnly ? 'active_products' : 'products');
      
      if (!includeImages) {
        query = query.select('id, name, brand, price, description, is_active, created_at, updated_at');
      } else {
        query = query.select('*');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      await this.recordPerformanceMetric({
        metric_name: 'products_query_time',
        metric_value: queryTime,
        metric_unit: 'milliseconds',
        metadata: { activeOnly, includeImages, resultCount: data?.length || 0 }
      });

      if (useCache) {
        cacheManager.set(cacheKey, data, 3 * 60 * 1000); // 3 دقائق
      }

      return data;
    } catch (error) {
      console.error('Error in optimized products query:', error);
      throw error;
    }
  }

  /**
   * تسجيل مقياس أداء
   */
  async recordPerformanceMetric(metric: PerformanceMetric) {
    try {
      await supabase
        .from('performance_metrics')
        .insert([{
          ...metric,
          recorded_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }

  /**
   * الحصول على مقاييس الأداء
   */
  async getPerformanceMetrics(metricName?: string, hours: number = 24) {
    try {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      if (metricName) {
        query = query.eq('metric_name', metricName);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }
  }

  /**
   * تحسين الصور - إزالة الروابط المعطلة
   */
  async optimizeProductImages() {
    const startTime = performance.now();
    
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, images')
        .not('images', 'is', null);

      if (error) throw error;

      let totalOptimized = 0;

      for (const product of products || []) {
        if (!product.images || product.images.length === 0) continue;

        // فحص الصور والتحقق من صحتها
        const validImages = await Promise.all(
          product.images.map(async (imageUrl: string) => {
            try {
              const response = await fetch(imageUrl, { method: 'HEAD' });
              return response.ok ? imageUrl : null;
            } catch {
              return null;
            }
          })
        );

        const filteredImages = validImages.filter(Boolean);

        if (filteredImages.length !== product.images.length) {
          await supabase
            .from('products')
            .update({ images: filteredImages })
            .eq('id', product.id);
          
          totalOptimized++;
        }
      }

      const endTime = performance.now();
      const optimizationTime = endTime - startTime;

      await this.recordPerformanceMetric({
        metric_name: 'image_optimization_time',
        metric_value: optimizationTime,
        metric_unit: 'milliseconds',
        metadata: { productsOptimized: totalOptimized }
      });

      return { optimized: totalOptimized, time: optimizationTime };
    } catch (error) {
      console.error('Error optimizing images:', error);
      throw error;
    }
  }

  /**
   * تنظيف الكاش
   */
  clearCache(pattern?: string) {
    if (pattern) {
      cacheManager.invalidatePattern(pattern);
    } else {
      cacheManager.clear();
    }
  }

  /**
   * تشغيل التنظيف اليومي
   */
  async runDailyCleanup() {
    try {
      const { error } = await supabase.rpc('daily_cleanup');
      if (error) throw error;

      // تنظيف الكاش المحلي أيضاً
      this.clearCache();

      await this.recordPerformanceMetric({
        metric_name: 'daily_cleanup_success',
        metric_value: 1,
        metric_unit: 'boolean'
      });

      return true;
    } catch (error) {
      console.error('Error running daily cleanup:', error);
      
      await this.recordPerformanceMetric({
        metric_name: 'daily_cleanup_error',
        metric_value: 1,
        metric_unit: 'boolean',
        metadata: { error: error.message }
      });

      return false;
    }
  }
}

export const databaseOptimizer = DatabaseOptimizer.getInstance();

// Rate Limiting Utility
export class RateLimiter {
  private static instance: RateLimiter;

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkRateLimit(
    ipAddress: string,
    endpoint: string,
    maxRequests: number = 100,
    windowMinutes: number = 60
  ): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

      // الحصول على عدد الطلبات الحالية
      const { data: existing, error: fetchError } = await supabase
        .from('rate_limits')
        .select('request_count')
        .eq('ip_address', ipAddress)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const currentCount = existing?.request_count || 0;

      if (currentCount >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      // تحديث أو إنشاء سجل جديد
      if (existing) {
        await supabase
          .from('rate_limits')
          .update({ request_count: currentCount + 1 })
          .eq('ip_address', ipAddress)
          .eq('endpoint', endpoint)
          .gte('window_start', windowStart.toISOString());
      } else {
        await supabase
          .from('rate_limits')
          .insert([{
            ip_address: ipAddress,
            endpoint: endpoint,
            request_count: 1,
            window_start: new Date().toISOString()
          }]);
      }

      return { 
        allowed: true, 
        remaining: maxRequests - currentCount - 1 
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // في حالة الخطأ، نسمح بالطلب
      return { allowed: true, remaining: maxRequests };
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();

// Performance Monitoring Hooks
export const usePerformanceMonitoring = () => {
  const recordMetric = async (name: string, value: number, unit: string = 'count', metadata?: any) => {
    await databaseOptimizer.recordPerformanceMetric({
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      metadata
    });
  };

  const measureQuery = async <T>(
    queryName: string,
    queryFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await queryFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;

      await recordMetric(`${queryName}_duration`, duration, 'milliseconds');
      await recordMetric(`${queryName}_success`, 1, 'count');

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      await recordMetric(`${queryName}_duration`, duration, 'milliseconds');
      await recordMetric(`${queryName}_error`, 1, 'count', { error: error.message });

      throw error;
    }
  };

  return { recordMetric, measureQuery };
};

// Optimized Query Builder
export class OptimizedQueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private whereConditions: string[] = [];
  private orderBy: string = '';
  private limitValue: number | null = null;
  private offsetValue: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string) {
    this.selectFields = fields;
    return this;
  }

  where(condition: string) {
    this.whereConditions.push(condition);
    return this;
  }

  order(field: string, ascending: boolean = true) {
    this.orderBy = `${field} ${ascending ? 'ASC' : 'DESC'}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  offset(count: number) {
    this.offsetValue = count;
    return this;
  }

  async execute() {
    let query = supabase.from(this.tableName).select(this.selectFields);

    // تطبيق الشروط
    this.whereConditions.forEach(condition => {
      const [field, operator, value] = condition.split(' ');
      switch (operator) {
        case '=':
          query = query.eq(field, value);
          break;
        case '!=':
          query = query.neq(field, value);
          break;
        case '>':
          query = query.gt(field, value);
          break;
        case '<':
          query = query.lt(field, value);
          break;
        case 'LIKE':
          query = query.ilike(field, value);
          break;
      }
    });

    // ترتيب
    if (this.orderBy) {
      const [field, direction] = this.orderBy.split(' ');
      query = query.order(field, { ascending: direction === 'ASC' });
    }

    // تحديد النطاق
    if (this.limitValue !== null) {
      const start = this.offsetValue || 0;
      const end = start + this.limitValue - 1;
      query = query.range(start, end);
    }

    return await query;
  }
}

// Database Health Monitor
export class DatabaseHealthMonitor {
  async checkDatabaseHealth() {
    const healthChecks = {
      connectivity: false,
      responseTime: 0,
      tableCount: 0,
      indexHealth: false,
      recentErrors: 0
    };

    try {
      const startTime = performance.now();
      
      // اختبار الاتصال
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (!error) {
        healthChecks.connectivity = true;
        healthChecks.responseTime = performance.now() - startTime;
      }

      // فحص عدد الجداول
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('count')
        .eq('table_schema', 'public');

      healthChecks.tableCount = tables?.length || 0;

      // فحص الأخطاء الأخيرة
      const { data: recentErrors } = await supabase
        .from('performance_metrics')
        .select('count')
        .like('metric_name', '%_error')
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      healthChecks.recentErrors = recentErrors?.length || 0;
      healthChecks.indexHealth = healthChecks.responseTime < 100; // أقل من 100ms

      return healthChecks;
    } catch (error) {
      console.error('Database health check failed:', error);
      return healthChecks;
    }
  }

  async generateHealthReport() {
    const health = await this.checkDatabaseHealth();
    const metrics = await databaseOptimizer.getPerformanceMetrics();

    return {
      timestamp: new Date().toISOString(),
      health,
      metrics: {
        totalQueries: metrics.length,
        averageResponseTime: metrics
          .filter(m => m.metric_name.includes('_time'))
          .reduce((sum, m) => sum + m.metric_value, 0) / 
          Math.max(1, metrics.filter(m => m.metric_name.includes('_time')).length),
        errorRate: metrics.filter(m => m.metric_name.includes('_error')).length / Math.max(1, metrics.length) * 100
      },
      recommendations: this.generateRecommendations(health, metrics)
    };
  }

  private generateRecommendations(health: any, metrics: any[]) {
    const recommendations = [];

    if (health.responseTime > 200) {
      recommendations.push('تحسين الفهارس لتقليل وقت الاستجابة');
    }

    if (health.recentErrors > 10) {
      recommendations.push('مراجعة الأخطاء الأخيرة وإصلاح المشاكل');
    }

    if (metrics.length > 1000) {
      recommendations.push('تنظيف مقاييس الأداء القديمة');
    }

    return recommendations;
  }
}

export const healthMonitor = new DatabaseHealthMonitor();