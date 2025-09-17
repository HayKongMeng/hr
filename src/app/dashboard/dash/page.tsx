// "use client";
//
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useRouter } from "next/navigation";
// import moment from "moment";
//
// // --- Ant Design Components & Icons ---
// import { Button, Card, Col, Form, Input, List, message, Modal, Radio, Row, Select, Space, Spin, Tabs, Tag, Upload } from "antd";
//
// // --- Icons (from react-icons) ---
// import { MdKeyboardArrowRight } from "react-icons/md";
// import { CiEdit, CiSearch } from "react-icons/ci";
// import { LuQrCode } from "react-icons/lu";
// import { IoIosCheckboxOutline } from 'react-icons/io';
//
// // --- FullCalendar ---
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
//
// // --- Custom Components & API ---
// import MarkedAttendance from '@/components/MarkedAttendance'; // For Desktop
// import QrCodeModal from "@/components/QrCodeModal"; // For Mobile
// import AnnoucementCard from "@/components/card/AnnoucementCard"; // For Mobile
// import LeaveRequestAdmin from "@/components/LeaveRequestAdmin"; // For Mobile
// import { checkInAndOut, findEmployees, findEmployeesById } from "@/lib/api/attendances";
// import { formattedDate, MappedAttendanceItem, processFullAttendanceData } from "@/lib/dateFormat";
//
// // --- Responsive Hook ---
// const useIsMobile = (breakpoint = 768) => {
//     const [isMobile, setIsMobile] = useState(false);
//     useEffect(() => {
//         if (typeof window === "undefined") return;
//         const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
//         window.addEventListener("resize", handleResize); handleResize();
//         return () => window.removeEventListener("resize", handleResize);
//     }, [breakpoint]);
//     return isMobile;
// };
//
// // --- Main Page Component ---
// const DashboardPage = () => {
//     const isMobile = useIsMobile();
//     const [isClient, setIsClient] = useState(false);
//     useEffect(() => { setIsClient(true); }, []);
//
//     if (!isClient) {
//         return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
//     }
//
//     return isMobile ? <MobileView /> : <DesktopView />;
// };
//
// // --- Desktop View Sub-Component ---
// const DesktopView = () => {
//     const calendarRef = useRef<FullCalendar | null>(null);
//
//     const goToDayView = (dateStr: string) => {
//         const calendarApi = calendarRef.current?.getApi();
//         if (calendarApi && calendarApi.view.type !== 'timeGridDay') {
//             calendarApi.changeView('timeGridDay', dateStr);
//         }
//     };
//
//     const handleDateClick = (info: { dateStr: string; dayEl: HTMLElement; jsEvent: MouseEvent }) => {
//         if ((info.jsEvent.target as HTMLElement).classList.contains('fc-daygrid-day-number')) {
//             goToDayView(info.dateStr);
//         }
//     };
//
//     const handleEventClick = (info: EventClickArg) => goToDayView(info.event.startStr);
//
//     return (
//         <Row gutter={[16, 16]}>
//             <Col xs={24} lg={18}>
//                 <Card title="Calendar">
//                     <FullCalendar
//                         ref={calendarRef}
//                         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//                         initialView="dayGridMonth"
//                         headerToolbar={{
//                             left: 'prev,next today',
//                             center: 'title',
//                             right: 'dayGridMonth,timeGridWeek,timeGridDay'
//                         }}
//                         height="auto"
//                         eventColor="#6FD943"
//                         dateClick={handleDateClick}
//                         eventClick={handleEventClick}
//                         selectable={true}
//                         selectMirror={true}
//                         select={(info) => {
//                             console.log(`Selected: ${moment(info.start).format("hh:mm A")} to ${moment(info.end).format("hh:mm A")}`);
//                         }}
//                     />
//                 </Card>
//             </Col>
//             <Col xs={24} lg={6}>
//                 <Card title="Today's Attendance">
//                     <MarkedAttendance />
//                 </Card>
//             </Col>
//         </Row>
//     );
// };
//
// // --- Mobile View Sub-Component ---
// const MobileView = () => {
//     const [isQrModalOpen, setIsQrModalOpen] = useState(false);
//     const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);
//     const [form] = Form.useForm();
//
//     // All other states and functions from your HomePage
//     const [buttonLoading, setButtonLoading] = useState(false);
//     const [items, setItems] = useState<MappedAttendanceItem[]>([]);
//     const [todayAttendance, setTodayAttendance] = useState({ checkIn: "--:--", checkOut: "--:--" });
//
//     const [employeeId, setEmployeeId] = useState<number | null>(null);
//
//       useEffect(() => {
//         const storeEmployeeId = localStorage.getItem('employee_id');
//         if (storeEmployeeId) {
//             setEmployeeId(Number(storeEmployeeId));
//         }
//       }, []);
//     const fetchMyAttendance = useCallback(() => {
//         if (!employeeId) {
//             console.error("Employee ID is not set.");
//             return;
//         }
//         findEmployeesById(employeeId).then(result => {
//             const { mappedItems, todayDetails } = processFullAttendanceData(result.data || []);
//             setItems(mappedItems);
//             setTodayAttendance(todayDetails);
//         });
//     }, [employeeId]);
//
//     useEffect(() => {
//         fetchMyAttendance();
//     }, [fetchMyAttendance]);
//
//     const handleQrScan = async (scan_code: string) => {
//         // ... (your existing handleQrScan logic remains the same)
//         setButtonLoading(true);
//         try {
//             const ipRes = await fetch("https://api.ipify.org/?format=json");
//             const ipData = await ipRes.json();
//             const type = todayAttendance.checkIn === "--:--" ? "checkin" : "checkout";
//
//             // await checkInAndOut({ employee_id, type, scan_code, ip: ipData.ip });
//             message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`);
//             setIsQrModalOpen(false);
//             fetchMyAttendance();
//         } catch (err: any) {
//             message.error(err?.response?.data?.message || "Operation failed.");
//         } finally {
//             setButtonLoading(false);
//         }
//     };
//
//     const handlePostAnnouncement = (values: any) => {
//         console.log("Announcement values:", values);
//         message.success("Announcement posted successfully!");
//         setAnnouncementModalOpen(false);
//         form.resetFields();
//     };
//
//     const tabItems = [
//         {
//             key: '1',
//             label: 'My Space',
//             children: (
//                 <Space direction="vertical" size="large" className="w-full">
//                     <Card>
//                          <p className="text-center mb-2">{formattedDate}</p>
//                          <Button
//                             type="primary"
//                             block
//                             icon={<LuQrCode />}
//                             loading={buttonLoading}
//                             onClick={() => setIsQrModalOpen(true)}
//                         >
//                             {todayAttendance.checkIn !== "--:--" && todayAttendance.checkOut === "--:--" ? 'Check Out' : 'Check In'}
//                         </Button>
//                     </Card>
//                     <Card title="Today's Summary">
//                         <Row>
//                             <Col span={12} className="text-center">
//                                 <div className="text-gray-500">Check In</div>
//                                 <div className="text-lg font-semibold">{todayAttendance.checkIn}</div>
//                             </Col>
//                             <Col span={12} className="text-center">
//                                 <div className="text-gray-500">Check Out</div>
//                                 <div className="text-lg font-semibold">{todayAttendance.checkOut}</div>
//                             </Col>
//                         </Row>
//                     </Card>
//                 </Space>
//             )
//         },
//         {
//             key: '2',
//             label: 'Organization',
//             children: (
//                  <Card title="Leave Requests">
//                     <LeaveRequestAdmin checkedIds={[]} onCheck={() => {}} />
//                  </Card>
//             )
//         },
//         {
//             key: '3',
//             label: 'Announcements',
//             children: (
//                 <Space direction="vertical" className="w-full">
//                     <Button block icon={<CiEdit />} onClick={() => setAnnouncementModalOpen(true)}>Post Announcement</Button>
//                     <Input.Search placeholder="Search..." />
//                     <AnnoucementCard />
//                 </Space>
//             )
//         }
//     ];
//
//     return (
//         <div>
//             <Tabs defaultActiveKey="1" items={tabItems} centered />
//             <QrCodeModal
//                 isOpen={isQrModalOpen}
//                 onClose={() => setIsQrModalOpen(false)}
//                 onScan={handleQrScan}
//             />
//             <Modal
//                 title="Post Announcement"
//                 open={isAnnouncementModalOpen}
//                 onCancel={() => setAnnouncementModalOpen(false)}
//                 onOk={form.submit}
//             >
//                 <Form form={form} layout="vertical" onFinish={handlePostAnnouncement}>
//                     <Form.Item name="title" label="Title" rules={[{ required: true }]}>
//                         <Input placeholder="Enter your title..." />
//                     </Form.Item>
//                     <Form.Item name="message" label="Message" rules={[{ required: true }]}>
//                         <Input.TextArea rows={4} placeholder="What's on your mind?" />
//                     </Form.Item>
//                     <Form.Item name="attachments" label="Attachments">
//                         <Upload>
//                             <Button>Click to Upload</Button>
//                         </Upload>
//                     </Form.Item>
//                     <Form.Item name="publish_to" label="Publish to">
//                          <Select mode="tags" placeholder="Type and enter to add recipients" />
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </div>
//     );
// };
//
// export default DashboardPage;
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import {
    Card,
    Typography,
    Button,
    Modal,
    Form,
    Input,
    Radio,
    Spin,
    message,
    Row,
    Col,
    Avatar,
    Empty,
    Space,
    Flex,
    Layout, // <-- Added for better structure
    Tag, ButtonProps, ConfigProvider,
} from 'antd';
import { LuBuilding, LuCalendarDays, LuLogIn, LuLogOut, LuMegaphone, LuQrCode, LuUser } from "react-icons/lu";
import { CiEdit, CiSearch } from "react-icons/ci";
import QrCodeModal from "@/components/QrCodeModal";
import LeaveRequestAdmin from "@/components/LeaveRequestAdmin";
import AnnoucementCard from "@/components/card/AnnoucementCard";
import FileUpload from "@/components/FileUpload";
import ChipInput from "@/components/ChipInput";
import { useAuth } from "@/lib/AuthContext";
import { getEmployeeById } from "@/lib/api/employee";
import { checkInAndOut, findEmployees, findEmployeesById } from "@/lib/api/attendances";
import { formattedDate, MappedAttendanceItem, processFullAttendanceData } from "@/lib/dateFormat";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// --- TYPE DEFINITIONS ---
type Employee = { id: number; name: string; email: string; image_url: string | null; position?: { title: string; }; };
type PendingAttendanceData = { type: 'checkin' | 'checkout'; latitude: number; longitude: number; scan_code: string; ip: string; };

