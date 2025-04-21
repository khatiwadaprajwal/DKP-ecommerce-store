const User = require('../model/usermodel');
const Message = require('../model/sendmsg.model');

const sendMessage = async (req, res) => {
  const { name, email, msg } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    const newMsg = new Message({ name, email, msg });
    await newMsg.save();

    res.status(201).json({ message: 'Message sent successfully', data: newMsg });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

const getMessagesByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const messages = await Message.find({ email });

    if (messages.length === 0) {
      return res.status(404).json({ error: 'No messages found for this email' });
    }

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
  getMessagesByEmail
};
