const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    image: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    available: { type: Number, required: true },
    category: { type: String, required: true },
    transmission: { type: String, required: true },
    seats: { type: Number, required: true },
    features: [String]
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
