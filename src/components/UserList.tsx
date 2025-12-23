import './UserList.css'

interface User {
  id: string
  name: string
  color: string
}

interface UserListProps {
  users: User[]
  currentUserName: string
}

export default function UserList({ users, currentUserName }: UserListProps) {
  return (
    <div className="user-list">
      <h3>在线用户 ({users.length})</h3>
      <div className="users">
        {users.map((user) => (
          <div
            key={user.id}
            className={`user-item ${user.name === currentUserName ? 'current' : ''}`}
          >
            <div
              className="user-avatar"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.name}</span>
            {user.name === currentUserName && (
              <span className="user-badge">我</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

