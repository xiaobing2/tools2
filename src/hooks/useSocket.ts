import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // 连接到边缘函数提供的WebSocket服务
    // 在生产环境中，这里应该是ESA边缘函数的WebSocket端点
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'
    
    console.log('正在连接到WebSocket服务器:', socketUrl)
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    })

    newSocket.on('connect', () => {
      console.log('WebSocket连接成功')
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket断开连接:', reason)
    })

    setSocket(newSocket)

    return () => {
      console.log('清理WebSocket连接')
      newSocket.close()
      setSocket(null)
    }
  }, [])

  return socket
}

