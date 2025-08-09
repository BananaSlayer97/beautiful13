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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  week: {
    type: Number,
    required: true,
    min: 1
  },
  year: {
    type: Number,
    required: true
  },
  // 13项美德的完成状态
  virtues: {
    type: Map,
    of: {
      completed: { type: Boolean, default: false },
      note: { type: String, maxlength: 500, default: '' },
      timestamp: { type: Date, default: Date.now }
    },
    default: function() {
      const virtuesMap = new Map();
      for (let i = 0; i < 13; i++) {
        virtuesMap.set(i.toString(), {
          completed: false,
          note: '',
          timestamp: new Date()
        });
      }
      return virtuesMap;
    }
  },
  // 当日重点美德
  focusVirtue: {
    type: Number,
    min: 0,
    max: 12,
    default: null
  },
  // 当日总体感悟
  dailyReflection: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  // 当日评分 (1-5)
  dailyRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  // 统计信息
  stats: {
    completedCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
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
    
    // Validate input - only extract expected fields
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
    
    // Ensure we don't accidentally set other fields from request body
    const allowedFields = ['virtueIndex', 'completed', 'note'];
    const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      console.warn('Ignoring unexpected fields in virtue update:', extraFields);
    }
    
    // Parse date
    const recordDate = new Date(date);
    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({ message: '无效的日期格式' });
    }
    
    // Find or create record using lean() to avoid validation errors on corrupted data
    let recordData = await VirtueRecord.findOne({
      userId: user.userId,
      date: {
        $gte: new Date(recordDate.setHours(0, 0, 0, 0)),
        $lt: new Date(recordDate.setHours(23, 59, 59, 999))
      }
    }).lean();
    
    let record;
    if (recordData) {
      // Fix any corrupted dailyReflection data before creating the document
      if (recordData.dailyReflection && typeof recordData.dailyReflection === 'object') {
        console.warn('Found corrupted dailyReflection data, fixing:', recordData.dailyReflection);
        if (recordData.dailyReflection.reflection !== undefined) {
          recordData.dailyReflection = recordData.dailyReflection.reflection || '';
        } else {
          recordData.dailyReflection = '';
        }
      }
      
      // Fix any corrupted virtues data (convert array to Map)
      if (recordData.virtues && Array.isArray(recordData.virtues)) {
        console.warn('Found corrupted virtues data (array format), converting to Map:', recordData.virtues);
        const virtuesMap = new Map();
        recordData.virtues.forEach(virtue => {
          if (virtue.index !== undefined) {
            virtuesMap.set(virtue.index.toString(), {
              completed: virtue.completed || false,
              note: virtue.note || '',
              timestamp: virtue.timestamp || new Date()
            });
          }
        });
        recordData.virtues = virtuesMap;
      }
      
      // Create a new document instance with cleaned data
      record = new VirtueRecord(recordData);
    }
    
    if (!record) {
      const year = recordDate.getFullYear();
      const week = getCurrentWeek();
      
      record = new VirtueRecord({
        userId: user.userId,
        date: new Date(recordDate.setHours(0, 0, 0, 0)),
        year,
        week,
        // Explicitly set default values to prevent any contamination
        dailyReflection: '',
        dailyRating: null
      });
    }
    
    // Update virtue using Map structure
    const virtue = record.virtues.get(virtueIndex.toString()) || {
      completed: false,
      note: '',
      timestamp: new Date()
    };
    
    virtue.completed = completed;
    virtue.note = note;
    virtue.timestamp = new Date();
    
    record.virtues.set(virtueIndex.toString(), virtue);
    
    // Fix any existing dailyReflection data format issues
    if (record.dailyReflection && typeof record.dailyReflection === 'object') {
      console.warn('Found object-type dailyReflection, converting to string:', record.dailyReflection);
      if (record.dailyReflection.reflection !== undefined) {
        record.dailyReflection = record.dailyReflection.reflection || '';
      } else {
        record.dailyReflection = '';
      }
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