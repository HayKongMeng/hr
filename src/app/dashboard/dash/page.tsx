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
import LeaveStatus from "@/components/mobile/employee/Leavestatus";
import AttendanceCard from "@/components/mobile/employee/AttendanceCard";
import OverviewHr from "@/components/mobile/employee/OverviewHr";
import ButtonCustom from "@/components/ui/Button";
import { LuQrCode } from "react-icons/lu";
import QrCodeModal from "@/components/QrCodeModal";
import {Flex, Form, Input, message, Radio, Spin} from "antd";
import { PiSealCheck } from "react-icons/pi";
import { IoIosCheckboxOutline } from "react-icons/io";
import LeaveRequestAdmin from "@/components/LeaveRequestAdmin";
import { CiEdit, CiSearch } from "react-icons/ci";
import Modal from "@/components/Modal";
import TextArea from "antd/es/input/TextArea";
import FileUpload from "@/components/FileUpload";
import ChipInput from "@/components/ChipInput";
import AnnoucementCard from "@/components/card/AnnoucementCard";
import { checkInAndOut, findEmployees, findEmployeesById } from "@/lib/api/attendances";
import { formattedDate, MappedAttendanceItem, processFullAttendanceData } from "@/lib/dateFormat";
import { getEmployeeById } from "@/lib/api/employee";
import Link from "next/link";
import moment from "moment";
import Cookies from "js-cookie";
import {useAuth} from "@/lib/AuthContext";

type Employee = {
    name: string;
    email: string;
    image_url: string | null;
    position?: {
        title: string;
    };
};

type AdminOption = {
    label: string;
    value: string;
};

type PendingAttendanceData = {
    type: 'checkin' | 'checkout';
    latitude: number;
    longitude: number;
    scan_code: string;
    ip: string;
};

