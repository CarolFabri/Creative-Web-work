const mongoose = require('mongoose'); 
const palmReadingSchema= new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false},
    imagePath: String,
    topics: String,
    readingText: String,
    createdAt: {type:Date, default: Date.now}
})

module.exports = mongoose.model('PalmReading', palmReadingSchema);

