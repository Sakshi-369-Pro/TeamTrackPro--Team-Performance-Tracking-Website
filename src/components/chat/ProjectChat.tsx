import { useState, useRef, useEffect } from 'react';
import { X, Send, Users, User, Paperclip, Smile, Video, Phone, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline?: boolean;
}

interface ProjectChatProps {
  isOpen: boolean;
  onClose: () => void;
  chatType: 'group' | 'individual';
  projectName: string;
  participants: ChatParticipant[];
  currentUserId: string;
}

export default function ProjectChat({ isOpen, onClose, chatType, projectName, participants, currentUserId }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock initial messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessages: Message[] = chatType === 'group' 
        ? [
            {
              id: '1',
              senderId: '2',
              senderName: 'Sarah Developer',
              senderAvatar: '👩‍💻',
              content: 'Hey team! Just finished the user authentication module. Ready for review.',
              timestamp: new Date(Date.now() - 3600000 * 2),
              type: 'text'
            },
            {
              id: '2',
              senderId: '3',
              senderName: 'Alex Designer',
              senderAvatar: '👨‍🎨',
              content: 'Great work Sarah! I\'ll prepare the Figma designs for the dashboard next.',
              timestamp: new Date(Date.now() - 3600000 * 1.5),
              type: 'text'
            },
            {
              id: '3',
              senderId: '4',
              senderName: 'Mike Backend',
              senderAvatar: '👨‍💼',
              content: 'API endpoints are ready. Documentation updated in the wiki.',
              timestamp: new Date(Date.now() - 3600000),
              type: 'text'
            }
          ]
        : [
            {
              id: '1',
              senderId: participants[0]?.id || '2',
              senderName: participants[0]?.name || 'Team Member',
              senderAvatar: participants[0]?.avatar || '👤',
              content: 'Hi! Thanks for reaching out. How can I help you with the project?',
              timestamp: new Date(Date.now() - 1800000),
              type: 'text'
            }
          ];
      
      setMessages(initialMessages);
    }
  }, [isOpen, chatType, participants, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'You',
      senderAvatar: '👨‍💼',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response for individual chat
    if (chatType === 'individual' && participants.length === 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          'Got it! I\'ll work on that right away.',
          'Thanks for the update. I\'ll review and get back to you.',
          'Perfect! The changes look good to me.',
          'I have a question about this requirement. Can we discuss?',
          'Completed! Please review when you have a chance.'
        ];
        
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: participants[0].id,
          senderName: participants[0].name,
          senderAvatar: participants[0].avatar,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur p-2.5 rounded-xl">
              {chatType === 'group' ? <Users size={22} /> : <User size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {chatType === 'group' ? `${projectName} - Team Chat` : participants[0]?.name || 'Direct Message'}
              </h3>
              <p className="text-sm text-white/80">
                {chatType === 'group' 
                  ? `${participants.length} members • ${participants.filter(p => p.isOnline).length} online`
                  : participants[0]?.role || 'Team Member'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Video size={20} />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <MoreVertical size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Participants Bar (for group chat) */}
        {chatType === 'group' && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Participants:</span>
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-1.5 bg-white dark:bg-gray-700 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                  <span className="text-sm">{participant.avatar}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{participant.name.split(' ')[0]}</span>
                  {participant.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
            
            return (
              <div key={message.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                {!isCurrentUser && showAvatar && (
                  <div className="text-2xl flex-shrink-0">{message.senderAvatar}</div>
                )}
                {!isCurrentUser && !showAvatar && (
                  <div className="w-8 flex-shrink-0"></div>
                )}
                
                <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                  {showAvatar && !isCurrentUser && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">
                      {message.senderName}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isCurrentUser ? 'mr-1' : 'ml-1'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="text-2xl">{participants[0]?.avatar}</div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-end gap-3">
            <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-400">
              <Paperclip size={20} />
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${chatType === 'group' ? 'team' : participants[0]?.name || 'member'}...`}
                className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 bottom-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                <Smile size={18} />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
