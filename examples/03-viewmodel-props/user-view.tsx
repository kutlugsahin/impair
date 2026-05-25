import { useState } from 'react'

import { component, useViewModel } from 'impair'

import { type UserProps, UserViewModel } from './user-view-model'

const UserCard = component<UserProps>(function UserCard() {
  const { isLoading, user, props } = useViewModel(UserViewModel)

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, minHeight: 60 }}>
      {isLoading ? `Loading user ${props.userId}…` : user ? `Loaded: ${user.name}` : '—'}
    </div>
  )
})

export function UserView() {
  const [userId, setUserId] = useState(1)

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setUserId((id) => id + 1)}>Next user (current: {userId})</button>
      </div>
      <UserCard userId={userId} />
    </div>
  )
}
