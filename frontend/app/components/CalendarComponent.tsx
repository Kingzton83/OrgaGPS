// frontend/app/components/CalendarComponent.tsx
'use client';

import { useState, useEffect } from "react";
import { Calendar } from "./calendar"; // Passe den Pfad an
import { DataFetcher } from "./get_data";
import { Schedule } from "./interfaces";

interface CalendarComponentProps {
    dataFetcher: DataFetcher;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ dataFetcher }) => {
    const [events, setEvents] = useState<Schedule[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSchedules() {
            try {
                const data = await dataFetcher.getUserSchedules();
                console.log("Fetched schedules:", data);
                if (data) {
                    setEvents(data);
                    setError(null);
                } else {
                    setEvents([]);
                    setError("No schedules found.");
                }
            } catch (err) {
                console.error("Error fetching schedules:", err);
                setError("Failed to fetch schedules.");
            } finally {
                setLoading(false);
            }
        }

        fetchSchedules();
    }, [dataFetcher]);

    if (loading) {
        return <div>Loading schedules...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <Calendar events={events} />;
};

export default CalendarComponent;
