import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  itemType: {
    type: String,
    enum: ['Hotel', 'Caterer', 'Decorator'],
    required: true,
  },
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;