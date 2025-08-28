
# مشروع سندرين بيوتي - Sandreen Beauty E-Commerce Platform

## 📋 نظرة عامة على المشروع

مشروع سندرين بيوتي هو منصة تجارة إلكترونية متقدمة مصممة خصيصاً لبيع منتجات العناية بالبشرة. المشروع مبني بأحدث التقنيات ويوفر تجربة متميزة للعملاء ولوحة تحكم شاملة للإدارة.

## 🚀 المميزات الرئيسية

### للعملاء:
- **صفحة منتج متفاعلة** - عرض تفصيلي للمنتجات مع معرض صور
- **نموذج طلب متقدم** - تحقق من صحة البيانات والتشفير الآمن
- **واجهة متجاوبة** - تصميم مثالي لجميع الشاشات والأجهزة
- **قسم الشهادات** - عرض تقييمات العملاء وآرائهم
- **الأسئلة الشائعة** - إجابات مفصلة على الاستفسارات الأكثر شيوعاً
- **زر واتساب مباشر** - تواصل فوري مع الدعم

### للإدارة:
- **لوحة تحكم شاملة** - إحصائيات مفصلة ومتابعة المبيعات
- **إدارة الطلبات** - تتبع حالة الطلبات وتحديثها
- **إدارة المنتجات** - رفع الصور وتعديل البيانات
- **تحليلات متقدمة** - رسوم بيانية وإحصائيات تفصيلية
- **نظام تحديث فوري** - تحديث البيانات في الوقت الفعلي

## 🛠️ التقنيات المستخدمة

### Frontend Framework:
- **React 18** - مكتبة JavaScript الحديثة
- **TypeScript** - للكتابة الآمنة والمنظمة
- **Vite** - أداة بناء سريعة ومحسنة

### UI/UX Libraries:
- **Tailwind CSS** - إطار عمل CSS المرن
- **Shadcn/UI** - مكونات واجهة مستخدم متقدمة
- **Lucide React** - مجموعة أيقونات حديثة
- **React Hook Form** - إدارة النماذج بكفاءة
- **Zod** - تحقق من صحة البيانات

### Backend & Database:
- **Supabase** - قاعدة بيانات وخدمات خلفية شاملة
  - PostgreSQL Database
  - Real-time subscriptions
  - Storage للصور
  - Row Level Security (RLS)

### State Management:
- **TanStack Query** - إدارة حالة الخادم والتخزين المؤقت
- **React Hooks** - إدارة الحالة المحلية

### Form Handling:
- **React Hook Form** - إدارة النماذج والتحقق
- **Zod Schema Validation** - تحقق شامل من البيانات

## 📁 هيكل المشروع

```
src/
├── components/
│   ├── ui/                    # مكونات واجهة المستخدم الأساسية
│   ├── admin/                 # مكونات لوحة التحكم
│   │   ├── DashboardStats.tsx
│   │   ├── OrdersTable.tsx
│   │   ├── ProductSettings.tsx
│   │   └── ...
│   └── landing/               # مكونات الصفحة الرئيسية
│       ├── OrderForm.tsx
│       ├── ProductGallery.tsx
│       ├── FeaturesSection.tsx
│       └── ...
├── hooks/                     # Custom React Hooks
│   ├── useProducts.ts
│   ├── useOrders.ts
│   └── useSiteSettings.ts
├── integrations/
│   └── supabase/             # إعدادات قاعدة البيانات
├── pages/                    # الصفحات الرئيسية
│   ├── Landing.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
└── lib/                      # المرافق والأدوات المساعدة
```

## 🗄️ قاعدة البيانات

### الجداول الرئيسية:

