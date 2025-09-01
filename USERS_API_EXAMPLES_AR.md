# أمثلة API للمستخدمين - لوحة الإدارة

## العنوان الأساسي

```
/api/users
```

## المصادقة

جميع نقاط النهاية الإدارية تتطلب:

```
Authorization: Bearer <admin_jwt_token>
```

---

## 🔍 **الحصول على جميع المستخدمين مع الفلاتر**

### الحصول على جميع المستخدمين الأساسي

```http
GET /api/users/admin/all
```

**الاستجابة:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "أحمد",
      "lastName": "محمد",
      "email": "ahmed.mohamed@example.com",
      "role": "customer",
      "isActive": true,
      "isVerified": true,
      "phoneNumber": "+966501234567",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

### البحث عن المستخدمين بالاسم/البريد الإلكتروني

```http
GET /api/users/admin/all?search=أحمد
```

### التصفية حسب حالة النشاط

```http
GET /api/users/admin/all?isActive=true
```

### التصفية حسب حالة التحقق

```http
GET /api/users/admin/all?isVerified=false
```

### التصفية حسب الدور

```http
GET /api/users/admin/all?role=admin
```

### فلاتر مجمعة مع التصفح

```http
GET /api/users/admin/all?search=أحمد&isActive=true&isVerified=false&page=1&limit=20
```

---

## 👤 **إجراءات إدارة المستخدمين**

### تعيين المستخدم كمُتحقق

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/verify
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "isVerified": true
}
```

**الاستجابة:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed.mohamed@example.com",
  "isVerified": true,
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### حظر حساب المستخدم

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "isActive": false
}
```

**الاستجابة:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed.mohamed@example.com",
  "isActive": false,
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### تفعيل حساب المستخدم

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "isActive": true
}
```

### إعادة إرسال رمز التحقق

```http
POST /api/users/123e4567-e89b-12d3-a456-426614174000/resend-verification
Authorization: Bearer <admin_token>
```

**الاستجابة:**

```json
{
  "message": "تم إرسال رمز التحقق إلى ahmed.mohamed@example.com",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "ahmed.mohamed@example.com",
    "isVerified": false
  }
}
```

---

## 📊 **إحصائيات المستخدمين**

### الحصول على إحصائيات المستخدمين

```http
GET /api/users/stats
Authorization: Bearer <admin_token>
```

**الاستجابة:**

```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "inactiveUsers": 30,
  "verifiedUsers": 100,
  "unverifiedUsers": 50
}
```

---

## 🔧 **عمليات المستخدمين العامة**

### الحصول على مستخدم بالمعرف

```http
GET /api/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <admin_token>
```

**الاستجابة:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed.mohamed@example.com",
  "role": "customer",
  "isActive": true,
  "isVerified": true,
  "phoneNumber": "+966501234567",
  "address": "الرياض، المملكة العربية السعودية",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### تحديث معلومات المستخدم

```http
PATCH /api/users/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "firstName": "الاسم المحدث",
  "lastName": "اللقب المحدث",
  "phoneNumber": "+966509876543"
}
```

### حذف المستخدم (حذف ناعم)

```http
DELETE /api/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <admin_token>
```

### استعادة المستخدم المحذوف

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/restore
Authorization: Bearer <admin_token>
```

---

## ⚠️ **استجابات الأخطاء**

### المستخدم غير موجود

```json
{
  "statusCode": 404,
  "message": "المستخدم بالمعرف 123e4567-e89b-12d3-a456-426614174000 غير موجود",
  "error": "Not Found"
}
```

### الوصول غير مصرح

```json
{
  "statusCode": 401,
  "message": "غير مصرح",
  "error": "Unauthorized"
}
```

### الوصول محظور (ليس مديراً)

```json
{
  "statusCode": 403,
  "message": "مورد محظور",
  "error": "Forbidden"
}
```

### طلب خاطئ (حقل مطلوب مفقود)

```json
{
  "statusCode": 400,
  "message": "حقل isVerified مطلوب",
  "error": "Bad Request"
}
```

### المستخدم متحقق بالفعل

```json
{
  "statusCode": 400,
  "message": "المستخدم بالمعرف 123e4567-e89b-12d3-a456-426614174000 متحقق بالفعل",
  "error": "Bad Request"
}
```

---

## 📝 **ملاحظات مهمة**

### 1. المصادقة

- جميع نقاط النهاية الإدارية تتطلب رمز Bearer في ترويسة Authorization
- يجب أن يكون المستخدم لديه دور admin أو super_admin
- يجب أن يكون الرمز صالحاً وغير منتهي الصلاحية

### 2. التصفح

- الصفحة الافتراضية: 1
- الحد الافتراضي: 10
- الحد الأقصى: 100
- استخدم معاملات page و limit

### 3. البحث والفلاتر

- البحث يعمل على: firstName, lastName, email
- الفلاتر حساسة لحالة الأحرف للمطابقة الدقيقة
- يمكن دمج فلاتر متعددة
- البحث الفارغ يعيد جميع المستخدمين

### 4. إدارة حالة المستخدم

- `isActive: false` = المستخدم محظور/لا يمكنه تسجيل الدخول
- `isVerified: false` = المستخدم يحتاج تحقق البريد الإلكتروني
- يمكن تغيير كليهما بشكل مستقل

### 5. الحذف الناعم

- المستخدمون المحذوفون يتم وضع علامة عليهم كمحذوفين وليس إزالتهم من قاعدة البيانات
- يمكن استعادتهم باستخدام نقطة نهاية الاستعادة
- المستخدمون المحذوفون لن يظهروا في الاستعلامات العادية

---

## 🚀 **أمثلة سريعة للوحة الإدارة**

### الحصول على المستخدمين غير المتحققين الأخيرين

```http
GET /api/users/admin/all?isVerified=false&page=1&limit=10
```

### البحث عن العملاء غير النشطين

```http
GET /api/users/admin/all?search=عميل&isActive=false&role=customer
```

### حظر مستخدمين متعددين (عملية مجمعة)

```javascript
// مثال الواجهة الأمامية
const userIds = ['user1', 'user2', 'user3'];

userIds.forEach(async (userId) => {
  await fetch(`/api/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive: false }),
  });
});
```

### إحصائيات لوحة التحكم

```javascript
// الحصول على الإحصائيات للوحة التحكم
const stats = await fetch('/api/users/stats', {
  headers: { Authorization: `Bearer ${adminToken}` },
});

// الحصول على المستخدمين الأخيرين
const recentUsers = await fetch('/api/users/admin/all?page=1&limit=5', {
  headers: { Authorization: `Bearer ${adminToken}` },
});
```

### سير عمل إدارة المستخدمين

```javascript
// 1. العثور على المستخدم
const users = await fetch('/api/users/admin/all?search=ahmed@example.com');

// 2. التحقق من المستخدم
await fetch(`/api/users/${userId}/verify`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${adminToken}` },
  body: JSON.stringify({ isVerified: true }),
});

// 3. تفعيل المستخدم
await fetch(`/api/users/${userId}/status`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${adminToken}` },
  body: JSON.stringify({ isActive: true }),
});
```
