// Vercel serverless function for updating virtue status
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  const connection = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  cachedDb = connection;
  return connection;
}

// Virtue Record Schema
const virtueRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  year: { type: Number, required: true },
  week: { type: Number, required: true },
  virtues: [{
    index: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    note: { type: String, default: '' }
  }],
  dailyReflection: {
    reflection: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true
});

const VirtueRecord = mongoose.models.VirtueRecord || mongoose.model('VirtueRecord', virtueRecordSchema);

// Authentication middleware
function authenticateToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }
  
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.verify(token, JWT_SECRET);
}

// Get current week number
function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

module.exports = async (req, res) => {
  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Connect to database
    await connectToDatabase();
    
    // Extract date from query parameter
    const date = req.query.date;
    if (!date) {
      return res.status(400).json({ message: '日期参数缺失' });
    }
    
    // Authenticate user
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    let user;
    try {
      user = authenticateToken(token);
    } catch (error) {
      return res.status(401).json({ message: '认证失败' });
    }
    
    // Validate input
    const { virtueIndex, completed, note = '' } = req.body;
    
    if (typeof virtueIndex !== 'number' || virtueIndex < 0 || virtueIndex > 12) {
      return res.status(400).json({ message: '美德索引必须在0-12之间' });
    }
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: '完成状态必须是布尔值' });
    }
    
    if (note && note.length > 500) {
      return res.status(400).json({ message: '笔记不能超过500个字符' });
    }
    
    // Parse date
    const recordDate = new Date(date);
    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({ message: '无效的日期格式' });
    }
    
    // Find or create record
    let record = await VirtueRecord.findOne({
      userId: user.userId,
      date: {
        $gte: new Date(recordDate.setHours(0, 0, 0, 0)),
        $lt: new Date(recordDate.setHours(23, 59, 59, 999))
      }
    });
    
    if (!record) {
      const year = recordDate.getFullYear();
      const week = getCurrentWeek();
      
      record = new VirtueRecord({
        userId: user.userId,
        date: new Date(recordDate.setHours(0, 0, 0, 0)),
        year,
        week,
        virtues: []
      });
    }
    
    // Update virtue
    const existingVirtueIndex = record.virtues.findIndex(v => v.index === virtueIndex);
    
    if (existingVirtueIndex >= 0) {
      record.virtues[existingVirtueIndex].completed = completed;
      record.virtues[existingVirtueIndex].note = note;
    } else {
      record.virtues.push({
        index: virtueIndex,
        completed,
        note
      });
    }
    
    await record.save();
    
    res.status(200).json({
      message: '美德记录更新成功',
      record: {
        date: record.date,
        virtues: record.virtues
      }
    });
    
  } catch (error) {
     console.error('Error updating virtue record:', error);
     res.status(500).json({ 
       message: '服务器内部错误',
       error: error.message 
     });
   }
 };