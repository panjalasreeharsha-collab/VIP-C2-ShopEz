import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAiAssistant: { type: Boolean, default: false },
    messages: [messageSchema]
  },
  { timestamps: true }
);
const Chat = mongoose.model('Chat', chatSchema);
export default Chat;