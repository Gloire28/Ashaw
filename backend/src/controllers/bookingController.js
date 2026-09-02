import * as bookingService from '../services/bookingService.js';
import { isValidDuration, isNonEmptyString } from '../utils/validators.js';

export const createBooking = async (req, res, next) => {
  try {
    const { conversationId, date, startTime, durationHours } = req.body;

    if (!date || !isNonEmptyString(startTime) || !isValidDuration(durationHours)) {
      res.status(400);
      throw new Error('Date, heure de début et durée (en heures) requises');
    }

    const booking = conversationId
      ? await bookingService.createBookingFromConversation(conversationId, req.body)
      : await bookingService.createManualBooking(req.body);

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const { status, productId, from, to } = req.query;
    const bookings = await bookingService.listBookings({ status, productId, from, to });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(req.params.id, status);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    await bookingService.deleteBooking(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
