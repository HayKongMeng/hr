"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { BiCalendar } from "react-icons/bi";
import moment from "moment";
import { fetchLeaves } from "@/lib/api/leave";
import LeaveModal from "./LeaveModal";

type Leave = {
    id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    leave_type: {
        type_name: string;
    };
    status: {
        status_name: string;
    };
    applied_on: string;
};

type Event = {
    title: string;
    start: string;
    end: string;
    color?: string;
    extendedProps?: {
        id: number,
        employee: number;
        reason: string;
        type: string;
        start: string;
        end: string;
        status: string;
        applied_on: string;
    };
};

interface EventData {
    id: any;
    employee: any;
    type: any;
    status: any;
    reason: any;
    applied_on: any;
    start: any;
    end: any;
}

const LeaveCalendar = () => {
    const calendarRef = useRef<FullCalendar | null>(null);
    const [calendarType, setCalendarType] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [data, setData] = useState<EventData | null>(null);
    const [type, setType] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        const loadLeaves = async () => {
            try {
                const result = await fetchLeaves();
                const leaves: Leave[] = result.data;
                const mappedEvents: Event[] = leaves.map((leave) => ({
                title: `${leave.leave_type.type_name}`,
                start: leave.start_date,
                end: moment(leave.end_date).add(1, "day").format("YYYY-MM-DD"),
                    extendedProps: {
                        id: leave.id, 
                        employee: leave.employee_id,
                        type: leave.leave_type?.type_name,
                        status: leave.status?.status_name,
                        reason: leave.reason,
                        applied_on: leave.applied_on,
                        start: leave.start_date,
                        end: leave.end_date,
                    },
                }));

                setEvents(mappedEvents);
            } catch (error) {
                console.error("Failed to fetch leaves:", error);
            }
        };

        loadLeaves();
    }, []);

    const goToDayView = (dateStr: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi && calendarApi.view.type !== "timeGridDay") {
            calendarApi.changeView("timeGridDay", dateStr);
        }
    };

    const handleDateClick = (info: { dateStr: string }) => {
        goToDayView(info.dateStr);
    };

    const handleEventClick = (info: any) => {
        const { id, employee, type, status, reason, applied_on, start, end } = info.event.extendedProps;
        const eventData = {
            id,
            employee,
            type,
            status,
            reason,
            applied_on,
            start,
            end,
        };
        setData(eventData);
        setType("manageLeave");
        setOpen(true);
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row">
                {/* Calendar Section */}
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
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="auto"
                    />
                </div>
                </div>

                {/* Leaves Summary Section */}
                <div className="w-full lg:w-1/4 bg-white rounded-2xl m-4 mt-0 card-table">
                    <div className="flex items-center justify-between mt-5">
                        <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                            <h2 className="text-lg font-semibold">Leaves</h2>
                        </div>
                    </div>
                    <div className="space-y-4 px-4 py-1 text-gray-600 text-sm mt-4 mb-4">
                        {events.map((event, index) => (
                            <div
                                key={index}
                                className="flex items-start bg-white rounded-xl p-4 card-table"
                                style={{ borderColor: event.color }}
                            >
                                <div className="p-2 bg-[#6FD943] rounded-lg text-white">
                                    <BiCalendar size={24} />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-semibold text-[#6FD943]">
                                        {event.extendedProps?.type}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {moment(event.start).format("DD MMM YYYY, hh:mm A")} to{" "}
                                        {moment(event.end).subtract(1, "day").format("DD MMM YYYY, hh:mm A")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <LeaveModal isOpen={open} onClose={() => setOpen(false)} data={data} />
        </>
    );
};

export default LeaveCalendar;
