// frontend/app/components/calendar.tsx
'use client';

import { isLeapYear } from "./leap_year";
import Link from "next/link";
import { useRef } from "react";

interface CalendarProps {
    events: Array<any>;
}

function isSameDate(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function CalMonth({ currentMonth, today }: any) {
    let displayedDay = new Date(today); // Kopie erstellen

    function handlePrevious() {
        displayedDay.setMonth(displayedDay.getMonth() - 1);
        displayedDay.setDate(1);
        console.log('previous: ', displayedDay);
        // Hier solltest du den Zustand aktualisieren, um die Anzeige zu ändern
    }

    function handleNext() {
        displayedDay.setMonth(displayedDay.getMonth() + 1);
        displayedDay.setDate(1);
        console.log('next: ', displayedDay);
        // Hier solltest du den Zustand aktualisieren, um die Anzeige zu ändern
    }

    return (
        <div className="month">
            <a href="#" onClick={handlePrevious} >&lt;</a>
            <p id="month-name">
                { currentMonth } { displayedDay.getFullYear() !== today.getFullYear() ? displayedDay.getFullYear() : null }
            </p>
            <a href="#" onClick={handleNext} >&gt;</a>
        </div>
    )
}

function CalDay({
    el, today, monthNames, currentMonth, events
}: any) {
    const busyDays: number[] = [];

    events.forEach((e: any) => {
        const e_date = new Date(e.date);

        if (
            e_date.getMonth() === today.getMonth() &&
            e_date.getFullYear() === today.getFullYear() &&
            !busyDays.includes(e_date.getDate())
        ) {
            busyDays.push(e_date.getDate());
        }
    });

    return el === 0 ? (
        <div className="el"></div>
    ) : (
        today.getDate() === el && monthNames[today.getMonth()] === currentMonth ? (
            busyDays.includes(el) ? (
                <div className="el today-busy"><div>{el}</div></div>
            ) : (
                <div className="el today"><div>{el}</div></div>
            )
        ) : (
            busyDays.includes(el) ? (
                <div className="el busy"><div>{el}</div></div>
            ) : (
                <div className="el"><div>{el}</div></div>
            )
        )
    )
}

function Cal({
    today, months, monthNames, currentMonth, events
}: any) {
    const monthDays: any = [['S', 'M', 'T', 'W', 'T', 'F', 'S'],];
    const lastDay = months[monthNames[today.getMonth()]];
    const firstDay = new Date(
            today.getFullYear(), today.getMonth(), 1
        ).getDay();
    const weeks = () => {
        let week: any = [];
        let currentDay = 1;

        while (currentDay <= lastDay) { // Ändere die Bedingung zu <=, um den letzten Tag einzuschließen
            if (currentDay === 1 && firstDay !== 0) {
                for (let i = 0; i < firstDay; i++) {
                    week.push(0);
                }
            }

            for (let i = week.length; i < 7; i++) {
                if (currentDay > lastDay) {
                    week.push(0);
                } else {
                    week.push(currentDay);
                    currentDay++;
                }
            }

            monthDays.push(week);
            week = [];
        }
    }

    weeks();

    return (
        <>
        <CalMonth currentMonth={currentMonth} today={today} />
        <div className="calendar-days">
            { monthDays.map((arr: any, i: number) => (
                <div key={i} className="week" >
                    { arr.map((el: any, index: number) => (
                        <CalDay
                            key={index}
                            el={el}
                            today={today}
                            monthNames={monthNames}
                            currentMonth={currentMonth}
                            events={events} />
                    )) }
                </div>
            )) }
        </div>
        </>
    )
}

function Day({
    day, today, days, currentMonth, childRefs, events
}: any) {
    const filteredEvents = events.filter(
        (event: any) => isSameDate(new Date(event.date), today)
    );

    return (
        <div className="day" ref={(el: any) => (childRefs.current[day - 1] = el)}>
            <ul className="date">
                <li>{ days[today.getDay()] }</li>
                <li>{ today.getDate() } { currentMonth.slice(0,3) }</li>
            </ul>
            <ul className="event-list">
                { filteredEvents.length === 0 ? (
                    <li className="events" key={0}>No events today</li>
                ) : (
                    filteredEvents.map((event: any, index: number) => (
                        <li className="events" key={index} >
                            {event.name}
                        </li>
                    ))
                ) }
            </ul>
        </div>
    )
}

export function Calendar({
    events
}: CalendarProps) {
    const today = new Date();
    const months = {'January': 31,
                    'February': isLeapYear(today.getFullYear()) ? 29 : 28,
                    'March': 31,
                    'April': 30,
                    'May': 31,
                    'June': 30,
                    'July': 31,
                    'August': 31,
                    'September': 30,
                    'October': 31,
                    'November': 30,
                    'December': 31 }
    const monthNames = Object.keys(months) as Array<keyof typeof months>;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentMonth = monthNames[today.getMonth()];
    const containerRef = useRef<HTMLDivElement>(null);
    const childRefs = useRef<(HTMLDivElement | null)[]>([]);

    let monthDays = Array.from({ length: months[currentMonth] }, (_, i) => i + 1);

    return (
        <>
        <Link href="../create-event/" className="add">Add event</Link>

        <div className="calendar-section">
            <div className="day-view" ref={containerRef}>
                { monthDays.map((day: any, index: number) => (
                    <Day
                        key={index}
                        day={day}
                        today={new Date(today.getFullYear(), today.getMonth(), day)}
                        days={days}
                        currentMonth={currentMonth}
                        childRefs={childRefs}
                        events={events} />
                )) }
            </div>
            
            <div className="calendar">
                <Cal
                    today={today}
                    months={months}
                    monthNames={monthNames}
                    currentMonth={currentMonth}
                    events={events} />
            </div>
        </div>
        </>
    )
}
