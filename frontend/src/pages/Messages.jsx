import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MessageSquare, Send, User, Building2, Check, CheckCheck } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('convId');

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(initialConvId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  const fetchConversations = async () => {
    try {
      const res = await api.getConversations();
      const list = res.conversations || [];
      setConversations(list);
      if (!activeConvId && list.length > 0) {
        setActiveConvId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages for active conversation
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.getMessages(convId);
      setMessages(res.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      // Poll active conversation every 5 seconds
      const timer = setInterval(() => fetchMessages(activeConvId), 5000);
      return () => clearInterval(timer);
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await api.sendMessage({
        conversation_id: activeConvId,
        content,
      });

      setMessages((prev) => [...prev, res.message]);
      fetchConversations(); // Update last message in sidebar
      scrollToBottom();
    } catch (err) {
      toast(err.message || 'Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="page-wrapper" style={{ paddingBottom: 0 }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>In-App Messaging</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Direct communication between applicants and hiring teams.
          </p>
        </div>

        {/* Chat Container */}
        <div className="glass-card" style={{
          height: '70vh',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}>
          {/* Left: Conversation List */}
          <aside style={{
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(11, 15, 25, 0.4)',
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.95rem' }}>
              Active Conversations ({conversations.length})
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No messages yet. Conversations begin once candidates apply or recruiters reach out.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const unread = parseInt(conv.unread_count || 0, 10);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                        borderBottom: '1px solid var(--border-subtle)',
                        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <img
                        src={conv.participant_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'}
                        alt={conv.participant_name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.participant_name}
                          </span>
                          {unread > 0 && (
                            <span style={{
                              background: 'var(--primary)',
                              color: '#ffffff',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-full)',
                              padding: '2px 6px',
                            }}>
                              {unread}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {conv.last_message || 'Start chatting...'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right: Message Stream & Input */}
          <main style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(22, 31, 48, 0.4)' }}>
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(11, 15, 25, 0.3)',
                }}>
                  <img
                    src={activeConv.participant_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'}
                    alt={activeConv.participant_name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeConv.participant_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{activeConv.participant_subtext}</div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map((m) => {
                    const isMe = m.sender_user_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '0.85rem 1.15rem',
                            borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            background: isMe ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.06)',
                            border: isMe ? 'none' : '1px solid var(--border-subtle)',
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            lineHeight: '1.5',
                            wordBreak: 'break-word',
                          }}
                        >
                          {m.content}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    gap: '0.75rem',
                    background: 'rgba(11, 15, 25, 0.5)',
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type your message and press Enter..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Select a conversation from the left to view messages
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
