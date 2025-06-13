import mongoose from 'mongoose';
import Chat from '../model/chat.model.js';
import Hotel from '../model/hotels.model.js';
import Caterer from '../model/caterers.model.js';
import Decorator from '../model/decorators.model.js';

// Start a new chat or retrieve existing chat
const startChat = async (req, res) => {
    try {
      const { customerId, itemId, itemType } = req.body;
  
      console.log('startChat payload:', { customerId, itemId, itemType });
  
      if (!customerId || !itemId || !itemType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const validItemTypes = ['Hotel', 'Caterer', 'Decorator'];
      if (!validItemTypes.includes(itemType)) {
        return res.status(400).json({ error: 'Invalid item type' });
      }
  
      let item;
      switch (itemType) {
        case 'Hotel':
          item = await Hotel.findById(itemId);
          break;
        case 'Caterer':
          item = await Caterer.findById(itemId);
          break;
        case 'Decorator':
          item = await Decorator.findById(itemId);
          break;
      }
  
      console.log('Item found:', item);
  
      if (!item) {
        return res.status(404).json({ error: `${itemType} not found` });
      }
  
      if (!item.vendorId) {
        return res.status(400).json({ error: 'No vendor assigned to this item' });
      }
  
      let chat = await Chat.findOne({ customerId, vendorId: item.vendorId, itemId, itemType });
      if (!chat) {
        chat = new Chat({
          customerId,
          vendorId: item.vendorId,
          itemId,
          itemType,
          messages: [],
        });
        await chat.save();
      }
  
      const io = req.app.get('io');
      io.to(`chat_${chat._id}`).emit('chatStarted', chat);
  
      res.status(200).json({ chatId: chat._id, messages: chat.messages });
    } catch (error) {
      console.error('Error starting chat:', error.message);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  };

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, content } = req.body;

    if (!chatId || !senderId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = {
      senderId,
      content,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // Emit message via Socket.IO
    const io = req.app.get('io');
    io.to(`chat_${chatId}`).emit('newMessage', message);

    res.status(200).json({ message: 'Message sent', data: message });
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get chat history
const getChats = async (req, res) => {
    try {
      const { userId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
  
      console.log('Fetching chats for userId:', userId);
  
      const chats = await Chat.find({
        $or: [
          { customerId: new mongoose.Types.ObjectId(userId) },
          { vendorId: new mongoose.Types.ObjectId(userId) },
        ],
      });
        // .populate('customerId', 'fullname email')
        // .populate('vendorId', 'fullname email');
  
        console.log('Chats found (before populate):', chats);

        // Populate only if chats exist, and handle missing references
        let populatedChats = chats;
        if (chats.length > 0) {
          populatedChats = await Chat.find({
            $or: [
              { customerId: new mongoose.Types.ObjectId(userId) },
              { vendorId: new mongoose.Types.ObjectId(userId) },
            ],
          })
            .populate('customerId', 'fullname email')
            .populate('vendorId', 'fullname email');
        }
    
        console.log('Chats found (after populate):', populatedChats);
    
        res.status(200).json(populatedChats || []);
      } catch (error) {
        console.error('Error fetching chats:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
      }
    };
    
    export { startChat, sendMessage, getChats };