import { z } from 'zod';

// تحسين مخططات التحقق من البيانات
export const orderSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل')
    .max(100, 'الاسم طويل جداً')
    .regex(/^[\u0600-\u06FF\s\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z]+$/, 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط'),
  
  phone: z
    .string()
    .regex(/^(01)[0-9]{9}$/, 'رقم الهاتف يجب أن يبدأ بـ 01 ويحتوي على 11 رقم')
    .transform(val => val.replace(/\s+/g, '')), // إزالة المسافات
  
  address: z
    .string()
    .min(10, 'العنوان يجب أن يحتوي على 10 أحرف على الأقل')
    .max(500, 'العنوان طويل جداً'),
  
  governorate: z
    .string()
    .min(1, 'يرجى اختيار المحافظة'),
  
  notes: z
    .string()
    .max(1000, 'الملاحظات طويلة جداً')
    .optional()
    .transform(val => val?.trim() || null)
});

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'اسم المنتج يجب أن يحتوي على حرفين على الأقل')
    .max(200, 'اسم المنتج طويل جداً'),
  
  brand: z
    .string()
    .min(2, 'اسم العلامة التجارية يجب أن يحتوي على حرفين على الأقل')
    .max(100, 'اسم العلامة التجارية طويل جداً'),
  
  price: z
    .number()
    .min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر')
    .max(100000, 'السعر مرتفع جداً'),
  
  description: z
    .string()
    .max(2000, 'الوصف طويل جداً')
    .optional()
    .nullable(),
  
  whatsapp_number: z
    .string()
    .regex(/^(01)[0-9]{9}$/, 'رقم واتساب غير صحيح')
    .optional()
    .nullable(),
  
  benefits: z
    .array(z.string().min(1).max(200))
    .max(10, 'لا يمكن إضافة أكثر من 10 فوائد')
    .default([]),
  
  usage_instructions: z
    .array(z.string().min(1).max(300))
    .max(8, 'لا يمكن إضافة أكثر من 8 خطوات')
    .default([]),
  
  images: z
    .array(z.string().url('رابط الصورة غير صحيح'))
    .max(10, 'لا يمكن إضافة أكثر من 10 صور')
    .default([]),
  
  is_active: z.boolean().default(true)
});

export const siteSettingsSchema = z.object({
  site_name: z
    .string()
    .min(1, 'اسم الموقع مطلوب')
    .max(100, 'اسم الموقع طويل جداً'),
  
  support_phone: z
    .string()
    .regex(/^(01)[0-9]{9}$/, 'رقم الدعم غير صحيح')
    .optional()
    .nullable(),
  
  support_email: z
    .string()
    .email('البريد الإلكتروني غير صحيح')
    .optional()
    .nullable(),
  
  facebook_url: z
    .string()
    .url('رابط فيسبوك غير صحيح')
    .optional()
    .nullable(),
  
  instagram_url: z
    .string()
    .url('رابط إنستغرام غير صحيح')
    .optional()
    .nullable(),
  
  whatsapp_url: z
    .string()
    .url('رابط واتساب غير صحيح')
    .optional()
    .nullable(),
  
  dark_mode_enabled: z.boolean().default(false),
  
  shipping_settings: z.object({
    free_shipping_threshold: z.number().min(0),
    cairo_shipping_cost: z.number().min(0),
    other_governorates_cost: z.number().min(0)
  }).optional(),
  
  notification_settings: z.object({
    email_notifications: z.boolean(),
    sms_notifications: z.boolean(),
    whatsapp_notifications: z.boolean()
  }).optional()
});

// دالة للتحقق من صحة البيانات مع معالجة الأخطاء
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['خطأ غير متوقع في التحقق من البيانات'] };
  }
};

// دالة للتحقق من صحة البيانات بشكل تدريجي
export const validatePartial = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: Partial<T>;
  errors?: Record<string, string[]>;
} => {
  try {
    const validatedData = schema.partial().parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        if (!acc[path]) acc[path] = [];
        acc[path].push(err.message);
        return acc;
      }, {} as Record<string, string[]>);
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['خطأ غير متوقع في التحقق من البيانات'] } };
  }
};

export type OrderFormData = z.infer<typeof orderSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;