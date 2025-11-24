const mongoose = require('mongoose');
const chatSessionSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
    readingId: {type:mongoose.Schema.Types.ObjectId, ref: 'PalmReading'},
    messages: [{
        sender: {type: String, enum: ['user', 'fortuneTeller']},
        text: String,
        createdAt: {type: Date, default:Date.now}
    }],
    maxQuestions:{type:Number, default:3},
    questionAsked:{type:Number, default:0},
    isClosed: {type:Boolean, default:false}

});

module.exports = mongoose.model(chatSessionSchema, 'ChatSession');