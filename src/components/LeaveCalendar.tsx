"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { BiCalendar } from "react-icons/bi";
import moment from "moment";
import { fetchLeaves } from "@/lib/api/leave";
import LeaveModal from "./LeaveModal";
import {Card, List, message, Spin, Tag, Typography} from "antd";


const { Title, Text } = Typography;

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
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventData, setSelectedEventData] = useState<EventData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

        const loadLeaves = useCallback(async () => {
            setLoading(true);
            try {
                const result = await fetchLeaves();
                const leaves: Leave[] = result.data;

                const statusColorMap: { [key: string]: string } = {
                    'Approved': 'green',
                    'Pending': 'gold',
                    'Rejected': 'red',
                };

                const mappedEvents: Event[] = leaves.map((leave) => ({
                    title: `${leave.leave_type.type_name}`,
                    start: leave.start_date,
                    end: moment(leave.end_date).add(1, "day").format("YYYY-MM-DD"), // FullCalendar's end is exclusive
                    color: statusColorMap[leave.status?.status_name] || 'blue', // Default color
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
                message.error("Failed to fetch leaves data.");
            } finally {
                setLoading(false);
            }
        }, []);

        useEffect(() => {
            loadLeaves();
        }, [loadLeaves]);

    const handleModalClose = (shouldRefetch = false) => {
        setIsModalOpen(false);
        setSelectedEventData(null); // Clear data
        if (shouldRefetch) {
            loadLeaves();
        }
    };
    const handleEventClick = (info: any) => {
        const { id, employee, type, status, reason, applied_on, start, end } = info.event.extendedProps;
        setSelectedEventData({ id, employee, type, status, reason, applied_on, start, end });
        setIsModalOpen(true);
    };

    return (
        // === UI REFACTOR STARTS HERE ===
        <>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 m-4 mt-0">

                {/* 1. Main Calendar Section */}
                <div className="xl:col-span-9">
                    <Card bordered={false} className="shadow-lg rounded-xl h-full">
                        <Spin spinning={loading} tip="Loading Calendar...">
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
                                eventClick={handleEventClick}
                                height="auto" // Let the container control the height
                                dayMaxEvents={true} // For cleaner month view
                                // className="modern-calendar" // For custom CSS
                            />
                        </Spin>
                    </Card>
                </div>

                {/* 2. Upcoming Leaves Summary Section */}
                <div className="xl:col-span-3">
                    <Card bordered={false} className="shadow-lg rounded-xl h-full">
                        <Title level={4} className="!mb-4">Upcoming Leaves</Title>
                        <Spin spinning={loading}>
                            {events.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={events.slice(0, 5)} // Show first 5 upcoming
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                                        <BiCalendar size={20} />
                                                    </div>
                                                }
                                                title={<Text strong>{item.title}</Text>}
                                                description={
                                                    <Text type="secondary">
                                                        {moment(item.start).format("DD MMM")} - {moment(item.extendedProps?.end).format("DD MMM")}
                                                    </Text>
                                                }
                                            />
                                            <Tag color={item.color}>{item.extendedProps?.status}</Tag>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Text type="secondary">No upcoming leaves.</Text>
                            )}
                        </Spin>
                    </Card>
                </div>
            </div>

            {/* 3. Modal Integration */}
            <LeaveModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                data={selectedEventData}
            />
        </>
    );
};

export default LeaveCalendar;
