/**
 * 本地开发WebSocket服务器
 * 用于本地测试，生产环境应使用ESA边缘函数
 */

import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 存储房间数据
const rooms = new Map()
// 存储用户数据
const users = new Map()

// 用户颜色列表
const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52BE80', '#EC7063', '#5DADE2'
]

// 生成用户颜色
function getUserColor(userId) {
  const index = users.size % userColors.length
  return userColors[index]
}

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    message: '边缘协作白板服务器',
    version: '1.0.0',
    status: 'running'
  }))
})

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
})

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id)

  // 加入房间
  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId)
    
    const userId = socket.id
    const userColor = getUserColor(userId)
    
    const user = {
      id: userId,
      name: userName || `用户${userId.slice(0, 6)}`,
      color: userColor,
      roomId: roomId
    }
    
    users.set(userId, user)
    
    // 初始化房间
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        canvasData: null
      })
    }
    
    const room = rooms.get(roomId)
    room.users.push(user)
    
    // 通知房间内其他用户
    socket.to(roomId).emit('user-joined', user)
    
    // 发送当前房间用户列表
    io.to(roomId).emit('room-users', room.users)
    
    // 发送当前画布状态（如果有）
    if (room.canvasData) {
      socket.emit('canvas-update', room.canvasData)
    }
    
    console.log(`用户 ${userName} 加入房间 ${roomId}`)
  })

  // 处理画布事件
  socket.on('canvas-event', ({ roomId, event }) => {
    const room = rooms.get(roomId)
    if (!room) return
    
    // 更新房间画布数据
    room.canvasData = event
    
    // 广播给房间内其他用户（排除发送者）
    socket.to(roomId).emit('canvas-update', event)
  })

  // 用户断开连接
  socket.on('disconnect', () => {
    const userId = socket.id
    const user = users.get(userId)
    
    if (user && user.roomId) {
      const room = rooms.get(user.roomId)
      if (room) {
        room.users = room.users.filter(u => u.id !== userId)
        
        // 通知房间内其他用户
        socket.to(user.roomId).emit('user-left', userId)
        
        // 更新用户列表
        io.to(user.roomId).emit('room-users', room.users)
      }
    }
    
    users.delete(userId)
    console.log('用户断开连接:', userId)
  })
})

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket服务器运行在 http://localhost:${PORT}`)
  console.log(`📡 等待客户端连接...`)
})

