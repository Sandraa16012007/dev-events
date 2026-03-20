'use server'
import Event from '@/database/event.model'
import connectDB from '@/lib/mongodb';

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });

        if (!event) return [];

        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: {
                $in: Array.isArray(event.tags) ? event.tags : [event.tags]
            }
        }).lean();

        return similarEvents;

    } catch (e) {
        console.error("Error fetching similar events:", e);
        return [];
    }
}