/**
 * ثوابت النظام والإعدادات
 */

// المحافظات المصرية
export const GOVERNORATES = [
  'القاهرة',
  'الجيزة', 
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'بني سويف',
  'الفيوم',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'بورسعيد',
  'دمياط',
  'الإسماعيلية',
  'السويس'
] as const;

// حالات الطلبات
export const ORDER_STATUSES = [
  'جديد',
  'قيد التجهيز', 
  'تم الشحن',
  'تم التوصيل',
  'ملغي'
] as const;

// إعدادات الشحن
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 500,
  CAIRO_GIZA_COST: 0, // شحن مجاني للقاهرة والجيزة
  OTHER_GOVERNORATES_COST: 50,
  CAIRO_GIZA_GOVERNORATES: ['القاهرة', 'الجيزة']
} as const;

// إعدادات التطبيق
export const APP_CONFIG = {
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_BENEFITS_PER_PRODUCT: 10,
  MAX_USAGE_STEPS: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CACHE_TTL: {
    PRODUCTS: 3 * 60 * 1000, // 3 دقائق
    ORDERS: 2 * 60 * 1000,   // 2 دقيقة
    SETTINGS: 10 * 60 * 1000, // 10 دقائق
    STATS: 5 * 60 * 1000     // 5 دقائق
  }
} as const;

// إعدادات الأداء
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300, // ms
  THROTTLE_DELAY: 1000, // ms
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  PAGINATION_SIZE: 50,
  VIRTUAL_SCROLL_THRESHOLD: 100
} as const;

// إعدادات Rate Limiting
export const RATE_LIMITS = {
  ORDER_CREATION: {
    maxRequests: 10,
    windowMinutes: 60,
    blockDuration: 30
  },
  SEARCH_QUERIES: {
    maxRequests: 100,
    windowMinutes: 60,
    blockDuration: 10
  },
  ADMIN_OPERATIONS: {
    maxRequests: 200,
    windowMinutes: 60,
    blockDuration: 15
  },
  IMAGE_UPLOAD: {
    maxRequests: 20,
    windowMinutes: 60,
    blockDuration: 60
  }
} as const;

// رسائل النظام
export const SYSTEM_MESSAGES = {
  SUCCESS: {
    ORDER_CREATED: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً',
    PRODUCT_UPDATED: 'تم تحديث المنتج بنجاح',
    DATA_SAVED: 'تم حفظ البيانات بنجاح',
    OPTIMIZATION_COMPLETE: 'تم تحسين قاعدة البيانات بنجاح'
  },
  ERROR: {
    NETWORK_ERROR: 'مشكلة في الاتصال بالإنترنت',
    VALIDATION_ERROR: 'بيانات غير صحيحة',
    SERVER_ERROR: 'خطأ في الخادم',
    RATE_LIMIT_EXCEEDED: 'تم تجاوز الحد المسموح من الطلبات'
  },
  LOADING: {
    FETCHING_DATA: 'جاري تحميل البيانات...',
    SAVING_DATA: 'جاري حفظ البيانات...',
    PROCESSING: 'جاري المعالجة...',
    OPTIMIZING: 'جاري تحسين الأداء...'
  }
} as const;

// إعدادات SEO
export const SEO_CONFIG = {
  SITE_NAME: 'سندرين بيوتي',
  SITE_DESCRIPTION: 'منتجات العناية بالبشرة الطبيعية - كيكه سيروم للعناية المتقدمة',
  KEYWORDS: [
    'عناية بالبشرة',
    'منتجات طبيعية',
    'سيروم',
    'جمال',
    'سندرين بيوتي',
    'كيكه',
    'مستحضرات تجميل'
  ],
  OG_IMAGE: 'https://lovable.dev/opengraph-image-p98pqg.png',
  TWITTER_HANDLE: '@sandreenbeauty'
} as const;

// إعدادات التحليلات
export const ANALYTICS_CONFIG = {
  TRACK_PAGE_VIEWS: true,
  TRACK_USER_INTERACTIONS: true,
  TRACK_PERFORMANCE_METRICS: true,
  TRACK_ERROR_EVENTS: true,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 دقيقة
  BATCH_SIZE: 10 // عدد الأحداث في الدفعة الواحدة
} as const;

// أنواع البيانات المحسنة
export type Governorate = typeof GOVERNORATES[number];
export type OrderStatus = typeof ORDER_STATUSES[number];

// دوال مساعدة للثوابت
export const isValidGovernorate = (gov: string): gov is Governorate => {
  return GOVERNORATES.includes(gov as Governorate);
};

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return ORDER_STATUSES.includes(status as OrderStatus);
};

export const isCairoGiza = (governorate: string): boolean => {
  return SHIPPING_CONFIG.CAIRO_GIZA_GOVERNORATES.includes(governorate);
};

// إعدادات الأمان
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 دقيقة
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 ساعة
  CSRF_TOKEN_LENGTH: 32,
  PASSWORD_MIN_LENGTH: 8,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
} as const;