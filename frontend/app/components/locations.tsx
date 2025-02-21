import { useEffect, useState } from "react";
import Link from "next/link";


function Icons() {
    return (
        <div className="icons">
            <i className="material-icons">settings</i>
            <i className="material-icons">calendar_month</i>
        </div>
    )
}

function Today({ location, events }: any) {
    const [filteredEvents, setFilteredEvents] = useState<Array<any>>([]);

    useEffect(() => {
        if (!events || events.length === 0) setFilteredEvents([])
        else {
            const fe = events.filter((event: any) => (
                event.location === location
            ));

            if (!fe) setFilteredEvents([])
            else setFilteredEvents(fe);
        };
    }, [])
    
    return (
        <div className="today">
            <h4>Today</h4>
            <ul>
                { filteredEvents.length === 0 ? (
                    <li key={0}>No events today</li>
                ) : (
                    filteredEvents.map((event: any) => (
                        <li key={event.pk}>{ event.title }</li>
                    )
                )) }
            </ul>
        </div>
    )
}

function LocDetails({ address, plz, city }: any) {
    return (
        <div className="loc-details">
            <p>Address</p>
            <p>{ address }</p>
            <p>{ plz }</p>
            <p>{ city }</p>
        </div>
    )
}

function LocImage({ name }: any) {
    return (
        <div className="image">
            <div>
                <span>{ name }</span>
            </div>
        </div>
    )
}

export function Locations({ dataFetcher }: any) {
    const [locations, setLocations] = useState<Array<any>>([]);
    const [events, setEvents] = useState<Array<any>>([]);
    
    useEffect(() => {
        async function fetchData() {
            await dataFetcher.getData(
                'api/db/locations/',
                setLocations
            );
            await dataFetcher.getData(
                'api/calendar/user_schedule_list/',
                setEvents
            );
        }
        fetchData();
    }, [dataFetcher])

    return (
        <>
        <Link href="../create-location/">Add location</Link>
        { locations?.length !== 0 ? (
            <ul className="locations">
                { locations?.map((loc: any, index: number) => (
                    events?.length === 0 ? (
                        <li key={index}>
                            <LocImage name={loc.name} />
                            <LocDetails
                                address={loc.address}
                                plz={loc.plz}
                                city={loc.city} />
                            <Today
                                location={loc}
                                events={null} />
                            <Icons />
                        </li>
                    ) : (
                        <li key={index} className="events">
                            <LocImage name={loc.name} />
                            <LocDetails
                                address={loc.address}
                                plz={loc.plz}
                                city={loc.city} />
                            <Today
                                location={loc}
                                events={events} />
                            <Icons />
                        </li>
                    )
                )) }
            </ul>
        ) : (
            <p className="noloc">No locations yet</p>
        ) }
        </>
    )
}