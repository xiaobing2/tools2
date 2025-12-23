import { useState, useEffect } from 'react'
import Whiteboard from './components/Whiteboard'
import Toolbar from './components/Toolbar'
import UserList from './components/UserList'
import ConnectionStatus from './components/ConnectionStatus'
import { useSocket } from './hooks/useSocket'
import { useWhiteboard } from './hooks/useWhiteboard'
import './App.css'

function App() {
  const [roomId, setRoomId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string; color: string }>>([])

  const socket = useSocket()
  const { canvas, initCanvas, handleCanvasEvent, exportImage, exportPDF } = useWhiteboard()

  useEffect(() => {
    // 从URL获取房间ID，如果没有则生成
    const urlParams = new URLSearchParams(window.location.search)
    const urlRoomId = urlParams.get('room')
    if (urlRoomId) {
      setRoomId(urlRoomId)
    } else {
      const newRoomId = generateRoomId()
      setRoomId(newRoomId)
      window.history.replaceState({}, '', `?room=${newRoomId}`)
    }

    // 生成默认用户名
    const defaultName = `用户${Math.floor(Math.random() * 1000)}`
    setUserName(defaultName)

    return () => {
      socket?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket || !roomId || !userName) return

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('join-room', { roomId, userName })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('room-users', (userList: Array<{ id: string; name: string; color: string }>) => {
      setUsers(userList)
    })

    socket.on('user-joined', (user: { id: string; name: string; color: string }) => {
      setUsers((prev: Array<{ id: string; name: string; color: string }>) => [...prev, user])
    })

    socket.on('user-left', (userId: string) => {
      setUsers((prev: Array<{ id: string; name: string; color: string }>) => prev.filter((u: { id: string; name: string; color: string }) => u.id !== userId))
    })

    socket.on('canvas-update', (data: any) => {
      handleCanvasEvent(data)
    })


    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('room-users')
      socket.off('canvas-update')
      socket.off('user-joined')
      socket.off('user-left')
    }
  }, [socket, roomId, userName, handleCanvasEvent])

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板！')
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🎨 边缘协作白板</h1>
          <ConnectionStatus isConnected={isConnected} />
        </div>
        <div className="header-right">
          <div className="room-info">
            <span>房间ID: {roomId}</span>
            <button onClick={handleShare} className="share-btn">
              分享链接
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <Toolbar
            onExportImage={exportImage}
            onExportPDF={exportPDF}
          />
          <UserList users={users} currentUserName={userName} />
        </aside>

        <main className="whiteboard-container">
          <Whiteboard
            canvas={canvas}
            onInit={initCanvas}
            onCanvasEvent={(event) => {
              if (socket && isConnected) {
                socket.emit('canvas-event', { roomId, event })
              }
            }}
          />
        </main>
      </div>
    </div>
  )
}

export default App

