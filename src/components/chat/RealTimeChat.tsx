import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, Send } from 'lucide-react';

export default function RealTimeChat() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    { id: '1', user: 'Sarah Developer', text: 'Hey, when is the deadline for the e-commerce design?', timestamp: '10:00 AM' },
    { id: '2', user: 'John Manager', text: 'It is by this Friday, please make sure to update your progress!', timestamp: '10:05 AM' },
    { id: '3', user: 'Sarah Developer', text: 'Working on it! Almost finished.', timestamp: '10:10 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now().toString(),
      user: user?.name || 'Anonymous',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
        <MessageSquare size={20} />
        <h2 className="text-lg font-bold">Project Team Chat</h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMe = msg.user === user?.name;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-xl p-3 ${
                isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                {!isMe && <span className="text-xs font-bold block mb-1">{msg.user}</span>}
                <p className="text-sm">{msg.text}</p>
                <span className={`text-xs block text-right mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
