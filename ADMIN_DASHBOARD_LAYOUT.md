# لوحة تحكم إدارة المستخدمين - Admin Dashboard Layout

## 🎯 **نظرة عامة على لوحة التحكم**

لوحة تحكم شاملة لإدارة المستخدمين مع واجهة عربية وسهلة الاستخدام.

---

## 📱 **هيكل الصفحة الرئيسية**

### الهيدر (Header)

```html
<header class="admin-header">
  <div class="header-left">
    <h1>إدارة المستخدمين</h1>
    <span class="breadcrumb">لوحة التحكم > المستخدمون</span>
  </div>
  <div class="header-right">
    <div class="user-info">
      <span>مرحباً، المدير</span>
      <img src="admin-avatar.jpg" alt="Admin Avatar" class="avatar" />
    </div>
    <button class="logout-btn">تسجيل الخروج</button>
  </div>
</header>
```

### الشريط الجانبي (Sidebar Navigation)

```html
<nav class="admin-sidebar">
  <div class="sidebar-header">
    <img src="logo.png" alt="Logo" class="logo" />
    <h2>لوحة الإدارة</h2>
  </div>

  <ul class="sidebar-menu">
    <li class="menu-item active">
      <i class="icon-dashboard"></i>
      <span>لوحة التحكم</span>
    </li>
    <li class="menu-item">
      <i class="icon-users"></i>
      <span>إدارة المستخدمين</span>
    </li>
    <li class="menu-item">
      <i class="icon-products"></i>
      <span>إدارة المنتجات</span>
    </li>
    <li class="menu-item">
      <i class="icon-orders"></i>
      <span>إدارة الطلبات</span>
    </li>
    <li class="menu-item">
      <i class="icon-reviews"></i>
      <span>إدارة التقييمات</span>
    </li>
    <li class="menu-item">
      <i class="icon-coupons"></i>
      <span>إدارة الكوبونات</span>
    </li>
    <li class="menu-item">
      <i class="icon-settings"></i>
      <span>الإعدادات</span>
    </li>
  </ul>
</nav>
```

---

## 📊 **إحصائيات لوحة التحكم**

### بطاقات الإحصائيات

```html
<div class="stats-grid">
  <div class="stat-card total-users">
    <div class="stat-icon">
      <i class="icon-users"></i>
    </div>
    <div class="stat-content">
      <h3 id="totalUsers">150</h3>
      <p>إجمالي المستخدمين</p>
      <span class="stat-change positive">+12%</span>
    </div>
  </div>

  <div class="stat-card active-users">
    <div class="stat-icon">
      <i class="icon-user-check"></i>
    </div>
    <div class="stat-content">
      <h3 id="activeUsers">120</h3>
      <p>المستخدمون النشطون</p>
      <span class="stat-change positive">+8%</span>
    </div>
  </div>

  <div class="stat-card verified-users">
    <div class="stat-icon">
      <i class="icon-shield-check"></i>
    </div>
    <div class="stat-content">
      <h3 id="verifiedUsers">100</h3>
      <p>المستخدمون المُتحققون</p>
      <span class="stat-change positive">+15%</span>
    </div>
  </div>

  <div class="stat-card blocked-users">
    <div class="stat-icon">
      <i class="icon-user-x"></i>
    </div>
    <div class="stat-content">
      <h3 id="blockedUsers">30</h3>
      <p>المستخدمون المحظورون</p>
      <span class="stat-change negative">+5%</span>
    </div>
  </div>
</div>
```

---

## 🔍 **فلاتر البحث والبحث**

### شريط البحث والفلاتر

```html
<div class="filters-section">
  <div class="search-box">
    <input
      type="text"
      id="searchInput"
      placeholder="البحث بالاسم أو البريد الإلكتروني..."
    />
    <button class="search-btn">
      <i class="icon-search"></i>
    </button>
  </div>

  <div class="filter-buttons">
    <button class="filter-btn active" data-filter="all">الكل</button>
    <button class="filter-btn" data-filter="active">نشط</button>
    <button class="filter-btn" data-filter="inactive">غير نشط</button>
    <button class="filter-btn" data-filter="verified">مُتحقق</button>
    <button class="filter-btn" data-filter="unverified">غير متحقق</button>
  </div>

  <div class="advanced-filters">
    <select id="roleFilter">
      <option value="">جميع الأدوار</option>
      <option value="customer">عميل</option>
      <option value="admin">مدير</option>
    </select>

    <input type="date" id="dateFrom" placeholder="من تاريخ" />
    <input type="date" id="dateTo" placeholder="إلى تاريخ" />

    <button class="reset-filters">إعادة تعيين</button>
  </div>
</div>
```

