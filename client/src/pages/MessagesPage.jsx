import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { MessageSquare, Send, User, Circle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

let socket;

const MessagesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [otherUserId, setOtherUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket = io(window.location.origin || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    if (user?.id) {
      socket.emit('user_online', user.id);
    }

    socket.on('online_users_list', (users) => {
      setOnlineUsers(users);
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing_start', () => {
      setIsTyping(true);
    });

    socket.on('typing_stop', () => {
      setIsTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const handleFetchHistory = async () => {
    if (!otherUserId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/v1/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (otherUserId && user?.id) {
      socket.emit('typing_start', { senderId: user.id, receiverId: otherUserId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { senderId: user.id, receiverId: otherUserId });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !otherUserId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/v1/messages',
        { receiverId: otherUserId, content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMsg = res.data.data;
      setMessages((prev) => [...prev, newMsg]);

      // Emit via socket
      socket.emit('send_message', {
        ...newMsg,
        receiverId: otherUserId,
      });

      socket.emit('typing_stop', { senderId: user?.id, receiverId: otherUserId });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  const isRecipientOnline = onlineUsers.includes(otherUserId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="glass-card rounded-3xl border border-slate-800 h-[620px] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Live Candidate-Recruiter Chat</h2>
                {otherUserId && (
                  <p className="text-[10px] flex items-center gap-1 font-semibold text-slate-400">
                    Status:{' '}
                    {isRecipientOnline ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" /> Online</span>
                    ) : (
                      <span className="text-slate-500">Offline</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Recipient User ID..."
                value={otherUserId}
                onChange={(e) => setOtherUserId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleFetchHistory}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition"
              >
                Load Chat
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/60">
            {messages.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                Enter recipient User ID and click "Load Chat" to begin messaging.
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.sender?._id === user?.id || m.sender === user?.id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl text-xs shadow-md ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div>{m.content}</div>
                      <div className="text-[9px] opacity-60 text-right mt-1">
                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 italic animate-pulse">
                  Recipient is typing...
                </div>
              </div>
            )}
          </div>

          {/* Send Box */}
          <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Type message..."
              value={text}
              onChange={handleInputChange}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MessagesPage;
