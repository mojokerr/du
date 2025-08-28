
# دليل المساهمة - Contributing Guide

مرحباً بك في مشروع سندرين بيوتي! نحن نرحب بمساهماتك لتطوير هذا المشروع وجعله أفضل. 🎉

## 🤝 كيفية المساهمة

### 1. إعداد البيئة المحلية

```bash
# استنساخ المشروع
git clone <repository-url>
cd sandreen-beauty

# تثبيت الحزم
npm install

# إعداد متغيرات البيئة
cp .env.example .env
# قم بتعديل .env بالقيم الصحيحة

# تشغيل المشروع
npm run dev
```

### 2. معايير الكود

#### TypeScript:
- استخدم TypeScript في جميع الملفات
- حدد الأنواع بوضوح وتجنب `any`
- استخدم interfaces للكائنات المعقدة

```typescript
// ✅ جيد
interface Product {
  id: string;
  name: string;
  price: number;
}

// ❌ سيء
const product: any = { ... };
```

#### React Components:
- استخدم Functional Components مع Hooks
- اتبع naming convention بـ PascalCase
- قم بإنشاء ملف منفصل لكل component

```typescript
// ✅ جيد
const ProductCard = ({ product }: ProductCardProps) => {
  return <div>...</div>;
};

export default ProductCard;
```

#### CSS/Styling:
- استخدم Tailwind CSS حصرياً
- تجنب inline styles
- استخدم المتغيرات من tailwind.config.ts

```tsx
// ✅ جيد
<div className="bg-primary text-white p-4 rounded-lg">

// ❌ سيء
<div style={{ backgroundColor: '#3B82F6', color: 'white' }}>
```

### 3. هيكل المجلدات

```
src/
├── components/
│   ├── ui/           # مكونات أساسية قابلة للإعادة
│   ├── admin/        # مكونات لوحة التحكم
│   └── landing/      # مكونات الصفحة الرئيسية
├── hooks/            # Custom React Hooks
├── pages/            # صفحات التطبيق
├── lib/              # أدوات مساعدة
└── integrations/     # تكاملات خارجية
```

### 4. معايير Git

#### Commit Messages:
استخدم الصيغة التالية:

```
type(scope): description

feat(landing): إضافة قسم الشهادات
fix(admin): إصلاح خطأ في تحديث المنتجات  
docs(readme): تحديث دليل التثبيت
style(ui): تحسين تصميم الأزرار
refactor(hooks): إعادة هيكلة useOrders hook
```

#### Branch Naming:
```bash
# للميزات الجديدة
feat/product-gallery
feat/order-management

# للإصلاحات
fix/form-validation
fix/image-upload

# للتوثيق
docs/api-documentation
docs/deployment-guide
```

### 5. قواعد Pull Request

#### قبل إرسال PR:
```bash
# تأكد من عمل التطبيق
npm run dev

# فحص الكود
npm run lint

# إصلاح المشاكل
npm run lint:fix

# بناء المشروع
npm run build
```

#### وصف PR:
```markdown
## 📋 الوصف
وصف مختصر للتغييرات المطلوبة

## 🎯 نوع التغيير
- [ ] إصلاح خطأ (bug fix)
- [ ] ميزة جديدة (new feature)  
- [ ] تحسين الأداء (performance)
- [ ] توثيق (documentation)

## 🧪 الاختبارات
- [ ] تم اختبار التغييرات محلياً
- [ ] تم التأكد من عدم كسر الوظائف الموجودة
- [ ] تم اختبار الاستجابة على الشاشات المختلفة

## 📱 لقطات الشاشة (إن وجدت)
إرفاق صور للتغييرات إذا كانت تتعلق بالواجهة
```

## 🧪 اختبار الكود

### اختبارات يدوية:
1. **اختبار الواجهات:**
   - تأكد من عمل جميع الأزرار
   - اختبر النماذج والتحقق من البيانات
   - تأكد من الاستجابة على الشاشات المختلفة

2. **اختبار الوظائف:**
   - إضافة/تعديل المنتجات
   - إرسال الطلبات
   - عرض الإحصائيات

3. **اختبار الأداء:**
   - سرعة تحميل الصفحات
   - استجابة الواجهة
   - استهلاك الذاكرة

### Browser Testing:
```bash
# المتصفحات المطلوب اختبارها:
- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)
```

## 🐛 الإبلاغ عن الأخطاء

### قالب Bug Report:
```markdown
## 🐛 وصف المشكلة
وصف واضح ومختصر للمشكلة

## 🔄 خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. اضغط على '...'
3. املأ النموذج '...'
4. شاهد الخطأ

## 📋 السلوك المتوقع
وصف ما كان يجب أن يحدث

## 📱 البيئة
- المتصفح: [Chrome/Firefox/Safari]
- نظام التشغيل: [Windows/Mac/Linux]
- حجم الشاشة: [Desktop/Mobile/Tablet]

## 📷 لقطات الشاشة
إرفاق صور للمشكلة إن أمكن
```

## 💡 اقتراح ميزة جديدة

### قالب Feature Request:
```markdown
## 🎯 وصف الميزة المطلوبة
وصف واضح للميزة المقترحة

## 🤔 المشكلة المراد حلها
ما هي المشكلة التي ستحلها هذه الميزة؟

## 💭 الحلول البديلة
هل فكرت في حلول أخرى؟

## 📋 التفاصيل الإضافية
أي معلومات إضافية مفيدة
```

## 🏆 أفضل الممارسات

### Performance:
```typescript
// ✅ استخدم useMemo للعمليات المكلفة
const expensiveValue = useMemo(() => {
  return products.filter(p => p.isActive);
}, [products]);

// ✅ استخدم lazy loading للصور
<img loading="lazy" src={imageUrl} alt="product" />

// ✅ استخدم React.memo للمكونات
export default memo(ProductCard);
```

### Accessibility:
```tsx
// ✅ استخدم الـ aria labels
<button aria-label="إغلاق النافذة">
  <X className="w-4 h-4" />
</button>

// ✅ استخدم semantic HTML
<main>
  <section>
    <h2>المنتجات</h2>
  </section>
</main>
```

### Security:
```typescript
// ✅ تحقق من صحة البيانات
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// ✅ تنظيف المدخلات
const sanitizedInput = input.trim().toLowerCase();
```

## 📚 الموارد المفيدة

### التوثيق:
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### الأدوات:
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 🎉 شكراً لك!

مساهمتك تعني الكثير لنا! كل إضافة، مهما كانت صغيرة، تساعد في تحسين المشروع وخدمة المستخدمين بشكل أفضل.

### الخطوات التالية:
1. 🍴 Fork المشروع
2. 🌿 أنشئ branch جديد
3. 💻 اكتب الكود
4. 🧪 اختبر التغييرات  
5. 📝 اكتب commit message واضح
6. 🚀 أرسل Pull Request

**مجتمع المطورين العرب يشكرك! 🇸🇦 🇪🇬 🇦🇪**
