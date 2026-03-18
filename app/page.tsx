import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent } from '@/database/event.model';

const page = async () => {
  let events = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, { 
      next: { revalidate: 60 } 
    });
    if (!response.ok) {
      console.error('Failed to fetch events:', response.status);
    } else {
      const data = await response.json();
      events = data.events ?? [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }

  return (
    <section>
      <h1 className="text-center mt-20">The Hub for all Developer Events <br /> around the world</h1>
      <p className="text-center mt-5">Hackathons, Meetups and Conferences, All in One Place. </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events list-none">
          {events && events.length > 0 && events.map((event: IEvent) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}

export default page
