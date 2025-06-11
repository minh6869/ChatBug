# ChatBug - Real-time Chat Application

ChatBug là ứng dụng chat thời gian thực được xây dựng với React.js frontend và Node.js backend, sử dụng Docker để triển khai.

## ✨ Tính năng

- **Authentication**: Đăng ký, đăng nhập, đăng xuất
- **Real-time Chat**: Tin nhắn thời gian thực với Socket.IO
- **Room Management**: Tạo và tham gia các phòng chat public/private
- **Typing Indicators**: Hiển thị khi người dùng đang gõ
- **User Profiles**: Quản lý thông tin cá nhân
- **Modern UI**: Giao diện đẹp và responsive
- **Docker Support**: Triển khai dễ dàng với Docker

## 🛠️ Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Socket.IO Client
- Styled Components
- Axios
- React Hot Toast
- React Icons
- Date-fns

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB với Mongoose
- JWT Authentication
- bcryptjs
- Joi validation
- Helmet (Security)
- Rate limiting

### Database
- MongoDB

### DevOps
- Docker
- Docker Compose

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Docker và Docker Compose
- Node.js 18+ (nếu chạy local)
- MongoDB (nếu chạy local)

### Chạy với Docker (Khuyến nghị)

1. Clone repository:
```bash
git clone https://github.com/minh6869/ChatBug.git
cd ChatBug
```

2. Chạy ứng dụng:
```bash
docker-compose up -d
```

3. **Khởi tạo dữ liệu mẫu (Tùy chọn):**
```bash
# Chạy script khởi tạo MongoDB với dữ liệu mẫu
docker exec -it chatbug-mongodb mongosh /docker-entrypoint-initdb.d/init-mongo.js
```

4. Truy cập ứng dụng:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### 🔧 Khởi tạo Database

Ứng dụng cung cấp 2 file khởi tạo database:

#### MongoDB (Hiện tại)
- **File:** `init-mongo.js`
- **Mục đích:** Tạo collections, indexes, và dữ liệu mẫu
- **Chạy:** `docker exec -it chatbug-mongodb mongosh /docker-entrypoint-initdb.d/init-mongo.js`

#### SQL (Tương lai)  
- **File:** `init.sql`
- **Mục đích:** Cấu trúc SQL tương đương nếu muốn chuyển sang SQL database
- **Hỗ trợ:** MySQL, PostgreSQL, SQL Server

#### Dữ liệu mẫu bao gồm:
- **3 users** với tài khoản test
- **4 rooms** (General, Random, Tech Talk, Private Room)  
- **6 messages** mẫu
- **Indexes** để tối ưu performance

#### Tài khoản test:
```
Email: admin@chatbug.com | Password: password123
Email: john@example.com | Password: password123
Email: jane@example.com | Password: password123
```

### Chạy Local (Development)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 📁 Cấu trúc Project