---

## 📋 **جدول قائمة المستخدمين**

### جدول البيانات

```html
<div class="users-table-container">
  <table class="users-table">
    <thead>
      <tr>
        <th>
          <input type="checkbox" id="selectAll" />
          <label for="selectAll">تحديد الكل</label>
        </th>
        <th>الاسم</th>
        <th>البريد الإلكتروني</th>
        <th>الهاتف</th>
        <th>الدور</th>
        <th>الحالة</th>
        <th>تاريخ التسجيل</th>
        <th>الإجراءات</th>
      </tr>
    </thead>
    <tbody id="usersTableBody">
      <!-- User rows will be populated here -->
    </tbody>
  </table>
</div>
```

### صف المستخدم (User Row Template)

```html
<tr class="user-row" data-user-id="123e4567-e89b-12d3-a456-426614174000">
  <td>
    <input
      type="checkbox"
      class="user-checkbox"
      value="123e4567-e89b-12d3-a456-426614174000"
    />
  </td>
  <td>
    <div class="user-info">
      <img src="user-avatar.jpg" alt="User Avatar" class="user-avatar" />
      <div class="user-details">
        <span class="user-name">أحمد محمد</span>
        <span class="user-email">ahmed@example.com</span>
      </div>
    </div>
  </td>
  <td>+966501234567</td>
  <td>
    <span class="role-badge customer">عميل</span>
  </td>
  <td>
    <div class="status-badges">
      <span class="status-badge active">نشط</span>
      <span class="status-badge verified">مُتحقق</span>
    </div>
  </td>
  <td>2024-01-15</td>
  <td>
    <div class="action-buttons">
      <button class="action-btn view-btn" title="عرض">
        <i class="icon-eye"></i>
      </button>
      <button class="action-btn edit-btn" title="تعديل">
        <i class="icon-edit"></i>
      </button>
      <button class="action-btn verify-btn" title="تحقق">
        <i class="icon-shield-check"></i>
      </button>
      <button class="action-btn block-btn" title="حظر">
        <i class="icon-user-x"></i>
      </button>
      <button class="action-btn delete-btn" title="حذف">
        <i class="icon-trash"></i>
      </button>
    </div>
  </td>
</tr>
```

---

## 📄 **التصفح (Pagination)**

```html
<div class="pagination">
  <button class="page-btn prev-btn" disabled>
    <i class="icon-chevron-left"></i>
    السابق
  </button>

  <div class="page-numbers">
    <button class="page-number active">1</button>
    <button class="page-number">2</button>
    <button class="page-number">3</button>
    <span class="page-dots">...</span>
    <button class="page-number">10</button>
  </div>

  <button class="page-btn next-btn">
    التالي
    <i class="icon-chevron-right"></i>
  </button>

  <div class="page-info">
    <span>عرض 1-10 من 150 مستخدم</span>
  </div>
</div>
```

---

## 🔧 **نوافذ منبثقة (Modals)**

### نافذة تفاصيل المستخدم

```html
<div class="modal user-details-modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>تفاصيل المستخدم</h3>
      <button class="close-modal">&times;</button>
    </div>

    <div class="modal-body">
      <div class="user-profile">
        <img src="user-avatar.jpg" alt="User Avatar" class="profile-avatar" />
        <div class="profile-info">
          <h4>أحمد محمد</h4>
          <p>ahmed@example.com</p>
          <span class="role-badge">عميل</span>
        </div>
      </div>

      <div class="user-details-grid">
        <div class="detail-item">
          <label>رقم الهاتف:</label>
          <span>+966501234567</span>
        </div>
        <div class="detail-item">
          <label>العنوان:</label>
          <span>الرياض، المملكة العربية السعودية</span>
        </div>
        <div class="detail-item">
          <label>تاريخ التسجيل:</label>
          <span>2024-01-15</span>
        </div>
        <div class="detail-item">
          <label>آخر نشاط:</label>
          <span>2024-01-20</span>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary close-modal">إغلاق</button>
      <button class="btn-primary edit-user">تعديل</button>
    </div>
  </div>
</div>
```

### نافذة تأكيد الإجراء

