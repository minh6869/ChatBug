-- SQL Initialization Script for ChatBug
-- This file provides SQL equivalent structure if you want to migrate to a SQL database
-- Currently the app uses MongoDB, but this shows the equivalent SQL structure

-- Create database
-- CREATE DATABASE chatbug CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE chatbug;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed password
    avatar VARCHAR(500),
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_online (is_online),
    INDEX idx_created (created_at)
);

-- Rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    password VARCHAR(255), -- Hashed password for private rooms
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_created_by (created_by),
    INDEX idx_private (is_private),
    INDEX idx_created (created_at)
);

-- Room members (many-to-many relationship)
CREATE TABLE room_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (room_id, user_id),
    INDEX idx_room (room_id),
    INDEX idx_user (user_id)
);

-- Messages table
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    sender_id INT NOT NULL,
    room_id INT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_room_time (room_id, created_at),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
);

-- Insert sample data

-- Sample users (password: "password123" hashed with bcrypt)
INSERT INTO users (username, email, password, avatar, is_online, last_seen) VALUES
('admin', 'admin@chatbug.com', '$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', FALSE, NOW()),
('john_doe', 'john@example.com', '$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', FALSE, NOW()),
('jane_smith', 'jane@example.com', '$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', FALSE, NOW());

-- Sample rooms
INSERT INTO rooms (name, description, is_private, created_by) VALUES
('General', 'Kênh chat chung cho mọi người', FALSE, 1),
('Random', 'Nói chuyện phiếm về mọi thứ', FALSE, 1),
('Tech Talk', 'Thảo luận về công nghệ', FALSE, 2),
('Private Room', 'Phòng riêng tư', TRUE, 3);

-- Add room members
INSERT INTO room_members (room_id, user_id) VALUES
-- General room (all users)
(1, 1), (1, 2), (1, 3),
-- Random room (all users)  
(2, 1), (2, 2), (2, 3),
-- Tech Talk (admin and john)
(3, 1), (3, 2),
-- Private Room (john and jane)
(4, 2), (4, 3);

-- Sample messages
INSERT INTO messages (content, sender_id, room_id, message_type, created_at) VALUES
('Chào mọi người! 👋', 1, 1, 'text', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('Xin chào admin! Ứng dụng chat này thật tuyệt vời! 🎉', 2, 1, 'text', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('Mình đồng ý! Giao diện rất đẹp và dễ sử dụng 😍', 3, 1, 'text', DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('Ai có kinh nghiệm về React không? 🤔', 2, 3, 'text', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('Mình có đây! React rất mạnh mẽ cho việc xây dựng UI ⚛️', 1, 3, 'text', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('Hôm nay thời tiết đẹp quá! ☀️', 3, 2, 'text', DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- Create views for common queries

-- View: Latest messages per room
CREATE VIEW latest_room_messages AS
SELECT 
    r.id as room_id,
    r.name as room_name,
    m.content as last_message,
    u.username as last_sender,
    m.created_at as last_message_time
FROM rooms r
LEFT JOIN messages m ON r.id = m.room_id
LEFT JOIN users u ON m.sender_id = u.id
WHERE m.id = (
    SELECT MAX(id) 
    FROM messages 
    WHERE room_id = r.id
);

-- View: Room member counts
CREATE VIEW room_member_counts AS
SELECT 
    r.id as room_id,
    r.name as room_name,
    COUNT(rm.user_id) as member_count
FROM rooms r
LEFT JOIN room_members rm ON r.id = rm.room_id
GROUP BY r.id, r.name;

-- View: User message counts
CREATE VIEW user_message_counts AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(m.id) as message_count
FROM users u
LEFT JOIN messages m ON u.id = m.sender_id
GROUP BY u.id, u.username;

-- Stored procedures

DELIMITER //

-- Procedure: Get room messages with pagination
CREATE PROCEDURE GetRoomMessages(
    IN room_id INT,
    IN page_size INT DEFAULT 50,
    IN page_offset INT DEFAULT 0
)
BEGIN
    SELECT 
        m.id,
        m.content,
        m.message_type,
        m.created_at,
        u.username,
        u.avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.room_id = room_id
    ORDER BY m.created_at DESC
    LIMIT page_size OFFSET page_offset;
END //

-- Procedure: Add user to room
CREATE PROCEDURE AddUserToRoom(
    IN user_id INT,
    IN room_id INT
)
BEGIN
    DECLARE room_exists INT DEFAULT 0;
    DECLARE user_exists INT DEFAULT 0;
    DECLARE already_member INT DEFAULT 0;
    
    -- Check if room exists
    SELECT COUNT(*) INTO room_exists FROM rooms WHERE id = room_id;
    
    -- Check if user exists  
    SELECT COUNT(*) INTO user_exists FROM users WHERE id = user_id;
    
    -- Check if already a member
    SELECT COUNT(*) INTO already_member FROM room_members WHERE room_id = room_id AND user_id = user_id;
    
    IF room_exists > 0 AND user_exists > 0 AND already_member = 0 THEN
        INSERT INTO room_members (room_id, user_id) VALUES (room_id, user_id);
        SELECT 'User added successfully' as result;
    ELSE
        SELECT 'Failed to add user' as result;
    END IF;
END //

-- Function: Get user online status
CREATE FUNCTION IsUserOnline(user_id INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE online_status BOOLEAN DEFAULT FALSE;
    SELECT is_online INTO online_status FROM users WHERE id = user_id;
    RETURN online_status;
END //

DELIMITER ;

-- Sample queries for testing

-- Get all rooms with member counts
-- SELECT r.*, rmc.member_count 
-- FROM rooms r 
-- LEFT JOIN room_member_counts rmc ON r.id = rmc.room_id;

-- Get messages for a specific room
-- CALL GetRoomMessages(1, 10, 0);

-- Get user's rooms
-- SELECT r.* FROM rooms r
-- JOIN room_members rm ON r.id = rm.room_id
-- WHERE rm.user_id = 1;

-- Get online users
-- SELECT * FROM users WHERE is_online = TRUE;

-- Sample login credentials:
-- Email: admin@chatbug.com | Password: password123
-- Email: john@example.com | Password: password123  
-- Email: jane@example.com | Password: password123
