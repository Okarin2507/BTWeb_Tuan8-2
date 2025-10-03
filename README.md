# Dự án Spring Boot & GraphQL - Quản lý Sản phẩm
* Đây là một ứng dụng web đầy đủ được xây dựng bằng Spring Boot, sử dụng GraphQL làm API để quản lý các sản phẩm, danh mục và người dùng. Ứng dụng triển khai các tính năng hiện đại như phân quyền, phân trang, và validation.
# Tính năng chính
* API GraphQL: Cung cấp API mạnh mẽ để thực hiện các thao tác CRUD (Tạo, Đọc, Cập nhật, Xóa).
  * Quản lý Dữ liệu:
  * Quản lý Sản phẩm (Thêm, xóa, sửa).
  * Quản lý Danh mục.
  * Quản lý Người dùng.
* Xác thực & Phân quyền:
  * Hệ thống đăng nhập, đăng xuất dựa trên HttpSession.
  * Phân quyền người dùng (USER) và quản trị viên (ADMIN) bằng Spring MVC Interceptor.
  * ADMIN có trang quản lý riêng, USER chỉ có thể xem sản phẩm.
  * Phân trang: Dữ liệu sản phẩm được phân trang ở cả phía backend và frontend để tối ưu hiệu suất.
  * Validation: Dữ liệu đầu vào được kiểm tra tính hợp lệ bằng jakarta.validation.
* Giao diện người dùng: Xây dựng bằng Thymeleaf và Bootstrap 5, giao diện thân thiện và đáp ứng.
#Hướng dẫn cài đặt
```SQL
-- Tạo bảng users
CREATE TABLE users (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    fullname NVARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

-- Tạo bảng categories
CREATE TABLE categories (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    images VARCHAR(255)
);

-- Tạo bảng products
CREATE TABLE products (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    description NTEXT,
    price FLOAT NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tạo bảng trung gian product_category
CREATE TABLE product_category (
    product_id BIGINT,
    category_id BIGINT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```
* Tạo tài khoản ADMIN: Sau khi tạo bảng, hãy chạy lệnh sau để tạo một tài khoản và cấp quyền ADMIN cho tài khoản đó.
```SQL
-- Tạo một user mới (mật khẩu là 'admin123')
INSERT INTO users (fullname, email, password, role) 
VALUES ('Admin User', 'admin@example.com', 'admin123', 'ADMIN');

-- Tạo một user thường để thử nghiệm (mật khẩu là 'user123')
INSERT INTO users (fullname, email, password, role) 
VALUES ('Normal User', 'user@example.com', 'user123', 'USER');
```
* Cấu hình kết nối Database:
```code
Properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=graphql_db;encrypt=true;trustServerCertificate=true;
spring.datasource.username=sa
spring.datasource.password=123
```
# Cách sử dụng
* Trang chính: Mở trình duyệt và truy cập http://localhost:8080
* Trang Admin: http://localhost:8080/admin
* Trang User: http://localhost:8080/
* GraphQL Endpoint: http://localhost:8080/graphql (Dùng cho các công cụ như Postman).
* GraphiQL UI: http://localhost:8080/graphiql (Giao diện để test các query GraphQL).