```html
<div class="modal confirmation-modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>تأكيد الإجراء</h3>
    </div>

    <div class="modal-body">
      <div class="confirmation-icon">
        <i class="icon-alert-triangle"></i>
      </div>
      <p>هل أنت متأكد من أنك تريد حظر هذا المستخدم؟</p>
      <p class="confirmation-details">
        سيتم منع المستخدم من تسجيل الدخول إلى النظام
      </p>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary cancel-action">إلغاء</button>
      <button class="btn-danger confirm-action">تأكيد الحظر</button>
    </div>
  </div>
</div>
```

---

## 🎨 **التصميم والألوان**

### نظام الألوان

```css
:root {
  /* الألوان الأساسية */
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --light-color: #ecf0f1;
  --dark-color: #2c3e50;

  /* ألوان الحالة */
  --active-color: #27ae60;
  --inactive-color: #95a5a6;
  --verified-color: #3498db;
  --blocked-color: #e74c3c;

  /* ألوان الخلفية */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;

  /* ألوان النص */
  --text-primary: #2c3e50;
  --text-secondary: #6c757d;
  --text-light: #ffffff;
}
```

### الخطوط والأحجام

```css
/* الخط العربي */
font-family: 'Cairo', 'Amiri', 'Tajawal', sans-serif;

/* أحجام الخطوط */
--font-size-xs: 0.75rem; /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
```

---

## 📱 **التصميم المتجاوب**

### نقاط التحول (Breakpoints)

```css
/* الهاتف */
@media (max-width: 576px) {
  .admin-sidebar {
    display: none;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .users-table {
    font-size: 0.875rem;
  }
}

/* التابلت */
@media (min-width: 576px) and (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .filters-section {
    flex-direction: column;
  }
}

/* سطح المكتب */
@media (min-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .admin-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
}
```

---

## ⚡ **JavaScript للتفاعل**

### تحميل البيانات

```javascript
// تحميل إحصائيات المستخدمين
async function loadUserStats() {
  try {
    const response = await fetch('/api/users/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stats = await response.json();

    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    document.getElementById('verifiedUsers').textContent = stats.verifiedUsers;
    document.getElementById('blockedUsers').textContent = stats.inactiveUsers;
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
}

// تحميل قائمة المستخدمين
async function loadUsers(page = 1, filters = {}) {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      ...filters,
    });

    const response = await fetch(`/api/users/admin/all?${queryParams}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await response.json();

    renderUsersTable(data.data);
    renderPagination(data);
  } catch (error) {
    console.error('Error loading users:', error);
  }
}
```

### إجراءات المستخدمين

```javascript
// التحقق من المستخدم
async function verifyUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}/verify`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isVerified: true }),
    });

    if (response.ok) {
      showSuccessMessage('تم التحقق من المستخدم بنجاح');
      loadUsers(currentPage, currentFilters);
    }
  } catch (error) {
    showErrorMessage('حدث خطأ في التحقق من المستخدم');
  }
}

// حظر/تفعيل المستخدم
async function toggleUserStatus(userId, isActive) {
  try {
    const response = await fetch(`/api/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    if (response.ok) {
      const action = isActive ? 'تفعيل' : 'حظر';
      showSuccessMessage(`تم ${action} المستخدم بنجاح`);
      loadUsers(currentPage, currentFilters);
    }
  } catch (error) {
    showErrorMessage('حدث خطأ في تغيير حالة المستخدم');
  }
}
```

---

## 🚀 **المكونات الإضافية**

### إشعارات النجاح/الخطأ

```html
<div class="notification success-notification">
  <i class="icon-check-circle"></i>
  <span>تم حفظ التغييرات بنجاح</span>
  <button class="close-notification">&times;</button>
</div>

<div class="notification error-notification">
  <i class="icon-x-circle"></i>
  <span>حدث خطأ في حفظ البيانات</span>
  <button class="close-notification">&times;</button>
</div>
```

### مؤشر التحميل

```html
<div class="loading-spinner">
  <div class="spinner"></div>
  <span>جاري التحميل...</span>
</div>
```

### قائمة الإجراءات السريعة

```html
<div class="quick-actions">
  <button class="quick-action-btn" onclick="exportUsers()">
    <i class="icon-download"></i>
    تصدير البيانات
  </button>
  <button class="quick-action-btn" onclick="showBulkActions()">
    <i class="icon-users"></i>
    إجراءات مجمعة
  </button>
  <button class="quick-action-btn" onclick="showAdvancedSearch()">
    <i class="icon-search"></i>
    بحث متقدم
  </button>
</div>
```

---

هذا التصميم يوفر واجهة شاملة وسهلة الاستخدام لإدارة المستخدمين مع دعم كامل للغة العربية والتصميم المتجاوب.
