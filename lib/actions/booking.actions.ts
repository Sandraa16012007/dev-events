'use server'

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";
import mongoose from "mongoose";

export const createBooking = async ({
    eventId,
    slug,
    email
}: {
    eventId: string;
    slug: string;
    email: string;
}) => {
    try {
        await connectDB();

        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return { success: false, error: "Invalid event ID" };
        }

        const objectId = new mongoose.Types.ObjectId(eventId);

        // ✅ Check event exists
        const eventExists = await Event.findById(objectId);
        if (!eventExists) {
            return { success: false, error: "Event does not exist" };
        }

        // ✅ Create booking
        await Booking.create({
            eventId: objectId,
            email
        });

        return { success: true };

    } catch (e: any) {
        // ✅ Handle duplicate booking
        if (e.code === 11000) {
            return { success: false, error: "You already booked this event" };
        }

        console.log("Booking failed:", e);
        return { success: false, error: e.message };
    }
};