/**
 * نظام Rate Limiting متقدم لحماية API
 */

import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  blockDuration?: number; // بالدقائق
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: Date;
  blocked?: boolean;
}

class AdvancedRateLimiter {
  private static instance: AdvancedRateLimiter;
  private localCache = new Map<string, { count: number; resetTime: number; blocked?: boolean }>();

  static getInstance(): AdvancedRateLimiter {
    if (!AdvancedRateLimiter.instance) {
      AdvancedRateLimiter.instance = new AdvancedRateLimiter();
    }
    return AdvancedRateLimiter.instance;
  }

  /**
   * فحص حد المعدل للطلبات
   */
  async checkLimit(
    identifier: string, // IP أو user ID
    endpoint: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    const windowMs = config.windowMinutes * 60 * 1000;
    const windowStart = new Date(now - windowMs);

    try {
      // فحص الكاش المحلي أولاً
      const cached = this.localCache.get(key);
      if (cached && cached.resetTime > now) {
        if (cached.blocked) {
          return {
            allowed: false,
            remaining: 0,
            blocked: true,
            resetTime: new Date(cached.resetTime)
          };
        }

        if (cached.count >= config.maxRequests) {
          // حظر مؤقت
          const blockUntil = now + (config.blockDuration || 60) * 60 * 1000;
          this.localCache.set(key, { 
            count: cached.count, 
            resetTime: blockUntil, 
            blocked: true 
          });

          return {
            allowed: false,
            remaining: 0,
            blocked: true,
            resetTime: new Date(blockUntil)
          };
        }

        // تحديث العداد المحلي
        this.localCache.set(key, { 
          count: cached.count + 1, 
          resetTime: cached.resetTime 
        });

        return {
          allowed: true,
          remaining: config.maxRequests - cached.count - 1
        };
      }

      // فحص قاعدة البيانات
      const { data: rateLimitData, error } = await supabase
        .from('rate_limits')
        .select('request_count, window_start')
        .eq('ip_address', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .order('window_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const currentCount = rateLimitData?.request_count || 0;

      if (currentCount >= config.maxRequests) {
        // حظر مؤقت
        const blockUntil = now + (config.blockDuration || 60) * 60 * 1000;
        this.localCache.set(key, { 
          count: currentCount, 
          resetTime: blockUntil, 
          blocked: true 
        });

        return {
          allowed: false,
          remaining: 0,
          blocked: true,
          resetTime: new Date(blockUntil)
        };
      }

      // تحديث أو إنشاء سجل جديد
      if (rateLimitData) {
        await supabase
          .from('rate_limits')
          .update({ request_count: currentCount + 1 })
          .eq('ip_address', identifier)
          .eq('endpoint', endpoint)
          .eq('window_start', rateLimitData.window_start);
      } else {
        await supabase
          .from('rate_limits')
          .insert([{
            ip_address: identifier,
            endpoint: endpoint,
            request_count: 1,
            window_start: new Date().toISOString()
          }]);
      }

      // تحديث الكاش المحلي
      this.localCache.set(key, { 
        count: currentCount + 1, 
        resetTime: now + windowMs 
      });

      return {
        allowed: true,
        remaining: config.maxRequests - currentCount - 1,
        resetTime: new Date(now + windowMs)
      };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // في حالة الخطأ، نسمح بالطلب
      return { allowed: true, remaining: config.maxRequests };
    }
  }

  /**
   * تنظيف الكاش المحلي
   */
  cleanupLocalCache() {
    const now = Date.now();
    for (const [key, value] of this.localCache.entries()) {
      if (value.resetTime <= now) {
        this.localCache.delete(key);
      }
    }
  }

  /**
   * الحصول على إحصائيات Rate Limiting
   */
  async getStats(hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('rate_limits')
        .select('endpoint, request_count, ip_address, window_start')
        .gte('window_start', since.toISOString());

      if (error) throw error;

      const stats = {
        totalRequests: data?.reduce((sum, item) => sum + item.request_count, 0) || 0,
        uniqueIPs: new Set(data?.map(item => item.ip_address)).size || 0,
        topEndpoints: this.getTopEndpoints(data || []),
        requestsPerHour: this.getRequestsPerHour(data || [], hours)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching rate limit stats:', error);
      return null;
    }
  }

  private getTopEndpoints(data: any[]) {
    const endpointCounts = data.reduce((acc, item) => {
      acc[item.endpoint] = (acc[item.endpoint] || 0) + item.request_count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  private getRequestsPerHour(data: any[], hours: number) {
    const hourlyData = new Array(hours).fill(0);
    const now = new Date();

    data.forEach(item => {
      const itemTime = new Date(item.window_start);
      const hoursAgo = Math.floor((now.getTime() - itemTime.getTime()) / (60 * 60 * 1000));
      
      if (hoursAgo >= 0 && hoursAgo < hours) {
        hourlyData[hours - 1 - hoursAgo] += item.request_count;
      }
    });

    return hourlyData;
  }
}

export const advancedRateLimiter = AdvancedRateLimiter.getInstance();

// Rate Limiting Configurations
export const RATE_LIMIT_CONFIGS = {
  // API endpoints
  ORDER_CREATION: { maxRequests: 10, windowMinutes: 60, blockDuration: 30 },
  PRODUCT_UPDATE: { maxRequests: 50, windowMinutes: 60, blockDuration: 15 },
  DATA_FETCH: { maxRequests: 200, windowMinutes: 60, blockDuration: 5 },
  
  // User actions
  SEARCH_QUERIES: { maxRequests: 100, windowMinutes: 60, blockDuration: 10 },
  FORM_SUBMISSIONS: { maxRequests: 20, windowMinutes: 60, blockDuration: 30 },
  
  // Admin actions
  ADMIN_OPERATIONS: { maxRequests: 100, windowMinutes: 60, blockDuration: 60 }
} as const;

// Middleware function for rate limiting
export const withRateLimit = (config: RateLimitConfig) => {
  return async (identifier: string, endpoint: string, operation: () => Promise<any>) => {
    const rateLimitResult = await advancedRateLimiter.checkLimit(identifier, endpoint, config);
    
    if (!rateLimitResult.allowed) {
      const error = new Error('Rate limit exceeded');
      (error as any).rateLimitInfo = rateLimitResult;
      throw error;
    }

    return await operation();
  };
};