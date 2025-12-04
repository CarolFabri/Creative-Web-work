const mongoose = require('mongoose'); 
const palmReadingSchema= new mongoose.Schema({
    topic :{
        type: String,
        required: true,
        enum: ['love','career','health']
    },
    messages: {
    type: [String],     
    required: true
  },
    createdAt: {type:Date, default: Date.now}
})

module.exports = mongoose.model('PalmReading', palmReadingSchema);

