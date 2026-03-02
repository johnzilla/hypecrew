import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Send, MessageCircle } from 'lucide-react'

interface Conversation {
  other_user_id: string
  other_user_name: string
  last_message: string
  last_message_at: string
  unread: boolean
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
}

export function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) fetchConversations()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeConversation) fetchMessages(activeConversation)
  }, [activeConversation]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!user || !activeConversation) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const msg = payload.new as Message
          if (
            msg.sender_id === activeConversation ||
            msg.receiver_id === activeConversation
          ) {
            setMessages((prev) => [...prev, msg])
          }
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, activeConversation]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchConversations() {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await supabase.rpc('get_conversations', { user_uuid: user.id })
      setConversations(data ?? [])
    } catch {
      // messages table may not exist yet
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages(otherUserId: string) {
    if (!user) return
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })
      setMessages(data ?? [])

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)
        .eq('read', false)
    } catch {
      setMessages([])
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !activeConversation || !newMessage.trim()) return

    setSending(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: activeConversation,
          content: newMessage.trim(),
        })
        .select()
        .single()

      if (error) throw error
      setMessages((prev) => [...prev, data])
      setNewMessage('')
      fetchConversations()
    } catch {
      // noop
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 && !activeConversation ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No messages yet</p>
              <p className="text-gray-400 text-sm">
                Messages will appear here when you interact with gig applications.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh]">
          <Card className="md:col-span-1 overflow-y-auto">
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-500 uppercase">Conversations</h2>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.map((conv) => (
                <button
                  key={conv.other_user_id}
                  onClick={() => setActiveConversation(conv.other_user_id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    activeConversation === conv.other_user_id ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {conv.other_user_name}
                    {conv.unread && (
                      <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                          msg.sender_id === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()} icon={Send}>
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
