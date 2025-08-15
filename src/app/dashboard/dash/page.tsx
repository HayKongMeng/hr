"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components & Icons ---
import { Button, Card, Col, Form, Input, List, message, Modal, Radio, Row, Select, Space, Spin, Tabs, Tag, Upload } from "antd";

// --- Icons (from react-icons) ---
import { MdKeyboardArrowRight } from "react-icons/md";
import { CiEdit, CiSearch } from "react-icons/ci";
import { LuQrCode } from "react-icons/lu";
import { IoIosCheckboxOutline } from 'react-icons/io';

// --- FullCalendar ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";

// --- Custom Components & API ---
import MarkedAttendance from '@/components/MarkedAttendance'; // For Desktop
import QrCodeModal from "@/components/QrCodeModal"; // For Mobile
import AnnoucementCard from "@/components/card/AnnoucementCard"; // For Mobile
import LeaveRequestAdmin from "@/components/LeaveRequestAdmin"; // For Mobile
import { checkInAndOut, findEmployees, findEmployeesById } from "@/lib/api/attendances";
import { formattedDate, MappedAttendanceItem, processFullAttendanceData } from "@/lib/dateFormat";

// --- Responsive Hook ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", handleResize); handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);
    return isMobile;
};

// --- Main Page Component ---
const DashboardPage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    return isMobile ? <MobileView /> : <DesktopView />;
};

// --- Desktop View Sub-Component ---
const DesktopView = () => {
    const calendarRef = useRef<FullCalendar | null>(null);

    const goToDayView = (dateStr: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi && calendarApi.view.type !== 'timeGridDay') {
            calendarApi.changeView('timeGridDay', dateStr);
        }
    };

    const handleDateClick = (info: { dateStr: string; dayEl: HTMLElement; jsEvent: MouseEvent }) => {
        if ((info.jsEvent.target as HTMLElement).classList.contains('fc-daygrid-day-number')) {
            goToDayView(info.dateStr);
        }
    };

    const handleEventClick = (info: EventClickArg) => goToDayView(info.event.startStr);

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={18}>
                <Card title="Calendar">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        height="auto"
                        eventColor="#6FD943"
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        selectable={true}
                        selectMirror={true}
                        select={(info) => {
                            console.log(`Selected: ${moment(info.start).format("hh:mm A")} to ${moment(info.end).format("hh:mm A")}`);
                        }}
                    />
                </Card>
            </Col>
            <Col xs={24} lg={6}>
                <Card title="Today's Attendance">
                    <MarkedAttendance />
                </Card>
            </Col>
        </Row>
    );
};

// --- Mobile View Sub-Component ---
const MobileView = () => {
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);
    const [form] = Form.useForm();
    
    // All other states and functions from your HomePage
    const [buttonLoading, setButtonLoading] = useState(false);
    const [items, setItems] = useState<MappedAttendanceItem[]>([]);
    const [todayAttendance, setTodayAttendance] = useState({ checkIn: "--:--", checkOut: "--:--" });

    const employee_id = 1; // This should be dynamic
    
    const fetchMyAttendance = useCallback(() => {
        findEmployeesById(employee_id).then(result => {
            const { mappedItems, todayDetails } = processFullAttendanceData(result.data || []);
            setItems(mappedItems);
            setTodayAttendance(todayDetails);
        });
    }, [employee_id]);
    
    useEffect(() => {
        fetchMyAttendance();
    }, [fetchMyAttendance]);

    const handleQrScan = async (scan_code: string) => {
        // ... (your existing handleQrScan logic remains the same)
        setButtonLoading(true);
        try {
            const ipRes = await fetch("https://api.ipify.org/?format=json");
            const ipData = await ipRes.json();
            const type = todayAttendance.checkIn === "--:--" ? "checkin" : "checkout";
            
            // await checkInAndOut({ employee_id, type, scan_code, ip: ipData.ip });
            message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`);
            setIsQrModalOpen(false);
            fetchMyAttendance();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Operation failed.");
        } finally {
            setButtonLoading(false);
        }
    };
    
    const handlePostAnnouncement = (values: any) => {
        console.log("Announcement values:", values);
        message.success("Announcement posted successfully!");
        setAnnouncementModalOpen(false);
        form.resetFields();
    };

    const tabItems = [
        {
            key: '1',
            label: 'My Space',
            children: (
                <Space direction="vertical" size="large" className="w-full">
                    <Card>
                         <p className="text-center mb-2">{formattedDate}</p>
                         <Button
                            type="primary"
                            block
                            icon={<LuQrCode />}
                            loading={buttonLoading}
                            onClick={() => setIsQrModalOpen(true)}
                        >
                            {todayAttendance.checkIn !== "--:--" && todayAttendance.checkOut === "--:--" ? 'Check Out' : 'Check In'}
                        </Button>
                    </Card>
                    <Card title="Today's Summary">
                        <Row>
                            <Col span={12} className="text-center">
                                <div className="text-gray-500">Check In</div>
                                <div className="text-lg font-semibold">{todayAttendance.checkIn}</div>
                            </Col>
                            <Col span={12} className="text-center">
                                <div className="text-gray-500">Check Out</div>
                                <div className="text-lg font-semibold">{todayAttendance.checkOut}</div>
                            </Col>
                        </Row>
                    </Card>
                </Space>
            )
        },
        {
            key: '2',
            label: 'Organization',
            children: (
                 <Card title="Leave Requests">
                    <LeaveRequestAdmin checkedIds={[]} onCheck={() => {}} />
                 </Card>
            )
        },
        {
            key: '3',
            label: 'Announcements',
            children: (
                <Space direction="vertical" className="w-full">
                    <Button block icon={<CiEdit />} onClick={() => setAnnouncementModalOpen(true)}>Post Announcement</Button>
                    <Input.Search placeholder="Search..." />
                    <AnnoucementCard />
                </Space>
            )
        }
    ];

    return (
        <div>
            <Tabs defaultActiveKey="1" items={tabItems} centered />
            <QrCodeModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                onScan={handleQrScan}
            />
            <Modal
                title="Post Announcement"
                open={isAnnouncementModalOpen}
                onCancel={() => setAnnouncementModalOpen(false)}
                onOk={form.submit}
            >
                <Form form={form} layout="vertical" onFinish={handlePostAnnouncement}>
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input placeholder="Enter your title..." />
                    </Form.Item>
                    <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder="What's on your mind?" />
                    </Form.Item>
                    <Form.Item name="attachments" label="Attachments">
                        <Upload>
                            <Button>Click to Upload</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item name="publish_to" label="Publish to">
                         <Select mode="tags" placeholder="Type and enter to add recipients" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DashboardPage;