//sampleModel
// This is a sample model file. You can replace this with your actual Mongoose model definitions.

const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

const SampleModel = mongoose.model('Sample', sampleSchema);

module.exports = SampleModel;