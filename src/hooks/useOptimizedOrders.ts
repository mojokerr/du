/**
 * Hook محسن للطلبات مع دعم البحث والتصفية والـ pagination
 */

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { databaseOptimizer, usePerformanceMonitoring } from '@/lib/database-optimizer';
import { performanceMonitor } from '@/lib/performance';

export interface OptimizedOrdersOptions {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useOptimizedOrders = (options: OptimizedOrdersOptions = {}) => {
  const {
    search = '',
    status = 'all',
    page = 1,
    pageSize = 50,
    autoRefresh = false,
    refreshInterval = 30000 // 30 ثانية
  } = options;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { measureQuery } = usePerformanceMonitoring();

  // Debounced search للأداء الأفضل
  const debouncedSearch = useMemo(
    () => performanceMonitor.debounce((searchTerm: string) => {
      fetchOrders(searchTerm, status, page, pageSize);
    }, 300),
    [status, page, pageSize]
  );

  const fetchOrders = async (
    searchTerm: string = search,
    statusFilter: string = status,
    currentPage: number = page,
    currentPageSize: number = pageSize
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await measureQuery('optimized_orders_fetch', async () => {
        return await databaseOptimizer.getOptimizedOrders({
          search: searchTerm,
          status: statusFilter,
          page: currentPage,
          pageSize: currentPageSize,
          useCache: true
        });
      });

      setOrders(result || []);
      setTotalCount(result?.length || 0);
    } catch (err) {
      const errorMessage = 'خطأ في تحميل الطلبات';
      setError(errorMessage);
      toast({
        title: errorMessage,
        description: 'حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const result = await measureQuery('order_status_update', async () => {
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);

        if (error) throw error;
        return true;
      });

      if (result) {
        // تحديث الطلب محلياً
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));

        // مسح الكاش المتعلق بالطلبات
        databaseOptimizer.clearCache('orders_');

        toast({
          title: 'تم التحديث بنجاح',
          description: `تم تغيير حالة الطلب إلى: ${newStatus}`,
        });

        return true;
      }
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث حالة الطلب.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const refreshData = () => {
    databaseOptimizer.clearCache('orders_');
    fetchOrders();
  };

  // تأثير للبحث المُحسن
  useEffect(() => {
    if (search) {
      debouncedSearch(search);
    } else {
      fetchOrders();
    }
  }, [search, status, page, pageSize]);

  // تأثير للتحديث التلقائي
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // إحصائيات محسنة
  const statistics = useMemo(() => {
    return {
      total: orders.length,
      byStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + Number(order.total_amount), 0) / orders.length 
        : 0
    };
  }, [orders]);

  return {
    orders,
    loading,
    error,
    totalCount,
    statistics,
    updateOrderStatus,
    refreshData,
    fetchOrders: () => fetchOrders()
  };
};