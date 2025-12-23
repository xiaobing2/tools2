/**
 * 边缘函数：实时协作白板服务器
 * 基于阿里云ESA边缘函数构建
 * 使用WebSocket实现实时同步
 */

import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'

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

// 边缘函数入口
export default async function handler(req, res) {
  // 如果是WebSocket升级请求，由Socket.IO处理
  if (req.headers.upgrade === 'websocket') {
    return
  }

  // HTTP请求处理
  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({
    message: '边缘协作白板服务器',
    version: '1.0.0',
    status: 'running'
  })
}

// Socket.IO服务器初始化
let io = null

export function initSocketIO(server) {
  io = new Server(server, {
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
          
          // 如果房间为空，清理房间数据（可选）
          if (room.users.length === 0) {
            // 可以选择保留画布数据一段时间
            // rooms.delete(user.roomId)
          }
        }
      }
      
      users.delete(userId)
      console.log('用户断开连接:', userId)
    })
  })

  return io
}

// 边缘存储：保存画布数据
export async function saveCanvasData(roomId, canvasData) {
  // 这里应该调用ESA边缘存储API
  // 示例：使用边缘存储保存数据
  try {
    // const storage = await getEdgeStorage()
    // await storage.put(`whiteboard/${roomId}.json`, JSON.stringify(canvasData))
    
    // 临时存储在内存中
    const room = rooms.get(roomId)
    if (room) {
      room.canvasData = canvasData
    }
    
    return { success: true }
  } catch (error) {
    console.error('保存画布数据失败:', error)
    return { success: false, error: error.message }
  }
}

// 边缘存储：加载画布数据
export async function loadCanvasData(roomId) {
  // 这里应该调用ESA边缘存储API
  // 示例：从边缘存储加载数据
  try {
    // const storage = await getEdgeStorage()
    // const data = await storage.get(`whiteboard/${roomId}.json`)
    // return JSON.parse(data)
    
    // 临时从内存中加载
    const room = rooms.get(roomId)
    return room?.canvasData || null
  } catch (error) {
    console.error('加载画布数据失败:', error)
    return null
  }
}

// 边缘缓存：缓存画布状态
export async function cacheCanvasState(roomId, canvasState) {
  // 这里应该使用ESA边缘缓存
  // 示例：使用边缘缓存API
  try {
    // const cache = await getEdgeCache()
    // await cache.set(`whiteboard:${roomId}`, canvasState, { ttl: 3600 })
    
    // 临时存储在内存中
    const room = rooms.get(roomId)
    if (room) {
      room.cachedState = canvasState
      room.cacheTime = Date.now()
    }
    
    return { success: true }
  } catch (error) {
    console.error('缓存画布状态失败:', error)
    return { success: false, error: error.message }
  }
}

