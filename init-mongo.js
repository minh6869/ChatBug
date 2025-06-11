// MongoDB Initialization Script for ChatBug
// This script sets up the initial database structure and sample data

// Connect to the chatbug database
db = db.getSiblingDB('chatbug');

// Create collections with validation schemas
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password"],
      properties: {
        username: {
          bsonType: "string",
          description: "Username must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email must be a valid email address"
        },
        password: {
          bsonType: "string",
          minLength: 6,
          description: "Password must be a string with minimum 6 characters"
        },
        avatar: {
          bsonType: "string",
          description: "Avatar URL"
        },
        isOnline: {
          bsonType: "bool",
          description: "Online status"
        },
        lastSeen: {
          bsonType: "date",
          description: "Last seen timestamp"
        },
        createdAt: {
          bsonType: "date",
          description: "Account creation date"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update date"
        }
      }
    }
  }
});

db.createCollection("rooms", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "createdBy"],
      properties: {
        name: {
          bsonType: "string",
          description: "Room name must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "Room description"
        },
        isPrivate: {
          bsonType: "bool",
          description: "Private room flag"
        },
        password: {
          bsonType: "string",
          description: "Room password (hashed)"
        },
        createdBy: {
          bsonType: "objectId",
          description: "User ID who created the room"
        },
        members: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "Array of user IDs who are members"
        },
        createdAt: {
          bsonType: "date",
          description: "Room creation date"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update date"
        }
      }
    }
  }
});

db.createCollection("messages", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["content", "sender", "room"],
      properties: {
        content: {
          bsonType: "string",
          description: "Message content must be a string and is required"
        },
        sender: {
          bsonType: "objectId",
          description: "User ID who sent the message"
        },
        room: {
          bsonType: "objectId",
          description: "Room ID where message was sent"
        },
        messageType: {
          bsonType: "string",
          enum: ["text", "image", "file", "system"],
          description: "Type of message"
        },
        createdAt: {
          bsonType: "date",
          description: "Message creation date"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update date"
        }
      }
    }
  }
});

// Create indexes for better performance
print("Creating indexes...");

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ isOnline: 1 });
db.users.createIndex({ createdAt: -1 });

// Rooms indexes
db.rooms.createIndex({ name: 1 });
db.rooms.createIndex({ createdBy: 1 });
db.rooms.createIndex({ members: 1 });
db.rooms.createIndex({ isPrivate: 1 });
db.rooms.createIndex({ createdAt: -1 });

// Messages indexes
db.messages.createIndex({ room: 1, createdAt: -1 });
db.messages.createIndex({ sender: 1 });
db.messages.createIndex({ createdAt: -1 });
db.messages.createIndex({ room: 1, sender: 1 });

print("Indexes created successfully!");

// Insert sample data
print("Inserting sample data...");

// Sample users (passwords are hashed for: "password123")
const sampleUsers = [
  {
    username: "admin",
    email: "admin@chatbug.com",
    password: "$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: "john_doe",
    email: "john@example.com",
    password: "$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const userResult = db.users.insertMany(sampleUsers);
const userIds = Object.values(userResult.insertedIds);

print(`Inserted ${userIds.length} sample users`);

// Sample rooms
const sampleRooms = [
  {
    name: "General",
    description: "Kênh chat chung cho mọi người",
    isPrivate: false,
    createdBy: userIds[0],
    members: userIds,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Random",
    description: "Nói chuyện phiếm về mọi thứ",
    isPrivate: false,
    createdBy: userIds[0],
    members: userIds,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Tech Talk",
    description: "Thảo luận về công nghệ",
    isPrivate: false,
    createdBy: userIds[1],
    members: [userIds[0], userIds[1]],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Private Room",
    description: "Phòng riêng tư",
    isPrivate: true,
    password: "$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z", // "secret123"
    createdBy: userIds[2],
    members: [userIds[1], userIds[2]],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const roomResult = db.rooms.insertMany(sampleRooms);
const roomIds = Object.values(roomResult.insertedIds);

print(`Inserted ${roomIds.length} sample rooms`);

// Sample messages
const sampleMessages = [
  {
    content: "Chào mọi người! 👋",
    sender: userIds[0],
    room: roomIds[0],
    messageType: "text",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    content: "Xin chào admin! Ứng dụng chat này thật tuyệt vời! 🎉",
    sender: userIds[1],
    room: roomIds[0],
    messageType: "text",
    createdAt: new Date(Date.now() - 3000000), // 50 minutes ago
    updatedAt: new Date(Date.now() - 3000000)
  },
  {
    content: "Mình đồng ý! Giao diện rất đẹp và dễ sử dụng 😍",
    sender: userIds[2],
    room: roomIds[0],
    messageType: "text",
    createdAt: new Date(Date.now() - 2400000), // 40 minutes ago
    updatedAt: new Date(Date.now() - 2400000)
  },
  {
    content: "Ai có kinh nghiệm về React không? 🤔",
    sender: userIds[1],
    room: roomIds[2],
    messageType: "text",
    createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1800000)
  },
  {
    content: "Mình có đây! React rất mạnh mẽ cho việc xây dựng UI ⚛️",
    sender: userIds[0],
    room: roomIds[2],
    messageType: "text",
    createdAt: new Date(Date.now() - 1200000), // 20 minutes ago
    updatedAt: new Date(Date.now() - 1200000)
  },
  {
    content: "Hôm nay thời tiết đẹp quá! ☀️",
    sender: userIds[2],
    room: roomIds[1],
    messageType: "text",
    createdAt: new Date(Date.now() - 600000), // 10 minutes ago
    updatedAt: new Date(Date.now() - 600000)
  }
];

const messageResult = db.messages.insertMany(sampleMessages);

print(`Inserted ${messageResult.insertedIds.length} sample messages`);

// Create admin user if not exists
const adminExists = db.users.findOne({ email: "admin@chatbug.com" });
if (!adminExists) {
  const adminUser = {
    username: "chatbug_admin",
    email: "admin@chatbug.com",
    password: "$2b$10$K7L/8Y8jM8P9Z1.0X2Y9ZOeHx3Vz4Wq5Rs6Tt7Uu8Vv9Ww0Xx1Yy2Z", // "admin123"
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chatbug",
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.users.insertOne(adminUser);
  print("Admin user created!");
}

// Display database statistics
print("\n=== Database Statistics ===");
print(`Users: ${db.users.countDocuments()}`);
print(`Rooms: ${db.rooms.countDocuments()}`);
print(`Messages: ${db.messages.countDocuments()}`);

print("\n=== Sample Login Credentials ===");
print("Email: admin@chatbug.com | Password: password123");
print("Email: john@example.com | Password: password123");
print("Email: jane@example.com | Password: password123");

print("\n✅ MongoDB initialization completed successfully!");
