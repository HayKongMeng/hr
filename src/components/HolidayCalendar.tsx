"use client";

import { useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  formatDate,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from "@fullcalendar/core";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; 
import { BiCalendar } from "react-icons/bi";
import { fetchHolidays } from "@/lib/api/holidays";

type Holiday = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_recurring: number;
};

type Event = {
    title: string;
    start: string; // FullCalendar accepts ISO date strings or Date objects
    end: string;
    allDay?: boolean;
    recurring?: boolean;
};

export default function HolidayCalendar() {
    const [calendarType, setCalendarType] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [holidayList, setHolidayList] = useState<Holiday[]>([]);

    const calendarRef = useRef<FullCalendar | null>(null);

    const goToDayView = (dateStr: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentView = calendarApi.view.type;
            // Only change view if not already on day view
            if (currentView !== 'timeGridDay') {
                calendarApi.changeView('timeGridDay', dateStr);
            }
        }
    };

    const handleDateClick = (info: { dateStr: string; dayEl: HTMLElement; jsEvent: MouseEvent }) => {
        const target = info.jsEvent.target as HTMLElement;

        // Only go if the user clicked the number (not the cell background)
        if (target.classList.contains('fc-daygrid-day-number')) {
            goToDayView(info.dateStr);
        }
    };

    const handleEventClick = (info: EventClickArg) => {
        const eventDateStr = info.event.startStr;
        goToDayView(eventDateStr);
    };

    const handleDayHeaderMount = (args: any) => {
        const calendarApi = calendarRef.current?.getApi();
        const currentView = calendarApi?.view.type;

        if (currentView === 'timeGridWeek') {
            args.el.style.cursor = 'pointer';

            const clickHandler = () => {
                // Only allow view change if not already in timeGridDay
                if (calendarApi?.view.type !== 'timeGridDay') {
                    goToDayView(args.date.toISOString().split('T')[0]);
                }
            };

            args.el.addEventListener('click', clickHandler);

            // Cleanup to avoid multiple listeners
            args.el.dataset.clickAttached = "true";
        } else {
            args.el.style.cursor = 'default';
        }
    };

    useEffect(() => {
        async function loadHolidays() {
            try {
                const result = await fetchHolidays();
                const holidays: Holiday[] = result.data;

                const formatted = holidays.map((h) => ({
                    title: h.name + (h.is_recurring ? " (Recurring)" : ""),
                    start: h.start_date,
                    end: h.end_date,
                    allDay: true,
                    recurring: h.is_recurring === 1,
                }));

                setEvents(formatted);
                setHolidayList(holidays);
            } catch (error) {
                console.error("Failed to fetch holidays:", error);
            }
        }

        loadHolidays();
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Calendar section */}
            <div className="w-full lg:w-3/4 bg-white rounded-2xl m-4 mt-0 pb-5 card-table">
                <div className="flex items-center justify-between mt-5 mb-5 border-b">
                    <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                        <h2 className="text-lg font-semibold">Calendar</h2>
                    </div>
                    <div className="px-4 py-1 mb-5">
                       <select
                            value={calendarType}
                            onChange={(e) => setCalendarType(e.target.value)}
                            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {["Google Calendar", "Local Calendar"].map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="px-4 py-1">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={events}
                        height="auto"
                        eventColor="#51459d"
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        dayHeaderDidMount={handleDayHeaderMount}
                        selectable={true} // ✅ Allow selecting time slots
                        selectMirror={true} // Optional: shows temp selection
                        slotDuration="00:30:00" // ✅ 30 min intervals
                        select={(info) => {
                            const start = moment(info.start).format("hh:mm A");
                            const end = moment(info.end).format("hh:mm A");
                        }}
                    />
                </div>
            </div>

            {/* Holiday List section */}
            <div className="w-full lg:w-1/4 bg-white rounded-2xl m-4 mt-0 card-table">
                <div className="flex items-center justify-between mt-5">
                    <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                        <h2 className="text-lg font-semibold">Holiday List</h2>
                    </div>
                </div>
                <div className="space-y-4 px-4 py-1">
                    {holidayList.map((holiday) => (
                        <div
                            key={holiday.id}
                            className="flex items-start bg-white rounded-xl p-4 card-table"
                        >
                            <div className="p-2 bg-[#6FD943] rounded-lg text-white">
                                <BiCalendar size={24} />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-semibold text-green-800">
                                    {holiday.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                    Start Date: {moment(holiday.start_date).format("MMM DD, YYYY")}
                                </div>
                                <div className="text-xs text-gray-600">
                                    End Date: {moment(holiday.end_date).format("MMM DD, YYYY")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
