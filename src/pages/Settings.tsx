import { useEffect, useState, useRef } from 'react'
import type { User as UserProps } from '@/utils/makeInitData'
import storage from '@/utils/storage'
import {Trash, SquarePen, ChevronLeft} from 'lucide-react'
import {usePopup} from "@/hooks/usePopup"

type Bot = {
  id: string
  token: string
  [k: string]: any
}

interface User extends UserProps {
    edit?: boolean
    ori_id?: number | string
}

const LS_USERS = '_tg_users'
const LS_CURRENT_USER = '_tg_current_user'
const LS_BOTS = '_tg_bots'
const LS_CURRENT_BOT = '_tg_current_bot'
const LEGACY_SINGLE_USER = '__tg_user'

const parseJSON = <T,>(v: string | null, fallback: T) => {
  try {
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export const Settings = () => {
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User>({} as User)

  const [bots, setBots] = useState<Bot[]>([])
  const [currentBotId, setCurrentBotId] = useState<string | null>(null)
  const [editingBot, setEditingBot] = useState<Bot>({ id: '', token: '' })

  const [showUserModal, setShowUserModal] = useState(false)
  const [showBotModal, setShowBotModal] = useState(false)

  const userModalRef = useRef<HTMLDivElement>(null)
  const botModalRef = useRef<HTMLDivElement>(null)
  
  const {popup} = usePopup();

  useEffect(() => {
    const rawUsers = localStorage.getItem(LS_USERS)
    if (rawUsers) {
      const parsed = parseJSON<User[]>(rawUsers, [])
      setUsers(parsed)
      const cur = localStorage.getItem(LS_CURRENT_USER)
      if (cur) {
        setCurrentUserId(cur)
        const found = parsed.find((u) => String(u.id) === cur)
        if (found) setEditingUser(found)
      } else if (parsed.length) {
        setCurrentUserId(String(parsed[0].id))
        setEditingUser(parsed[0])
      }
      return
    }
    const legacy = localStorage.getItem(LEGACY_SINGLE_USER)
    if (legacy) {
      const single = parseJSON<User>(legacy, {} as User)
      const arr = single && Object.keys(single).length ? [single] : []
      setUsers(arr)
      if (arr.length) {
        setCurrentUserId(String(arr[0].id))
        setEditingUser(arr[0])
      }
      return
    }
    setUsers([])
    setCurrentUserId(null)
    setEditingUser({} as User)
  }, [])

  useEffect(() => {
    const rawBots = localStorage.getItem(LS_BOTS)
    if (rawBots) {
      const parsed = parseJSON<Bot[]>(rawBots, [])
      setBots(parsed)
      const cur = localStorage.getItem(LS_CURRENT_BOT)
      if (cur) {
        setCurrentBotId(cur)
        const found = parsed.find((b) => String(b.id) === cur)
        if (found) setEditingBot(found)
      } else if (parsed.length) {
        setCurrentBotId(String(parsed[0].id))
        setEditingBot(parsed[0])
      }
      return
    }
    const token = storage.get('token') || ''
    if (token) {
      const singleBot: Bot = { id: 'default', token }
      setBots([singleBot])
      setCurrentBotId(String(singleBot.id))
      setEditingBot(singleBot)
      return
    }
    setBots([])
    setCurrentBotId(null)
    setEditingBot({ id: '', token: '' })
  }, [])

  useEffect(() => {
  if (currentUserId == null) return

  const found = users.find(u => String(u.id) === String(currentUserId))
  if (!found) return

  setEditingUser(p => ({ ...p, ...found }))
  }, [currentUserId, users])  

  useEffect(() => {
    if (currentBotId == null) return
    const found = bots.find((b) => String(b.id) === String(currentBotId))
    if (found) setEditingBot(found)
  }, [currentBotId, bots])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserModal && userModalRef.current && !userModalRef.current.contains(e.target as Node)) {
        setShowUserModal(false)
      }
      if (showBotModal && botModalRef.current && !botModalRef.current.contains(e.target as Node)) {
        setShowBotModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserModal, showBotModal])

  const saveUser = (user: User) => {
    if (!user.id) return
    const next = [...users.filter((u) => String(u.id) !== String(user.id)), user]
    setUsers(next)
    localStorage.setItem(LS_USERS, JSON.stringify(next))
    setCurrentUserId(String(user.id))
    localStorage.setItem(LS_CURRENT_USER, String(user.id))
    setShowUserModal(false)
  }

  const saveBot = (bot: Bot) => {
    if (!bot.token) return
    if (bots.find(b => b.token === bot.token)) return alert('Bot has this token already exist')
    const id = bot.id || `bot-${Date.now()}`
    const next = [...bots.filter((b) => String(b.id) !== String(id)), { ...bot, id }]
    setBots(next)
    localStorage.setItem(LS_BOTS, JSON.stringify(next))
    setCurrentBotId(String(id))
    localStorage.setItem(LS_CURRENT_BOT, String(id))
    storage.set('token', bot.token)
    setShowBotModal(false)
  }

 /* const persistAllAndBack = () => {
    localStorage.setItem(LS_USERS, JSON.stringify(users))
    if (currentUserId) localStorage.setItem(LS_CURRENT_USER, String(currentUserId))
    localStorage.setItem(LS_BOTS, JSON.stringify(bots))
    if (currentBotId) localStorage.setItem(LS_CURRENT_BOT, String(currentBotId))
    const curBot = bots.find((b) => String(b.id) === String(currentBotId))
    if (curBot?.token) storage.set('token', curBot.token)
    window.history.back()
  }*/
  
  const removeBot = (id: string) => {
      popup({
          title: 'Remove Bot',
          message: 'Are you sure to remove this bot?',
          buttons: [
              { text: 'Cancel' },
              {
                  text: 'Remove',
                  type: 'destructive',
                  onClick: () => removeBot2(id)
              }
          ]
      })
  }
  
  const removeBot2 = (id: string) => {
  const next = bots.filter((b) => String(b.id) !== String(id))
  setBots(next)
  localStorage.setItem(LS_BOTS, JSON.stringify(next))
  if (String(currentBotId) === String(id)) {
    if (next.length) {
      setCurrentBotId(String(next[0].id))
      setEditingBot(next[0])
      localStorage.setItem(LS_CURRENT_BOT, String(next[0].id))
      storage.set('token', next[0].token)
    } else {
      setCurrentBotId(null)
      setEditingBot({ id: '', token: '' })
      localStorage.removeItem(LS_CURRENT_BOT)
    //  storage.remove('token')
    }
  }
}

const removeUser = (id: number) => {
      popup({
          title: 'Remove User',
          message: 'Are you sure to remove this user?',
          buttons: [
              { text: 'Cancel' },
              {
                  text: 'Remove',
                  type: 'destructive',
                  onClick: () => removeUser2(id)
              }
          ]
      })
  }

const removeUser2 = (id: number) => {
  const next = users.filter((u) => String(u.id) !== String(id))
  setUsers(next)
  localStorage.setItem(LS_USERS, JSON.stringify(next))

  if (String(currentUserId) === String(id)) {
    if (next.length) {
      const first = next[0]
      setCurrentUserId(String(first.id))
      setEditingUser(first)
      localStorage.setItem(LS_CURRENT_USER, String(first.id))
    } else {
      setCurrentUserId(null)
      setEditingUser({} as User)
      localStorage.removeItem(LS_CURRENT_USER)
    }
  }
}

const editUser = (id: number) => {
  const found = users.find((u) => String(u.id) === String(id))
  if (!found) return

  setEditingUser({ ...found, edit: true, ori_id: id })
  setShowUserModal(true)
}

const updateUser = (updatedUser: User) => {
  if (updatedUser.id == null || updatedUser.ori_id == null) return

  const { edit, ori_id, ...rest } = updatedUser
  
  setUsers(pr => {
      const p = [...pr]
      const idx = p.findIndex(u => u.id === ori_id)
      if (idx === -1) return p
      p[idx] = rest
      localStorage.setItem(LS_USERS, JSON.stringify(p))
      return p
  }) 

  if (String(currentUserId) === String(updatedUser.ori_id)) {
    setCurrentUserId(String(updatedUser.id))
    setEditingUser({} as User)
    localStorage.setItem(LS_CURRENT_USER, String(updatedUser.id))
  }

  setShowUserModal(false)
}

  return (
    <div className="w-screen h-screen bg-background overflow-y-auto p-4">
      <h3 className="w-full flex justify-center items-center font-semibold mb-4 relative">
          <ChevronLeft className='absolute left-0 -top-1' onClick={() => window.history.back()}/>
          User & Bot
      </h3>

      <section className="bg-secondary rounded-xl p-4 space-y-3">
        <h3 className="text-blue-500 font-semibold">Bots</h3>
        <div className="flex flex-col space-y-3">
          {bots.map((b, ind) => (
            <div
              key={b.id}
              className={`p-3 border-1 rounded-xl w-full flex items-center ${
                currentBotId === b.id ? 'border-blue-500' : 'border-muted'
              }`}
              onClick={() => {
                setCurrentBotId(b.id)
                setEditingBot(b)
                localStorage.setItem(LS_CURRENT_BOT, String(b.id))
              }}
            >
              <input type="radio" checked={currentBotId === b.id} readOnly className="mr-2" />
              <span className="text-sm w-full">{b.token.split(':')?.[0] || `Bot ${ind + 1}`}</span>
              <Trash className='text-red-500' onClick={() => removeBot(b.id)} />
            </div>
          ))}
          <button
            className="col-span-2 bg-primary text-primary-foreground rounded-xl p-2 mt-2"
            onClick={() => {
              setEditingBot({ id: '', token: '' })
              setShowBotModal(true)
            }}
          >
            Add Bot
          </button>
        </div>
      </section>

      <section className="bg-secondary rounded-xl p-4 space-y-3 mt-4">
        <h3 className="text-blue-500 font-semibold">Users</h3>
        <div className="flex flex-col space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className={`p-3 border rounded-xl w-full flex items-center ${
                currentUserId === String(u.id) ? 'border-blue-500' : 'border-muted'
              }`}
              onClick={() => {
                setCurrentUserId(String(u.id))
                setEditingUser(u)
                localStorage.setItem(LS_CURRENT_USER, String(u.id))
              }}
            >
              <input type="radio" checked={currentUserId === String(u.id)} readOnly className="mr-2" />
              <span className="text-sm w-full">{u.first_name || u.username || u.id}</span>
              <div className='flex shrink-0 space-x-2.5' onClick={(e) => e.stopPropagation()}>
                  <SquarePen className='text-blue-500' onClick={() => editUser(u.id)} />
                  <Trash className='text-red-500' onClick={() => removeUser(u.id)} />
              </div>
            </div>
          ))}
          <button
            className="col-span-2 bg-blue-500 rounded-xl p-2 mt-2 bg-primary text-primary-foreground"
            onClick={() => {
              setEditingUser({} as User)
              setShowUserModal(true)
            }}
          >
            Add User
          </button>
        </div>
      </section>

      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center animate-fadeIn">
          <div
            ref={userModalRef}
            className="bg-secondary p-6 rounded-xl w-96 space-y-3 animate-slideIn"
          >
            <h3 className="text-lg font-semibold text-blue-500">{editingUser.edit ? 'Edit User' : 'Add User'}</h3>
            <input
              placeholder="User ID (required)"
              type="number"
              className="w-full p-2 bg-transparent outline-none border-b border-gray-700"
              value={editingUser.id || ''}
              onChange={(e) => setEditingUser((p) => ({ ...p, id: Number(e.target.value) }))}
            />
            <input
              placeholder="First Name"
              className="w-full p-2 bg-transparent outline-none border-b border-gray-700"
              value={editingUser.first_name || ''}
              onChange={(e) => setEditingUser((p) => ({ ...p, first_name: e.target.value }))}
            />
            <input
              placeholder="Last Name"
              className="w-full p-2 bg-transparent outline-none border-b border-gray-700"
              value={editingUser.last_name || ''}
              onChange={(e) => setEditingUser((p) => ({ ...p, last_name: e.target.value }))}
            />
            <input
              placeholder="Username"
              className="w-full p-2 bg-transparent outline-none border-b border-gray-700"
              value={editingUser.username || ''}
              onChange={(e) => setEditingUser((p) => ({ ...p, username: e.target.value }))}
            />
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-destructive text-primary-foreground rounded-xl p-2" onClick={() => setShowUserModal(false)}>
                Cancel
              </button>
              <button className="flex-1 bg-primary rounded-xl p-2 disabled:bg-primary/70 transition-colors duration-200 text-primary-foreground" onClick={() => editingUser.edit ? updateUser(editingUser) : saveUser(editingUser)} disabled={!editingUser.id || (!editingUser.first_name && !editingUser.last_name)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showBotModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center animate-fadeIn">
          <div ref={botModalRef} className="bg-secondary p-6 rounded-xl w-96 space-y-3 animate-slideIn">
            <h3 className="text-lg font-semibold text-blue-500">Add Bot</h3>
            <input
              placeholder="Token (required)"
              className="w-full p-2 bg-transparent outline-none border-b border-gray-700"
              onChange={(e) => setEditingBot((p) => ({ ...p, token: e.target.value }))}
            />
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-destructive text-primary-foreground rounded-xl p-2" onClick={() => setShowBotModal(false)}>
                Cancel
              </button>
              <button className="flex-1 bg-primary rounded-xl p-2 disabled:bg-primary/70 text-primary-foreground transition-colors duration-200" onClick={() => saveBot(editingBot)} disabled={!editingBot.token?.trim?.()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      <p className='px-2 py-2.5 text-sm text-muted'>Note: The selected bot and user will be used to generate valid init data.</p>

    </div>
  )
}