#### جدول المنتجات (products)
```sql
- id: UUID (Primary Key)
- name: TEXT (اسم المنتج)
- brand: TEXT (العلامة التجارية)
- price: NUMERIC (السعر)
- description: TEXT (الوصف)
- whatsapp_number: TEXT (رقم الواتساب)
- benefits: TEXT[] (الفوائد)
- usage_instructions: TEXT[] (تعليمات الاستخدام)
- images: TEXT[] (روابط الصور)
- is_active: BOOLEAN (حالة النشاط)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول الطلبات (orders)
```sql
- id: UUID (Primary Key)
- customer_name: TEXT (اسم العميل)
- phone: TEXT (رقم الهاتف)
- address: TEXT (العنوان)
- governorate: TEXT (المحافظة)
- notes: TEXT (ملاحظات)
- total_amount: NUMERIC (المبلغ الإجمالي)
- status: TEXT (حالة الطلب)
- order_date: DATE (تاريخ الطلب)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول إعدادات الموقع (site_settings)
```sql
- id: UUID (Primary Key)
- site_name: TEXT (اسم الموقع)
- support_phone: TEXT (هاتف الدعم)
- support_email: TEXT (بريد الدعم)
- facebook_url: TEXT (رابط فيسبوك)
- instagram_url: TEXT (رابط إنستغرام)
- whatsapp_url: TEXT (رابط واتساب)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔧 التثبيت والتشغيل

### المتطلبات الأساسية:
- Node.js 18+ 
- npm أو yarn
- حساب Supabase

### خطوات التثبيت:

1. **استنساخ المشروع:**
```bash
git clone <repository-url>
cd sandreen-beauty
```

2. **تثبيت الحزم:**
```bash
npm install
# أو
yarn install
```

3. **إعداد متغيرات البيئة:**
```bash
cp .env.example .env
```

4. **تحديث ملف `.env`:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

5. **إعداد قاعدة البيانات:**
   - قم بتشغيل الـ migrations في لوحة تحكم Supabase
   - قم بإعداد Row Level Security policies

6. **تشغيل المشروع:**
```bash
npm run dev
# أو
yarn dev
```

## 🌐 الروابط والصفحات

- **الصفحة الرئيسية:** `/`
- **لوحة التحكم:** `/admin` أو `/ادمن`
- **صفحة 404:** `/404`

## 📱 الاستجابة والتوافق

المشروع مصمم ليكون متجاوباً بالكامل مع:
- **Desktop:** 1920px وما فوق
- **Laptop:** 1024px - 1919px
- **Tablet:** 768px - 1023px
- **Mobile:** 320px - 767px

## 🔐 الأمان

### Row Level Security (RLS):
- جميع الجداول محمية بـ RLS policies
- الوصول للبيانات مقيد حسب المستخدم
- التحقق من الهوية على مستوى قاعدة البيانات

### تحقق البيانات:
- استخدام Zod لتحقق شامل من البيانات
- تشفير آمن للنماذج
- حماية من هجمات XSS و SQL Injection

## 📊 الإحصائيات والتحليلات

لوحة التحكم توفر:
- **إجمالي الطلبات والمبيعات**
- **تحليل الطلبات حسب الحالة**
- **إحصائيات جغرافية حسب المحافظة**
- **معدلات الإتمام والنجاح**
- **رسوم بيانية تفاعلية**

## 🔄 التحديثات الفورية

استخدام Supabase Realtime:
- تحديث الطلبات في الوقت الفعلي
- إشعارات فورية للطلبات الجديدة
- مزامنة تلقائية للبيانات

## 📈 التحسينات المستقبلية

### المرحلة 1 - التحسينات الأساسية:
- [ ] نظام إشعارات متقدم
- [ ] تصدير التقارير (PDF/Excel)
- [ ] نظام النسخ الاحتياطي التلقائي
- [ ] تحسين الأداء والسرعة

### المرحلة 2 - المميزات التسويقية:
- [ ] نظام كوبونات الخصم
- [ ] برنامج الإحالة والمكافآت
- [ ] تتبع مصادر الزيارات
- [ ] نظام التقييمات والمراجعات

### المرحلة 3 - التكاملات الخارجية:
- [ ] تكامل مع شركات الشحن
- [ ] بوابات دفع إلكترونية
- [ ] تكامل مع منصات التواصل الاجتماعي
- [ ] نظام CRM متقدم

## 🆘 الدعم والمساعدة

### للمطورين:
- مراجعة التوثيق في مجلد `/docs`
- فحص ملفات الـ types في `/src/integrations/supabase/types.ts`
- استخدام developer tools في المتصفح

### للمشاكل الشائعة:
- التأكد من صحة متغيرات البيئة
- فحص اتصال قاعدة البيانات
- مراجعة console logs للأخطاء

## 👥 المساهمة

نرحب بالمساهمات! يرجى:
1. إنشاء fork للمشروع
2. إنشاء branch جديد للميزة
3. تطبيق التغييرات مع التوثيق
4. إرسال Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

---

**تم تطوير هذا المشروع بعناية فائقة لتوفير تجربة مميزة في التجارة الإلكترونية** ✨