const HomePage = () => {
    // --- STATE MANAGEMENT ---
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [items, setItems] = useState<MappedAttendanceItem[]>([]);
    const [itemsEmployee, setItemsEmployee] = useState<MappedAttendanceItem[]>([]);
    const [todayAttendance, setTodayAttendance] = useState({
        checkIn: "--:--", checkInStatus: "-", checkOut: "--:--", checkOutStatus: "-",
    });

    // --- MODAL & BUTTON STATES ---
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isAnnoucementModalOpen, setIsAnnoucementModalOpen] = useState(false);

    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [pendingAttendanceData, setPendingAttendanceData] = useState<PendingAttendanceData | null>(null);
    const [reasonForm] = Form.useForm();

    // --- TIMER STATES ---
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    // --- UI STATES ---
    const [selectedOption, setSelectedOption] = useState("MySpace");
    const [checkedIds, setCheckedIds] = useState<string[]>([]);

    const isEmployeeRole = user?.roles.includes('Employee');
    const isAdminRole = user?.roles.includes('Admin');
    const currentEmployeeId = user?.emp_id;

    // --- CONSOLIDATED DATA FETCHING ---
    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !currentEmployeeId) return;

        setLoadingProfile(true);
        try {
            // --- Fetch data for EVERYONE (personal profile and attendance) ---
            const [employeeRes, personalAttendanceRes] = await Promise.all([
                getEmployeeById(currentEmployeeId),
                findEmployeesById(currentEmployeeId)
            ]);

            if (employeeRes.data.result) setEmployee(employeeRes.data.result.data);

            const { mappedItems, todayDetails } = processFullAttendanceData(personalAttendanceRes.data || []);
            setItems(mappedItems);
            setTodayAttendance(todayDetails);

            // --- CONDITIONAL FETCH: Only fetch organization data for Admins ---
            if (isAdminRole) {
                const orgAttendanceRes = await findEmployees();
                const { mappedItems: orgMappedItems } = processFullAttendanceData(orgAttendanceRes.data || []);
                setItemsEmployee(orgMappedItems);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            message.error("Could not load dashboard data.");
        } finally {
            setLoadingProfile(false);
        }
    }, [isAuthenticated, currentEmployeeId, isAdminRole]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    const checkStatus = getTodayCheckStatus(items);

    const calculateRemainingTime = useCallback((checkInTime: string) => {
        if (!checkInTime || checkInTime === "--:--" || checkInTime === "-") return 0;
        try {
            const today = new Date();
            const [time, period] = checkInTime.split(" ");
            const [hours, minutes] = time.split(":");
            let hour24 = parseInt(hours);
            if (period?.toLowerCase() === "pm" && hour24 !== 12) hour24 += 12;
            else if (period?.toLowerCase() === "am" && hour24 === 12) hour24 = 0;
            const checkInDateTime = new Date(today);
            checkInDateTime.setHours(hour24, parseInt(minutes), 0, 0);
            const enableTime = new Date(checkInDateTime.getTime() + 60 * 1000);
            const now = new Date();
            const remainingMs = enableTime.getTime() - now.getTime();
            return Math.max(0, Math.floor(remainingMs / 1000));
        } catch (error) {
            console.error("Error calculating remaining time:", error);
            return 0;
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (checkStatus === "checkedIn" && timeRemaining > 0) {
            setIsTimerActive(true);
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsTimerActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setIsTimerActive(false);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [checkStatus, timeRemaining]);

    useEffect(() => {
        if (checkStatus === "checkedIn" && todayAttendance.checkIn) {
            const remaining = calculateRemainingTime(todayAttendance.checkIn);
            setTimeRemaining(remaining);
        } else {
            setTimeRemaining(0);
            setIsTimerActive(false);
        }
    }, [todayAttendance.checkIn, checkStatus, calculateRemainingTime]);

    function getTodayCheckStatus(items: MappedAttendanceItem[]): "checkedIn" | "checkedOut" | "notCheckedIn" {
        const today = moment().format("YYYY-MM-DD");

        const todayEntry = items.find((item) => item.dateForCompare === today);

        if (todayEntry) {
            if (
                todayEntry.checkIn && todayEntry.checkIn !== "--:--" &&
                (!todayEntry.checkOut || todayEntry.checkOut === "--:--")
            ) {
                return "checkedIn";
            }
            if (!todayEntry.checkIn || todayEntry.checkIn === "--:--") {
                return "notCheckedIn";
            }
            if (
                todayEntry.checkIn && todayEntry.checkIn !== "--:--" &&
                todayEntry.checkOut && todayEntry.checkOut !== "--:--"
            ) {
                return "checkedOut";
            }
        }
        return "notCheckedIn";
    }

    const handleQrScan = async (scan_code: string) => {
        setIsQrModalOpen(false);
        setButtonLoading(true);

        if (!currentEmployeeId) {
            message.error("Employee ID not found.");
            setButtonLoading(false);
            return;
        }

        try {
            const ipRes = await fetch("https://api.ipify.org/?format=json");
            const ipData = await ipRes.json();
            const ip = ipData.ip;

            let latitude = 0, longitude = 0;
            if (navigator.geolocation) {
                await new Promise<void>(resolve => {
                    navigator.geolocation.getCurrentPosition(pos => {
                        latitude = pos.coords.latitude;
                        longitude = pos.coords.longitude;
                        resolve();
                    }, () => resolve());
                });
            }

            const type = checkStatus === "checkedIn" ? "checkout" : "checkin";
            const res = await checkInAndOut({ employee_id: currentEmployeeId, type, latitude, longitude, scan_code, ip });

            if (res.success) {
                message.success(type === "checkin" ? "Check-in successful!" : "Check-out successful!");
                fetchData(); // <-- CLEANER: Just call the main fetch function.
            } else {
                if (res.message?.toLowerCase().includes('ip mismatch')) {
                    message.warning("IP address mismatch. Please provide a reason.");
                    setPendingAttendanceData({ type, latitude, longitude, scan_code, ip });
                    setIsReasonModalOpen(true);
                } else {
                    message.error(res.message || "Operation failed. Please try again.");
                }
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "";
            console.log(errorMessage)
            // if (errorMessage.includes('"Reason is required when checking in/out outside company network."')) {
                message.warning("IP address mismatch. Please provide a reason.");

                const ipRes = await fetch("https://api.ipify.org/?format=json");
                const ipData = await ipRes.json();
                const ip = ipData.ip;
                let latitude = 0, longitude = 0;

                const type = checkStatus === "checkedIn" ? "checkout" : "checkin";

                setPendingAttendanceData({ type, latitude, longitude, scan_code, ip });

                setIsReasonModalOpen(true);
            // } else {
            //     message.error(errorMessage || "An unexpected error occurred.");
            // }
        } finally {
            setButtonLoading(false);
        }
    };

    const handleReasonSubmit = async (values: { reason: string }) => {
        if (!pendingAttendanceData || !currentEmployeeId) {
            message.error("Could not submit. Pending data is missing.");
            return;
        }

        setButtonLoading(true);
        try {
            const finalPayload = {
                employee_id: currentEmployeeId,
                ...pendingAttendanceData,
                reason: values.reason,
            };

            const res = await checkInAndOut(finalPayload);

            if (res.success) {
                message.success(pendingAttendanceData.type === "checkin" ? "Check-in successful!" : "Check-out successful!");
                setIsReasonModalOpen(false);
                reasonForm.resetFields();
                setPendingAttendanceData(null);
                fetchData(); // Refresh all data on final success
            } else {
                message.error(res.message || "Submission failed. Please try again.");
            }

        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "An error occurred.";
            message.error(errorMessage);
        } finally {
            setButtonLoading(false);
        }
    };

    const handleReasonModalCancel = () => {
        setIsReasonModalOpen(false);
        reasonForm.resetFields();
        setPendingAttendanceData(null);
    };

    const handleCheckInClick = () => setIsQrModalOpen(true);
    const closeQrModal = () => setIsQrModalOpen(false);
    const handleCheck = (id: string) => setCheckedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const handleAnnoucementClick = () => setIsAnnoucementModalOpen(true);
    const closeAnnoucementModal = () => setIsAnnoucementModalOpen(false);
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => console.log("Change:", e.target.value);
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    // --- DYNAMIC BUTTON CONFIG (Unchanged) ---
    const getButtonConfig = () => {
        switch (checkStatus) {
            case "checkedIn":
                if (isTimerActive && timeRemaining > 0) return { label: `Check out (${formatTime(timeRemaining)})`, className: "primary-button bg-gray-400 text-white cursor-not-allowed", iconColor: "#6B7280", disabled: true };
                return { label: "Check out", className: "primary-button bg-[#D27E4B] text-white", iconColor: "#D27E4B", disabled: false };
            case "checkedOut":
                return { label: "Already checked out", className: "primary-button bg-gray-400 text-white cursor-not-allowed", iconColor: "#6B7280", disabled: true };
            default:
                return { label: "Check in", className: "primary-button", iconColor: undefined, disabled: false };
        }
    };
    const buttonConfig = getButtonConfig();

    if (authLoading) {
        return <div className="min-h-screen w-full flex justify-center items-center"><Spin size="large" /></div>;
    }

    const adminOptions: AdminOption[] = [
        { label: "My space", value: "MySpace" },
        { label: "Organization", value: "Organization" },
        { label: "Annoucement", value: "Annoucement" },
    ];

    return (
        <div className="min-h-screen w-full max-h-[calc(100vh-62px)] pb-20">
            <main className="relative z-20 ">
                <div className="pt-6 flex flex-col w-full bg-[url('/banner.svg')] h-[50%] md:h-[40%] xl:h-[50%] 2xl:h-[40%] bg-no-repeat bg-cover items-center justify-end pb-6 text-white">
                    {loadingProfile ? (
                        <Spin />
                    ) : (
                        <>
                            <img
                                src={employee?.image_url || "/avatar.png"}
                                alt="User Avatar"
                                className="w-16 h-16 rounded-full border-white z-10 object-cover"
                            />
                            <p className="mt-2 text-base font-semibold z-10">
                                Good morning, {employee?.name || "User"}
                            </p>
                            <p className="text-sm opacity-80 z-10">
                                {employee?.position?.title || "Employee"}
                            </p>
                            {currentEmployeeId && (
                                <p className="text-sm underline mt-2 z-10">
                                    <Link href={`/dashboard/list/employees/${currentEmployeeId}`}>
                                        View profile
                                    </Link>
                                </p>
                            )}
                        </>
                    )}
                </div>
                <div className="pl-4">
                    {isAdminRole && (
                        <div>
                            <Flex vertical gap="middle">
                                <Radio.Group
                                    value={selectedOption}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                    className="bg-shadow border-none flex justify-between"
                                    optionType="button"
                                    buttonStyle="solid"
                                >
                                    {adminOptions.map(opt => (
                                        <Radio.Button key={String(opt.value)} value={String(opt.value)} className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white">
                                            {opt.label}
                                        </Radio.Button>
                                    ))}
                                </Radio.Group>
                            </Flex>
                        </div>
                    )}
                    {selectedOption === "MySpace" && (
                        <>
                            <div className="bg-shadow gap-4 flex flex-col p-4">
                                <div className="flex justify-between items-center ">
                                    <div>
                                        <h1>Date</h1>
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div>
                                        <h1>Time</h1>
                                        <span>8:00 am - 5:30 pm</span>
                                    </div>
                                </div>

                                <ButtonCustom
                                    label={buttonConfig.label}
                                    className={buttonConfig.className}
                                    type="submit"
                                    // disabled={buttonConfig.disabled || buttonLoading}
                                    icon={
                                        <LuQrCode
                                            color={buttonConfig.iconColor}
                                        />
                                    }
                                    onClick={buttonConfig.disabled ? undefined : handleCheckInClick}
                                />
                            </div>
                            {/* <CheckInCheckOut /> */}
                            <OverviewHr
                                data={{ presents: 30, absents: 20, leave: 5 }}
                                todayAttendance={todayAttendance}
                            />
                            <div className="bg-shadow p-4 mt-4">
                                <div className="flex items-center justify-between mb-[19px]">
                                    <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                                        Attendance
                                    </h2>
                                    <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                                        View more
                                    </button>
                                </div>
                                {items.length > 0 ? (
                                    <AttendanceCard items={items} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <img
                                            src="/empty.svg"
                                            alt="No attendance data"
                                            className="w-40 h-40"
                                        />
                                        <p className="text-gray-500 mt-4 text-sm font-satoshi">
                                            No attendance data found
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-shadow">
                                <div className="flex items-center justify-between mb-[19px]">
                                    <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                                        Leave Status
                                    </h2>
                                    <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                                        View more
                                    </button>
                                </div>
                                <LeaveStatus
                                    showActions={false}
                                    userRole={user?.roles[0]}
                                    employeeId={currentEmployeeId}
                                />
                            </div>
                        </>
                    )}
                    {isAdminRole && selectedOption === "Organization" && (
                        <>
                            <div className="bg-shadow p-4">
                                <h2 className="text-[20px] font-medium text-black mb-4">
                                    Overview
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-[#392648] rounded-3xl p-4 h-28">
                                            <div className="flex items-center gap-2 mb-3 text-white">
                                                <div className="w-6 h-6 flex-shrink-0">
                                                    <PiSealCheck className="w-6 h-6 mr-2" />
                                                </div>
                                                <span className="text-[#dedede] text-sm font-medium">
                        Late Arrival
                      </span>
                                            </div>
                                            <div>
                                                <div className="text-white text-base font-normal">
                                                    1 staff
                                                </div>
                                                <div className="text-[#dedede] text-xs font-normal mt-1">
                                                    Manage
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#392648] rounded-3xl p-4 h-28">
                                            <div className="flex items-center gap-2 mb-3 text-white">
                                                <div className="w-6 h-6 flex-shrink-0">
                                                    <PiSealCheck className="w-6 h-6 mr-2" />
                                                </div>
                                                <span className="text-[#dedede] text-sm font-medium">
                        Check in at
                      </span>
                                            </div>
                                            <div>
                                                <div className="text-white text-base font-normal">
                                                    1 staff
                                                </div>
                                                <div className="text-[#dedede] text-xs font-normal mt-1">
                                                    Manage
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </h2>
                            </div>
                            <div className="bg-shadow p-4 mt-4">
                                <div className="flex items-center justify-between mb-[19px]">
                                    <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                                        Attendance
                                    </h2>
                                    <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                                        View more
                                    </button>
                                </div>
                                {itemsEmployee.length > 0 ? (
                                    <AttendanceCard items={itemsEmployee} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <img
                                            src="/empty.svg"
                                            alt="No attendance data"
                                            className="w-40 h-40"
                                        />
                                        <p className="text-gray-500 mt-4 text-sm font-satoshi">
                                            No attendance data found
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-shadow p-4 mt-4">
                                <div className="flex items-center justify-between mb-[19px]">
                                    <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                                        Leave Requests
                                    </h2>
                                    <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                                        View more
                                    </button>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <IoIosCheckboxOutline className="text-2xl text-[#D1D5DB]" />{" "}
                                    Select All
                                </div>
                                <LeaveRequestAdmin
                                    checkedIds={checkedIds}
                                    onCheck={handleCheck}
                                />
                            </div>
                        </>
                    )}{" "}
                    {isAdminRole && selectedOption === "Annoucement" && (
                        <>
                            <div className="bg-shadow">
                                <ButtonCustom
                                    label="Post Announcement"
                                    className="bg-shadow mb-4"
                                    type="submit"
                                    onClick={handleAnnoucementClick}
                                    icon={<CiEdit />}
                                    disabled={false}
                                    loading={false}
                                >
                                </ButtonCustom>
                                <div className="">
                                    <Input
                                        className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                                        placeholder="Search..."
                                        prefix={<CiSearch className="text-[#364663] text-xl" />}
                                    ></Input>
                                </div>
                                <div>
                                    <AnnoucementCard />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <QrCodeModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                onScan={handleQrScan}
            />

            <Modal
                isOpen={isReasonModalOpen}
                onClose={handleReasonModalCancel}
                title="Reason for IP Mismatch"
                className="px-4"
            >
                {/* This modal ONLY contains the reason form */}
                <Form form={reasonForm} layout="vertical" onFinish={handleReasonSubmit}>
                    <p className="mb-4 text-gray-600">Your current location's IP address does not match the office network. Please provide a reason for check-in/out.</p>
                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: "Please provide a reason." }]}
                    >
                        <TextArea rows={4} placeholder="e.g., Working from a client's site, forgot to connect to Wi-Fi, etc." />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-4">
                        <ButtonCustom label="Cancel" onClick={handleReasonModalCancel} className="secondary-button" />
                        <ButtonCustom label="Submit" type="submit" loading={buttonLoading} className="primary-button" />
                    </div>
                </Form>
            </Modal>
            <Modal
                isOpen={isAnnoucementModalOpen}
                onClose={closeAnnoucementModal}
                title="Post Announcement"
                className="px-4"
            >

                <div className="bg-shadow p-4">
                    <div className="">
                        <label htmlFor="leave-type">Title</label>
                        <Input
                            className="mt-4 !stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                            placeholder="Enter your title..."
                        ></Input>
                    </div>
                    <div className=" mt-4">
                        <label htmlFor="leave-type">Message</label>
                        <TextArea
                            className="mt-4
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                            showCount
                            maxLength={100}
                            onChange={onChange}
                            placeholder="Give as your reason for leave..."
                        />
                    </div>

                    <div className=" mt-4 flex flex-col">
                        <label htmlFor="leave-type">Attachments</label>
                        <FileUpload />
                    </div>
                    <div className="mt-4 flex flex-col">
                        <label htmlFor="leave-type">Publish to</label>
                        <ChipInput />
                    </div>
                </div>
                <div className="">
                    <ButtonCustom
                        label="Publish "
                        className="primary-button mt-4 px-5 float-right"
                        type="submit"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default HomePage;
