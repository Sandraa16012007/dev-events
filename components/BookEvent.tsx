'use client'

import React, { useState } from 'react'
import { createBooking } from '@/lib/actions/booking.actions';
import posthog from 'posthog-js'

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await createBooking({ eventId, slug, email });

        if (res.success) {
            setSubmitted(true);
            setError('');
            posthog.capture('event_booked', { eventId, slug, email });
        } else {
            setError(res.error || "Booking failed");
            posthog.captureException(res.error || "Booking failed");
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className='text-sm text-green-600'>
                    ✅ Thank you for signing up!
                </p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enter your email address'
                            required
                        />
                    </div>

                    <button type="submit" className='button-submit'>
                        Submit
                    </button>

                    {error && (
                        <p className="text-red-500 text-sm mt-2">
                            ❌ {error}
                        </p>
                    )}
                </form>
            )}
        </div>
    )
}

export default BookEvent;