```
ChatBug/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── user.js
│   └── socket/
│       └── socketHandlers.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── contexts/
│       │   ├── AuthContext.js
│       │   └── SocketContext.js
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   └── ChatPage.js
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button.js
│       │   │   ├── Input.js
│       │   │   └── LoadingSpinner.js
│       │   └── chat/
│       │       ├── Sidebar.js
│       │       ├── ChatArea.js
│       │       ├── MessageList.js
│       │       ├── TypingIndicator.js
│       │       ├── CreateRoomModal.js
│       │       └── UserProfile.js
│       └── index.css
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:chatbug123@mongodb:27017/chatbug?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Chat
- `GET /api/chat/rooms` - Lấy danh sách phòng
- `POST /api/chat/rooms` - Tạo phòng mới
- `POST /api/chat/rooms/:roomId/join` - Tham gia phòng
- `GET /api/chat/rooms/:roomId/messages` - Lấy tin nhắn
- `POST /api/chat/rooms/:roomId/messages` - Gửi tin nhắn

### Users
- `GET /api/users` - Tìm kiếm users
- `GET /api/users/:userId` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile

## 🔌 Socket Events

### Client to Server
- `join-room` - Tham gia phòng
- `leave-room` - Rời phòng
- `send-message` - Gửi tin nhắn
- `typing` - Bắt đầu gõ
- `stop-typing` - Dừng gõ

### Server to Client
- `new-message` - Tin nhắn mới
- `user-joined` - User tham gia phòng
- `user-left` - User rời phòng
- `user-typing` - User đang gõ
- `user-stop-typing` - User dừng gõ
- `user-online` - User online
- `user-offline` - User offline

## 🎨 Features

### Đã hoàn thành
- ✅ User authentication (register/login/logout)
- ✅ Real-time messaging
- ✅ Room creation and management
- ✅ Typing indicators
- ✅ User profiles
- ✅ Responsive design
- ✅ Docker containerization
- ✅ Message history
- ✅ Online status indicators

### Kế hoạch phát triển
- 🔄 File uploads
- 🔄 Emoji reactions
- 🔄 Direct messages
- 🔄 Push notifications
- 🔄 Message search
- 🔄 Voice/Video calls
- 🔄 Admin panel

## 🗄️ Truy cập Cơ sở dữ liệu MongoDB

### Cách 1: Sử dụng MongoDB Compass (Giao diện đồ họa - Khuyến nghị)

1. **Tải và cài đặt MongoDB Compass:**
   - Tải từ: https://www.mongodb.com/products/compass
   - Cài đặt theo hướng dẫn

2. **Kết nối đến database:**
   - Mở MongoDB Compass
   - Sử dụng connection string:
   ```
   mongodb://admin:chatbug123@localhost:27017/chatbug?authSource=admin
   ```
   - Hoặc điền thông tin thủ công:
     - Host: `localhost`
     - Port: `27017`
     - Authentication: Username/Password
     - Username: `admin`
     - Password: `chatbug123`
     - Authentication Database: `admin`
     - Database: `chatbug`

### Cách 2: Sử dụng MongoDB Shell (CLI)

1. **Truy cập vào container MongoDB:**
   ```powershell
   docker exec -it chatbug-mongodb mongosh
   ```

2. **Xác thực và chuyển đến database:**
   ```javascript
   use admin
   db.auth("admin", "chatbug123")
   use chatbug
   ```

3. **Các lệnh MongoDB hữu ích:**
   ```javascript
   // Xem tất cả collections
   show collections
   
   // Xem tất cả users
   db.users.find().pretty()
   
   // Xem tất cả rooms
   db.rooms.find().pretty()
   
   // Xem tất cả messages
   db.messages.find().pretty()
   
   // Đếm số lượng documents
   db.users.countDocuments()
   db.rooms.countDocuments()
   db.messages.countDocuments()
   
   // Tìm user theo email
   db.users.findOne({email: "user@example.com"})
   
   // Xem messages của một room cụ thể
   db.messages.find({room: ObjectId("room_id_here")}).pretty()
   
   // Xóa tất cả messages (cẩn thận!)
   db.messages.deleteMany({})
   
   // Tạo index cho performance tốt hơn
   db.messages.createIndex({room: 1, createdAt: -1})
   ```

### Cách 3: Sử dụng Docker Exec với mongosh

```powershell
# Kết nối trực tiếp đến database chatbug
docker exec -it chatbug-mongodb mongosh "mongodb://admin:chatbug123@localhost:27017/chatbug?authSource=admin"
```

### Cách 4: Sử dụng Studio 3T (Công cụ GUI chuyên nghiệp)

1. **Tải Studio 3T:** https://studio3t.com/
2. **Tạo kết nối mới:**
   - Server: `localhost`
   - Port: `27017`
   - Authentication: `admin` / `chatbug123`
   - Auth DB: `admin`

### Cấu trúc Database

#### Collection: `users`
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  avatar: String (URL),
  isOnline: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection: `rooms`
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  isPrivate: Boolean,
  password: String (hashed, optional),
  createdBy: ObjectId (User),
  members: [ObjectId] (Users),
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection: `messages`
```javascript
{
  _id: ObjectId,
  content: String,
  sender: ObjectId (User),
  room: ObjectId (Room),
  messageType: String ('text', 'image', 'file'),
  createdAt: Date,
  updatedAt: Date
}
```

### Backup và Restore

#### Backup database:
```powershell
# Backup toàn bộ database
docker exec chatbug-mongodb mongodump --host localhost --port 27017 --username admin --password chatbug123 --authenticationDatabase admin --db chatbug --out /data/backup

# Copy backup từ container ra host
docker cp chatbug-mongodb:/data/backup ./backup
```

#### Restore database:
```powershell
# Copy backup vào container
docker cp ./backup chatbug-mongodb:/data/restore

# Restore database
docker exec chatbug-mongodb mongorestore --host localhost --port 27017 --username admin --password chatbug123 --authenticationDatabase admin --db chatbug /data/restore/chatbug
```

### Monitoring và Logs

```powershell
# Xem logs của MongoDB container
docker logs chatbug-mongodb

# Theo dõi logs real-time
docker logs -f chatbug-mongodb

# Kiểm tra stats của database
docker exec -it chatbug-mongodb mongosh "mongodb://admin:chatbug123@localhost:27017/chatbug?authSource=admin" --eval "db.stats()"
```

### Troubleshooting

**Lỗi kết nối:**
- Đảm bảo container MongoDB đang chạy: `docker ps`
- Kiểm tra port 27017 có được expose: `docker port chatbug-mongodb`
- Xem logs để tìm lỗi: `docker logs chatbug-mongodb`

**Reset database:**
```powershell
# Dừng và xóa containers
docker-compose down

# Xóa volume (sẽ mất tất cả data!)
docker volume rm chatbug_mongodb_data

# Khởi động lại
docker-compose up -d
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub.

---

**Tạo bởi ChatBug Team** 🐛💬
