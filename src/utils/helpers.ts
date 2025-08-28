/**
 * دوال مساعدة محسنة للنظام
 */

import { SHIPPING_CONFIG, GOVERNORATES, type Governorate } from './constants';
import { performanceMonitor } from '@/lib/performance';

/**
 * حساب إجمالي الطلب مع الشحن
 */
export const calculateOrderTotal = (
  productPrice: number, 
  quantity: number = 1, 
  governorate: string
) => {
  const subtotal = productPrice * quantity;
  const isCairoGiza = SHIPPING_CONFIG.CAIRO_GIZA_GOVERNORATES.includes(governorate);
  
  let shippingCost = 0;
  
  if (subtotal < SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    shippingCost = isCairoGiza 
      ? SHIPPING_CONFIG.CAIRO_GIZA_COST 
      : SHIPPING_CONFIG.OTHER_GOVERNORATES_COST;
  }
  
  return {
    subtotal,
    shipping: shippingCost,
    total: subtotal + shippingCost,
    freeShipping: subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
  };
};

/**
 * تنسيق السعر بالعملة المصرية
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('ar-EG')} جنيه`;
};

/**
 * تنسيق التاريخ بالعربية
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

/**
 * تنسيق الوقت بالعربية
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * إنشاء رسالة واتساب محسنة
 */
export const generateWhatsAppMessage = (
  customerName: string,
  productName: string,
  price: number,
  governorate: string,
  quantity: number = 1
): string => {
  const { total, shipping, freeShipping } = calculateOrderTotal(price, quantity, governorate);
  
  const message = `
🌟 *طلب جديد من سندرين بيوتي* 🌟

👤 *الاسم:* ${customerName}
🛍️ *المنتج:* ${productName}
📦 *الكمية:* ${quantity}
📍 *المحافظة:* ${governorate}

💰 *تفاصيل السعر:*
• سعر المنتج: ${formatPrice(price * quantity)}
• رسوم الشحن: ${freeShipping ? 'مجاني 🎉' : formatPrice(shipping)}
• *الإجمالي: ${formatPrice(total)}*

${freeShipping ? '✨ تهانينا! حصلت على شحن مجاني' : ''}

يرجى تأكيد الطلب وإرسال العنوان بالتفصيل 📝
  `.trim();

  return encodeURIComponent(message);
};

/**
 * التحقق من صحة رقم الهاتف المصري
 */
export const validateEgyptianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s+/g, '');
  return /^(01)[0-9]{9}$/.test(cleanPhone);
};

/**
 * تنظيف رقم الهاتف
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '').replace(/^20/, '');
};

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * إنشاء معرف فريد قصير
 */
export const generateShortId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * تحويل النص إلى slug للروابط
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, '') // إزالة الأحرف العربية
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * حساب النسبة المئوية
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * تقريب الأرقام للعرض
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}م`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}ك`;
  }
  return num.toString();
};

/**
 * تحويل البايتات إلى حجم قابل للقراءة
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت';
  
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * التحقق من صحة URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * استخراج اسم الملف من URL
 */
export const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * تأخير تنفيذ العملية (للاختبار)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * تحويل التاريخ إلى نص نسبي
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  
  return formatDate(targetDate);
};

/**
 * تحسين النصوص للبحث
 */
export const optimizeSearchText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // توحيد المسافات
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, ''); // الاحتفاظ بالعربية والإنجليزية والأرقام فقط
};

/**
 * تجميع البيانات حسب المفتاح
 */
export const groupBy = <T, K extends keyof T>(
  array: T[], 
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * ترتيب المصفوفة حسب عدة معايير
 */
export const multiSort = <T>(
  array: T[],
  sortKeys: Array<{ key: keyof T; direction: 'asc' | 'desc' }>
): T[] => {
  return [...array].sort((a, b) => {
    for (const { key, direction } of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * تحسين الصور - ضغط وتحسين الجودة
 */
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}): string => {
  // في المستقبل يمكن تكامل مع خدمة ضغط الصور مثل Cloudinary
  // حالياً نعيد الرابط الأصلي
  return url;
};

/**
 * تحويل الكائن إلى query string
 */
export const objectToQueryString = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
};

/**
 * استخراج المعاملات من URL
 */
export const getUrlParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

/**
 * تحسين النص للعرض
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * تحويل الأرقام الإنجليزية إلى عربية
 */
export const toArabicNumbers = (text: string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/[0-9]/g, (match) => arabicNumbers[parseInt(match)]);
};

/**
 * تحويل الأرقام العربية إلى إنجليزية
 */
export const toEnglishNumbers = (text: string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = text;
  
  arabicNumbers.forEach((arabicNum, index) => {
    result = result.replace(new RegExp(arabicNum, 'g'), index.toString());
  });
  
  return result;
};

/**
 * دالة retry للعمليات الفاشلة
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // انتظار قبل المحاولة التالية
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

/**
 * تحسين البحث في المصفوفات الكبيرة
 */
export const optimizedSearch = performanceMonitor.measureTime(<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return items;
  
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return items.filter(item => 
    searchFields.some(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(normalizedSearch);
      }
      if (typeof fieldValue === 'number') {
        return fieldValue.toString().includes(normalizedSearch);
      }
      return false;
    })
  );
}, 'optimizedSearch');

/**
 * تحسين التصفية للمصفوفات الكبيرة
 */
export const optimizedFilter = performanceMonitor.measureTime(<T>(
  items: T[],
  filters: Record<string, any>
): T[] => {
  if (Object.keys(filters).length === 0) return items;
  
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      
      const itemValue = (item as any)[key];
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      return itemValue === value;
    });
  });
}, 'optimizedFilter');

/**
 * تحسين الترتيب للمصفوفات الكبيرة
 */
export const optimizedSort = performanceMonitor.measureTime(<T>(
  items: T[],
  sortKey: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}, 'optimizedSort');

/**
 * دالة للتحقق من صحة الصورة
 */
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
  } catch {
    return false;
  }
};

/**
 * ضغط النص للتخزين
 */
export const compressText = (text: string): string => {
  // إزالة المسافات الزائدة والأسطر الفارغة
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

/**
 * تحويل البيانات إلى CSV
 */
export const convertToCSV = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // تنظيف القيم وإضافة علامات اقتباس إذا لزم الأمر
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * تحسين الكائنات للتخزين
 */
export const optimizeForStorage = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(optimizeForStorage).filter(Boolean);
  }
  
  if (typeof obj === 'object') {
    const optimized: any = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        optimized[key] = optimizeForStorage(value);
      }
    });
    
    return optimized;
  }
  
  return obj;
};

/**
 * دالة للتحقق من الأداء
 */
export const measurePerformance = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  const result = await operation();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
  
  return { result, duration };
};