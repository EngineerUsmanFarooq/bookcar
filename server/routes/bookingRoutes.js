const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');

router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('carId').populate('userId');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).populate('carId').populate('userId');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Error fetching user bookings' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { userId, carId, startDate, endDate, startTime, endTime, totalAmount, needDriver, driverContact } = req.body;

        // Validate car availability
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        if (car.available <= 0) {
            return res.status(400).json({ message: 'Car is not available for booking' });
        }

        // Create booking
        const booking = new Booking({
            userId,
            carId,
            startDate,
            endDate,
            startTime,
            endTime,
            totalAmount,
            needDriver,
            driverContact,
            status: 'pending'
        });

        await booking.save();

        // Update car availability
        car.available -= 1;
        await car.save();

        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Error creating booking' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('carId').populate('userId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Error fetching booking' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        // If booking is cancelled, update car availability
        if (status === 'cancelled') {
            const car = await Car.findById(booking.carId);
            if (car) {
                car.available += 1;
                await car.save();
            }
        }

        res.json(booking);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Error updating booking' });
    }
});

module.exports = router;
