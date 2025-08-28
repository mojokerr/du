/**
 * Hook محسن للمنتجات مع تحسينات الأداء
 */

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { databaseOptimizer, usePerformanceMonitoring } from '@/lib/database-optimizer';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedProductsOptions {
  activeOnly?: boolean;
  includeImages?: boolean;
  useCache?: boolean;
  autoOptimizeImages?: boolean;
}

export const useOptimizedProducts = (options: OptimizedProductsOptions = {}) => {
  const {
    activeOnly = true,
    includeImages = true,
    useCache = true,
    autoOptimizeImages = false
  } = options;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const { toast } = useToast();
  const { measureQuery } = usePerformanceMonitoring();

  const fetchProducts = async () => {
    setLoading(true);
    
    try {
      const result = await measureQuery('optimized_products_fetch', async () => {
        return await databaseOptimizer.getOptimizedProducts({
          activeOnly,
          includeImages,
          useCache
        });
      });

      setProducts(result || []);

      // تحسين الصور تلقائياً إذا كان مفعلاً
      if (autoOptimizeImages && result && result.length > 0) {
        optimizeImages();
      }
    } catch (error) {
      console.error('Error fetching optimized products:', error);
      toast({
        title: 'خطأ في تحميل المنتجات',
        description: 'حدث خطأ أثناء تحميل المنتجات المحسنة.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizeImages = async () => {
    setOptimizing(true);
    
    try {
      const result = await databaseOptimizer.optimizeProductImages();
      
      if (result.optimized > 0) {
        toast({
          title: 'تم تحسين الصور',
          description: `تم تحسين ${result.optimized} منتج في ${result.time.toFixed(0)}ms`,
        });
        
        // إعادة تحميل المنتجات بعد التحسين
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error optimizing images:', error);
      toast({
        title: 'خطأ في تحسين الصور',
        description: 'حدث خطأ أثناء تحسين صور المنتجات.',
        variant: 'destructive',
      });
    } finally {
      setOptimizing(false);
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      const result = await measureQuery('product_update', async () => {
        const { error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
        return true;
      });

      if (result) {
        setProducts(prev => prev.map(product => 
          product.id === id ? { ...product, ...updates } : product
        ));

        // مسح الكاش
        databaseOptimizer.clearCache('products_');

        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم حفظ جميع التغييرات على المنتج',
        });

        return true;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء حفظ التغييرات.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const addProduct = async (productData: any) => {
    try {
      const result = await measureQuery('product_insert', async () => {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      if (result) {
        setProducts(prev => [result, ...prev]);
        databaseOptimizer.clearCache('products_');
        
        toast({
          title: 'تم إضافة المنتج',
          description: 'تم إضافة المنتج الجديد بنجاح',
        });

        return result;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'خطأ في الإضافة',
        description: 'حدث خطأ أثناء إضافة المنتج.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // إحصائيات المنتجات
  const statistics = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(p => p.is_active !== false).length,
      withImages: products.filter(p => p.images && p.images.length > 0).length,
      averagePrice: products.length > 0 
        ? products.reduce((sum, p) => sum + Number(p.price), 0) / products.length 
        : 0,
      byBrand: products.reduce((acc, product) => {
        acc[product.brand] = (acc[product.brand] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [activeOnly, includeImages]);

  return {
    products,
    loading,
    optimizing,
    statistics,
    updateProduct,
    addProduct,
    optimizeImages,
    refreshData: fetchProducts
  };
};