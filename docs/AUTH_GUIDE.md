# 🔐 Auth Guide — Hướng Dẫn Sử Dụng Authentication

Tài liệu này dành cho **Dev 2, 3, 5, 6** — hướng dẫn cách sử dụng hệ thống xác thực JWT đã được Dev 1 setup.

---

## 1. Lấy JWT Token (Login)

**Endpoint:** `POST /api/auth/login`

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response thành công (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "EMPLOYEE",
  "fullName": "Nguyen Van A",
  "expiresIn": 28800000
}
```

> Token có hiệu lực **8 tiếng**. Sau đó cần login lại.

---

## 2. Đính Token Vào Request

Tất cả API (trừ `/api/auth/**`) đều yêu cầu token trong header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Ví dụ trong Postman:**
- Tab **Authorization** → Type: **Bearer Token**
- Paste token vào ô Token

**Ví dụ trong code (React/Angular):**
```javascript
const response = await fetch('/api/leave-requests', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 3. Phân Quyền Trong Controller (Backend Dev)

Dùng annotation `@PreAuthorize` để bảo vệ endpoint:

```java
// Chỉ MANAGER mới được gọi
@PreAuthorize("hasRole('MANAGER')")
@GetMapping("/pending")
public ResponseEntity<?> getPendingRequests() { ... }

// Chỉ EMPLOYEE mới được gọi
@PreAuthorize("hasRole('EMPLOYEE')")
@PostMapping
public ResponseEntity<?> createLeaveRequest() { ... }

// Cả hai role đều được gọi — không cần annotation
@GetMapping("/{id}")
public ResponseEntity<?> getById() { ... }
```

---

## 4. Lấy Thông Tin User Đang Login (Backend Dev)

```java
import org.springframework.security.core.context.SecurityContextHolder;

// Lấy email của user đang login
String email = SecurityContextHolder
    .getContext()
    .getAuthentication()
    .getName();

// Sau đó query DB để lấy User object
User currentUser = userRepository.findByEmail(email)
    .orElseThrow(() -> new RuntimeException("User not found"));
```

---

## 5. Test API Với Swagger UI

1. Mở `http://localhost:8080/swagger-ui/index.html`
2. Gọi `POST /api/auth/login` để lấy token
3. Bấm nút **Authorize** (góc phải trên)
4. Paste token vào ô **Value** (không cần gõ "Bearer ")
5. Bấm **Authorize** → từ đây mọi request đều tự đính token

---

## 6. Xử Lý Lỗi Thường Gặp

| HTTP Code | Nguyên nhân | Giải pháp |
|---|---|---|
| 401 Unauthorized | Token không hợp lệ hoặc hết hạn | Login lại để lấy token mới |
| 403 Forbidden | Role không đủ quyền | Kiểm tra role của user trong DB |
| 400 Bad Request | Email/password sai | Kiểm tra thông tin đăng nhập |

---

## 7. Test Nhanh Trong Terminal

```powershell
# Login
$body = '{"email":"test@test.com","password":"password"}'
$headers = @{"Content-Type"="application/json"}
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
  -Method POST -Headers $headers -Body $body -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).accessToken

# Gọi API có auth
$authHeaders = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}
Invoke-WebRequest -Uri "http://localhost:8080/api/leave-balance/me" `
  -Method GET -Headers $authHeaders -UseBasicParsing
```

---

## 8. Lưu Ý Quan Trọng

- **Không hardcode token** trong code — luôn lưu vào biến/state
- **Không commit** file `application.yml` chứa password/secret lên Git
- Nếu gặp lỗi 403 mà chắc chắn token đúng → kiểm tra lại `@PreAuthorize` annotation
- Mọi thắc mắc về Auth → hỏi **Dev 1 (Tài)**

---

*Tài liệu được tạo bởi Dev 1 — Tài*  
*Cập nhật lần cuối: Sprint 1*
