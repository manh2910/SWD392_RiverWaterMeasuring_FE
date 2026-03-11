# 🌊 River Water Measuring Admin Dashboard

Một ứng dụng admin dashboard hiện đại để quản lý các trạm đo nước sông, cảm biến, tham số quan trắc và dữ liệu đo lường thời gian thực.

## 📋 Tính Năng

### Dashboard
- 📊 Thống kê tổng hợp (Trạm hoạt động, Cảm biến hoạt động, Cảnh báo tích cực)
- 📈 Biểu đồ dữ liệu packages hàng ngày
- 🚨 Bảng cảnh báo và thông báo gần đây
- 📍 Hoạt động trạm trong 24 giờ

### Quản Lý Dữ Liệu
- **Rivers (Sông)**: Quản lý các dòng sông, mã sông, độ dài, khu vực
- **Stations (Trạm)**: Quản lý trạm đo, vị trí, con sông, số cảm biến
- **Hubs (Trung tâm)**: Quản lý các trung tâm hub, vị trí, thiết bị
- **Sensors (Cảm biến)**: Quản lý cảm biến, loại, vị trí, trạng thái
- **Parameters (Tham số)**: Quản lý các tham số quan trắc (pH, độ mặn, nhiệt độ...)
- **Observations (Quan trắc)**: Xem lịch sử dữ liệu quan trắc
- **Data Packages (Gói dữ liệu)**: Quản lý các gói dữ liệu nhận được

### Giao Diện
- 🎨 Thiết kế hiện đại với Ant Design
- 💬 Hỗ trợ theme sáng/tối (chuẩn bị)
- 📱 Responsive design - hoạt động tốt trên mobile, tablet, desktop
- ⚡ Hiệu suất cao với Vite

## 🚀 Cài Đặt & Chạy

### Yêu Cầu
- Node.js 16+ 
- npm hoặc yarn

### Hướng Dẫn Cài Đặt

1. **Clone hoặc mở project**
```bash
cd C:\Users\ngthe\SWD392_RiverWaterMeasuring_FE
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy development server**
```bash
npm run dev
```

4. **Mở trình duyệt**
```
http://localhost:5174 (hoặc port khác nếu 5174 đã dùng)
```

### Lệnh Khác
```bash
# Build production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## 📁 Cấu Trúc Project

```
src/
├── components/
│   └── Admin/
│       ├── AdminHeader/        # Header của admin
│       ├── Sidebar/            # Navigation sidebar
│       └── DataTable/          # Reusable data table component
├── layouts/
│   └── AdminLayout.jsx         # Main admin layout
├── pages/
│   ├── Dashboard/              # Trang Dashboard
│   ├── Rivers/                 # Quản lý Sông
│   ├── Stations/               # Quản lý Trạm
│   ├── Hubs/                   # Quản lý Hub
│   ├── Sensors/                # Quản lý Cảm biến
│   ├── Parameters/             # Quản lý Tham số
│   ├── Observations/           # Xem Quan trắc
│   └── DataPackages/           # Quản lý Gói dữ liệu
├── App.jsx                     # Routes chính
└── main.jsx                    # Entry point
```

## 🎯 Hướng Dẫn Sử Dụng

### Điều Hướng
- Sử dụng **Sidebar** ở bên trái để điều hướng đến các trang khác nhau
- Click vào logo **🌊 WaterMonitor** để về Dashboard

### Quản Lý Dữ Liệu
Mỗi trang quản lý dữ liệu hỗ trợ:
- ➕ **Thêm mới**: Click nút "Add New" (Thêm Mới)
- ✏️ **Chỉnh sửa**: Click icon edit trong bảng để chỉnh sửa
- 🗑️ **Xóa**: Click icon delete để xóa (cần xác nhận)
- 📊 **Phân trang**: Chuyển trang sử dụng pagination controls

### Dashboard
- Xem tổng số trạm, cảm biến, cảnh báo hoạt động
- Xem cảnh báo gần đây với độ ưu tiên (Critical, High, Medium, Low)
- Theo dõi hoạt động trạm trong 24 giờ qua

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **UI Library**: Ant Design (antd) 6
- **Routing**: React Router 7
- **Icons**: Ant Design Icons, React Icons
- **CSS**: CSS3 + CSS Variables (theme support)
- **Language**: JavaScript (ES6+)

## 📱 Tính Năng Responsive

- ✅ Desktop (1200px+): Full layout với sidebar đầy đủ
- ✅ Tablet (768px - 1200px): Sidebar có thể collapse
- ✅ Mobile (< 768px): Optimized cho điện thoại

## 🔐 Bảo Mật (Chuẩn bị)

Các tính năng bảo mật sẽ được thêm vào:
- Authentication (đăng nhập)
- Authorization (phân quyền)
- Input validation
- CSRF protection

## 📊 CSS Variables (Theme)

Các CSS variables cho phép tùy chỉnh theme dễ dàng:
```css
--bg-main: Màu nền chính
--bg-card: Màu nền card
--text-main: Màu text chính
--text-muted: Màu text mờ
--border-color: Màu border
```

## 🐛 Troubleshooting

### Port 5173 đã dùng
```bash
npm run dev -- --port 5174
```

### Module not found
```bash
npm install
npm run dev
```

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Ghi Chú

- Dữ liệu hiện tại là mock data (dữ liệu giả)
- Sẵn sàng để kết nối với backend API
- Hỗ trợ thêm theme tối (dark mode)

## 🤝 Đóng Góp

Nếu có bất kỳ vấn đề hoặc gợi ý, vui lòng liên hệ.

## 📄 License

MIT License - Sử dụng tự do

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: Feb 4, 2026
