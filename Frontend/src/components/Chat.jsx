
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Chat.css';

const Chat = ({ itemId, itemType }) => {
  const { socket } = useSocket();
  const { userId } = useAuth();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userId || !itemId || !itemType) {
      console.log('Missing required data for starting chat:', { userId, itemId, itemType });
      return;
    }

    const startChat = async () => {
      try {
        console.log('Starting chat with payload:', { customerId: userId, itemId, itemType });
        const response = await axios.post(
          'http://localhost:8000/chat/start',
          { customerId: userId, itemId, itemType },
          { withCredentials: true }
        );
        console.log('Chat started:', response.data);
        setChatId(response.data.chatId);
        setMessages(response.data.messages || []);
        socket.emit('joinChat', response.data.chatId);
      } catch (error) {
        console.error('Error starting chat:', error.response?.status, error.response?.data || error.message);
        toast.error('Failed to start chat.');
      }
    };

    startChat();
  }, [userId, itemId, itemType, socket]);

  useEffect(() => {
    if (socket && chatId) {
      socket.on('newMessage', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => socket.off('newMessage');
    }
  }, [socket, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!chatId) {
      toast.error('Cannot send message: Chat not started.');
      return;
    }

    try {
      console.log('Sending message with payload:', { chatId, senderId: userId, content: newMessage });
      const response = await axios.post(
        'http://localhost:8000/chat/message',
        { chatId, senderId: userId, content: newMessage },
        { withCredentials: true }
      );
      console.log('Message sent:', response.data);
      setMessages((prev) => [...prev, response.data.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response?.status, error.response?.data || error.message);
      toast.error('Failed to send message.');
    }
  };

  if (!userId) {
    return <div className="chat-container">Please log in to start chatting.</div>;
  }

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chat with Vendor</h2>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
          >
            <p>{msg.content}</p>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;