type ButtonConfig = {
    label: string;
    type: ButtonProps['type'];
    disabled: boolean;
    danger?: boolean;
    className: string;
};

const StatisticItem = ({ icon, title, value, colorClass }: { icon: React.ReactNode, title: string, value: string, colorClass: string }) => (
    <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <Text type="secondary">{title}</Text>
            <Title level={5} style={{ margin: 0 }}>{value}</Title>
        </div>
    </div>
);
const AttendanceCard = ({ items }: { items: MappedAttendanceItem[] }) => (
    <Space direction="vertical" className="w-full">
        {items.slice(0, 3).map(item => (
            <div key={item.date} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                    <Text strong>{item.date}</Text><br /><Text type="secondary">{item.day}</Text>
                </div>
                <Space>
                    <Tag color={item.status === 'Late' ? 'orange' : 'green'} bordered={false}>{item.checkIn}</Tag>
                    <Tag color="blue" bordered={false}>{item.checkOut}</Tag>
                </Space>
            </div>
        ))}
    </Space>
);
const LeaveStatus = ({ employeeId }: { employeeId?: number; userRole?: string; showActions: boolean; }) => (
    <Empty description="No recent leave data." />
);

const HomePage = () => {
    // --- STATE MANAGEMENT ---
    const { user, employee, loading: authLoading, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [byEmployee, setByEmployee] = useState<Employee | null>(null);
    const [items, setItems] = useState<MappedAttendanceItem[]>([]);
    const [itemsEmployee, setItemsEmployee] = useState<MappedAttendanceItem[]>([]);
    const [todayAttendance, setTodayAttendance] = useState({ checkIn: "--:--", checkInStatus: "-", checkOut: "--:--", checkOutStatus: "-" });
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isAnnoucementModalOpen, setIsAnnoucementModalOpen] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [pendingAttendanceData, setPendingAttendanceData] = useState<PendingAttendanceData | null>(null);
    const [reasonForm] = Form.useForm();
    const [announcementForm] = Form.useForm();
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [selectedOption, setSelectedOption] = useState("MySpace");
    const isAdminRole = user?.roles.includes('Admin');
    const currentEmployeeId = employee?.data?.id;

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !currentEmployeeId) return;
        setLoading(true);
        try {
            const [employeeRes, personalAttendanceRes] = await Promise.all([ getEmployeeById(currentEmployeeId), findEmployeesById(currentEmployeeId) ]);
            if (employeeRes.data.result) setByEmployee(employeeRes.data.result.data);
            const { mappedItems, todayDetails } = processFullAttendanceData(personalAttendanceRes.data || []);
            setItems(mappedItems);
            setTodayAttendance(todayDetails);
            if (isAdminRole) {
                const orgAttendanceRes = await findEmployees();
                const { mappedItems: orgMappedItems } = processFullAttendanceData(orgAttendanceRes.data || []);
                setItemsEmployee(orgMappedItems);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            message.error("Could not load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, currentEmployeeId, isAdminRole]);

    useEffect(() => { if (!authLoading) fetchData(); }, [authLoading, fetchData]);

    // --- TIMER & STATUS LOGIC ---
    const checkStatus = getTodayCheckStatus(items);

    const calculateRemainingTime = useCallback((checkInTime: string) => {
        if (!checkInTime || checkInTime === "--:--" || checkInTime === "-") return 0;
        try {
            const today = new Date();
            const [time, period] = checkInTime.split(" ");
            const [hours, minutes] = time.split(":");
            let hour24 = parseInt(hours);
            if (period?.toLowerCase() === "pm" && hour24 !== 12) hour24 += 12; else if (period?.toLowerCase() === "am" && hour24 === 12) hour24 = 0;
            const checkInDateTime = new Date(today);
            checkInDateTime.setHours(hour24, parseInt(minutes), 0, 0);
            const enableTime = new Date(checkInDateTime.getTime() + 60 * 1000); // 1 minute cooldown
            return Math.max(0, Math.floor((enableTime.getTime() - new Date().getTime()) / 1000));
        } catch (e) { return 0; }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (checkStatus === "checkedIn" && timeRemaining > 0) {
            setIsTimerActive(true);
            interval = setInterval(() => setTimeRemaining(prev => { if (prev <= 1) { setIsTimerActive(false); return 0; } return prev - 1; }), 1000);
        } else setIsTimerActive(false);
        return () => { if (interval) clearInterval(interval); };
    }, [checkStatus, timeRemaining]);

    useEffect(() => {
        if (checkStatus === "checkedIn" && todayAttendance.checkIn) setTimeRemaining(calculateRemainingTime(todayAttendance.checkIn));
        else { setTimeRemaining(0); setIsTimerActive(false); }
    }, [todayAttendance.checkIn, checkStatus, calculateRemainingTime]);

    function getTodayCheckStatus(items: MappedAttendanceItem[]): "checkedIn" | "checkedOut" | "notCheckedIn" {
        const todayEntry = items.find(item => item.dateForCompare === moment().format("YYYY-MM-DD"));
        if (todayEntry) {
            if (todayEntry.checkIn !== "--:--" && todayEntry.checkOut === "--:--") return "checkedIn";
            if (todayEntry.checkIn !== "--:--" && todayEntry.checkOut !== "--:--") return "checkedOut";
        }
        return "notCheckedIn";
    }

    // --- HANDLERS (WITH FULL LOGIC) ---
    const handleQrScan = async (scan_code: string) => {
        setIsQrModalOpen(false);
        if (!currentEmployeeId) { message.error("Employee ID not found."); return; }
        setButtonLoading(true);
        try {
            const ipRes = await fetch("https://api.ipify.org/?format=json");
            const ipData = await ipRes.json();
            const type = checkStatus === "checkedIn" ? "checkout" : "checkin";
            let latitude = 0, longitude = 0;
            if (navigator.geolocation) {
                await new Promise<void>(resolve => navigator.geolocation.getCurrentPosition(pos => { latitude = pos.coords.latitude; longitude = pos.coords.longitude; resolve(); }, () => resolve()));
            }
            const res = await checkInAndOut({ employee_id: currentEmployeeId, type, latitude, longitude, scan_code, ip: ipData.ip });
            if (res.success) {
                message.success(`${type === "checkin" ? "Check-in" : "Check-out"} successful!`);
                fetchData();
            } else {
                message.warning(res.message || "IP Mismatch. Please provide a reason.");
                setPendingAttendanceData({ type, latitude, longitude, scan_code, ip: ipData.ip });
                setIsReasonModalOpen(true);
            }
        } catch (err: any) {
            message.warning("IP address mismatch. Please provide a reason.");
            const ipRes = await fetch("https://api.ipify.org/?format=json");
            const ipData = await ipRes.json();
            const type = checkStatus === "checkedIn" ? "checkout" : "checkin";
            setPendingAttendanceData({ type, latitude: 0, longitude: 0, scan_code, ip: ipData.ip });
            setIsReasonModalOpen(true);
        } finally {
            setButtonLoading(false);
        }
    };

    const handleReasonSubmit = async (values: { reason: string }) => {
        if (!pendingAttendanceData || !currentEmployeeId) { message.error("Pending data is missing."); return; }
        setButtonLoading(true);
        try {
            const res = await checkInAndOut({ employee_id: currentEmployeeId, ...pendingAttendanceData, reason: values.reason });
            if (res.success) {
                message.success(`${pendingAttendanceData.type === "checkin" ? "Check-in" : "Check-out"} successful!`);
                setIsReasonModalOpen(false);
                reasonForm.resetFields();
                setPendingAttendanceData(null);
                fetchData();
            } else {
                message.error(res.message || "Submission failed.");
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message || err?.message || "An error occurred.");
        } finally {
            setButtonLoading(false);
        }
    };
    const formatTime = (seconds: number): string => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    const getButtonConfig = (): ButtonConfig => {
        const baseClasses = "text-white font-semibold transform transition-transform duration-200 hover:scale-105";
        switch (checkStatus) {
            case "checkedIn":
                if (isTimerActive && timeRemaining > 0) return { label: `Check Out (${formatTime(timeRemaining)})`, type: "default", disabled: true, className: `bg-gray-400 cursor-not-allowed ${baseClasses}` };
                return { label: "Check Out", type: "primary", disabled: false, danger: true, className: `bg-orange-500 hover:bg-orange-600 ${baseClasses}` };
            case "checkedOut":
                return { label: "Completed", type: "default", disabled: true, className: `bg-gray-400 cursor-not-allowed ${baseClasses}` };
            default:
                return { label: "Check In", type: "primary", disabled: false, className: `bg-green-500 hover:bg-green-600 animate-pulse ${baseClasses}` };
        }
    };
    const buttonConfig = getButtonConfig();

    if (authLoading || loading) return <div className="min-h-screen w-full flex justify-center items-center"><Spin size="large" /></div>;

    return (
        <Layout.Content className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-2xl mb-6 shadow-lg overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-12 -left-8 w-48 h-48 bg-white/10 rounded-full"></div>
                <Row gutter={[16, 16]} justify="space-between" align="middle" className="relative z-10">
                    <Col>
                        <Space align="center" size={16}>
                            <Avatar size={64} src={byEmployee?.image_url || "/avatar.png"} className="border-2 border-white/50" />
                            <div>
                                <Title level={4} style={{ margin: 0, color: 'white' }}>Welcome back, {byEmployee?.name || "User"}!</Title>
                                <Text className="text-white/80">{byEmployee?.position?.title || "Employee"}</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            type={buttonConfig.type}
                            danger={buttonConfig.danger}
                            size="large"
                            icon={<LuQrCode size={20} />}
                            loading={buttonLoading}
                            disabled={buttonConfig.disabled}
                            onClick={() => setIsQrModalOpen(true)}
                            className={buttonConfig.className} // Apply dynamic classes
                            style={{ height: '50px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center' }}
                        >
                            <span className="ml-2">{buttonConfig.label}</span>
                        </Button>
                    </Col>
                </Row>
            </div>

            {isAdminRole && (
                <div className="mb-6 flex justify-center">
                    <ConfigProvider
                        theme={{
                            components: {
                                Radio: {
                                    colorPrimary: '#1677ff',
                                    colorPrimaryHover: '#0958d9',
                                    // colorBgContainerHover: '#e6f4ff',
                                },
                            },
                        }}
                    >
                        <Radio.Group
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            size="large"
                        >
                            <Radio.Button value="MySpace">
                                <LuUser className="inline-block mr-2" />
                                My Space
                            </Radio.Button>
                            <Radio.Button value="Organization">
                                <LuBuilding className="inline-block mr-2" />
                                Organization
                            </Radio.Button>
                            <Radio.Button value="Annoucement">
                                <LuMegaphone className="inline-block mr-2" />
                                Announcement
                            </Radio.Button>
                        </Radio.Group>
                    </ConfigProvider>
                </div>
            )}

            {selectedOption === "MySpace" && (
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card className="shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-lg">
                            <Row gutter={[16, 16]} align="middle">
                                <Col xs={24} md={8}><StatisticItem icon={<LuCalendarDays size={24} className="text-blue-500" />} title="Date" value={formattedDate} colorClass="bg-blue-100" /></Col>
                                <Col xs={12} md={8}><StatisticItem icon={<LuLogIn size={24} className="text-green-500" />} title="Check In" value={todayAttendance.checkIn} colorClass="bg-green-100" /></Col>
                                <Col xs={12} md={8}><StatisticItem icon={<LuLogOut size={24} className="text-orange-500" />} title="Check Out" value={todayAttendance.checkOut} colorClass="bg-orange-100" /></Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Recent Attendance" extra={<Button type="link">View More</Button>} className="shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-lg h-full">
                            {items.length > 0 ? <AttendanceCard items={items} /> : <Empty description="No recent attendance data." />}
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Leave Status" extra={<Button type="link">View More</Button>} className="shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-lg h-full">
                            <LeaveStatus showActions={false} userRole={user?.roles[0]} employeeId={currentEmployeeId} />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Other tabs remain the same */}

            {isAdminRole && selectedOption === "Organization" && (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}><Card title="Team Attendance" extra={<Button type="link">View More</Button>} className="shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-lg h-full">{itemsEmployee.length > 0 ? <AttendanceCard items={itemsEmployee} /> : <Empty description="No attendance data for the team." />}</Card></Col>
                    <Col xs={24} lg={12}><Card title="Leave Requests" extra={<Button type="link">View More</Button>} className="shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-lg h-full"><LeaveRequestAdmin checkedIds={[]} onCheck={() => {}} /></Card></Col>
                </Row>
            )}

            {isAdminRole && selectedOption === "Annoucement" && (
                <Card className="shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-lg">
                    <Flex vertical gap="large">
                        <Row gutter={16} justify="space-between" align="middle">
                            <Col flex="auto"><Input placeholder="Search announcements..." prefix={<CiSearch />} size="large" /></Col>
                            <Col><Button type="primary" icon={<CiEdit />} size="large" onClick={() => setIsAnnoucementModalOpen(true)}>Post Announcement</Button></Col>
                        </Row>
                        <AnnoucementCard />
                    </Flex>
                </Card>
            )}

            <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} onScan={handleQrScan}/>

            <Modal
                title="Reason for IP Mismatch"
                open={isReasonModalOpen}
                onCancel={() => setIsReasonModalOpen(false)}
                confirmLoading={buttonLoading}
                onOk={() => reasonForm.submit()}
                okText="Submit"
            >
                <Paragraph type="secondary">Your current location's IP address does not match the office network. Please provide a reason for this check-in/out.</Paragraph>
                <Form form={reasonForm} layout="vertical" onFinish={handleReasonSubmit} className="mt-4">
                    <Form.Item name="reason" label="Reason" rules={[{ required: true, message: "A reason is required." }]}>
                        <TextArea rows={4} placeholder="e.g., Working from a client's site, internet issue." />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Post Announcement"
                open={isAnnoucementModalOpen}
                onCancel={() => setIsAnnoucementModalOpen(false)}
                onOk={() => announcementForm.submit()}
                okText="Publish"
            >
                <Form form={announcementForm} layout="vertical" className="mt-4">
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="Enter your title..." /></Form.Item>
                    <Form.Item name="message" label="Message" rules={[{ required: true }]}><TextArea showCount maxLength={200} rows={4} placeholder="Enter your message..." /></Form.Item>
                    <Form.Item name="attachments" label="Attachments"><FileUpload /></Form.Item>
                    <Form.Item name="publish_to" label="Publish to"><ChipInput /></Form.Item>
                </Form>
            </Modal>
        </Layout.Content>
    );
};

export default HomePage;