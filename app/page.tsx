import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent } from '@/database/event.model';

const page = async () => {

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, { next: { revalidate: 60 } });
  const {events} = await response.json();

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
