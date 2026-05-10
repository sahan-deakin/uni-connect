const mongoose = require('mongoose');
 
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    organiser: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, enum: ['academic', 'career', 'social'], default: 'academic' },
    capacity: { type: Number, default: 50 },
    registered: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
});
 
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;