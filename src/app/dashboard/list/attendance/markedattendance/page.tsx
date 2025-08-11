"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import { Table, Tag, Spin, Pagination, Select, Input, Card, Row, Col, Statistic, Calendar, Space, Button, message } from 'antd';
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight } from "react-icons/md";


// --- Custom Components & API ---
import AttendanceCard from "@/components/mobile/employee/AttendanceCard";
import LeaveChart from "@/components/mobile/LeaveChart";
import { fetchAttendances, findEmployees } from "@/lib/api/attendances";
import { processFullAttendanceData } from "@/lib/dateFormat";
import { role } from "@/lib/data";

// --- Type Definitions ---
type Attendance = {
    id: number;
    employee: { id: number; name: string; };
    date: string;
    attendance_data: {
        status?: string;
        clock_in?: string;
        clock_out?: string;
        late_minutes?: number;
    };
};
type AttendanceEntry = { /* For Mobile View */ id: string; date: string; day: string; status: 'Present' | 'Absent' | 'Late'; checkIn: string; checkOut: string; };

// --- Responsive Hook ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);
    return isMobile;
};

// --- Main Combined Component ---
const AttendancePage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    return isMobile ? <MobileView /> : <DesktopView />;
};


// --- Desktop View (Refactored with Ant Design) ---
const DesktopView = () => {
    const router = useRouter();
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const getAttendances = async (page: number, pageSize: number) => {
        setLoading(true);
        try {
            const res = await fetchAttendances(page, pageSize);
            const transformedData = res.data.map((item: any) => {
                let parsedData: any = {};
                try {
                    if (item.attendance_data) parsedData = JSON.parse(item.attendance_data);
                } catch (e) { parsedData = {}; }
                
                const newAttendanceData = {
                    status: parsedData.checkin?.status || 'Absent',
                    clock_in: parsedData.checkin?.time,
                    clock_out: parsedData.checkout?.time,
                    late_minutes: 0,
                };
                return { ...item, attendance_data: newAttendanceData };
            });

            setAttendances(transformedData);
            setPagination(prev => ({ ...prev, total: res.total_items, current: page, pageSize }));
        } catch (err: any) {
             message.error(err.message || "Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        getAttendances(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange: TableProps<Attendance>['onChange'] = (newPagination) => {
        getAttendances(newPagination.current!, newPagination.pageSize!);
    };
    
    const getStatusTag = (status: string = 'Absent') => {
        let color = 'red';
        if (status === 'On Time') color = 'success';
        else if (status === 'Late') color = 'warning';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
    };

    const columns: TableProps<Attendance>['columns'] = [
        { title: "Employee", dataIndex: ['employee', 'name'], key: 'employee' },
        { title: "Date", dataIndex: 'date', key: 'date', render: (date) => moment(date).format("DD MMM YYYY") },
        { title: "Status", dataIndex: ['attendance_data', 'status'], key: 'status', render: getStatusTag },
        { title: "Check In", dataIndex: ['attendance_data', 'clock_in'], key: 'check_in', render: (time) => time ? moment(time, "HH:mm:ss").format("h:mm A") : '--:--' },
        { title: "Check Out", dataIndex: ['attendance_data', 'clock_out'], key: 'check_out', render: (time) => time ? moment(time, "HH:mm:ss").format("h:mm A") : '--:--' },
        { title: "Late By", dataIndex: ['attendance_data', 'late_minutes'], key: 'late', render: (mins = 0) => `${mins} min` },
        { title: "Actions", key: 'action', render: (_, record) => (
            <Space size="middle">
                <Button onClick={() => message.info(`Editing ${record.employee.name}`)}>
  Edit
</Button>
                <Button  danger onClick={() => message.error(`Deleting ${record.employee.name}`)} >Delete</Button>
            </Space>
        )}
    ];

    return (
        <div className="p-4">
             <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Attendance</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight />
                        <span>Attendance</span>
                    </div>
                </div>
            </div>
            <Card>
                <Row justify="end" className="mb-4">
                    <Col>
                        <Input.Search placeholder="Search..." style={{ width: 250 }} />
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={attendances}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};


// --- Mobile View (Refactored with Ant Design) ---
const MobileView = () => {
    const [items, setItems] = useState<AttendanceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({ presents: 0, absents: 0, leave: 0 });
    const [summaryStats, setSummaryStats] = useState({ workingDays: 0, lateArrivals: 0, claims: 1 });

    useEffect(() => {
        setLoading(true);
        findEmployees().then((result) => {
            const { mappedItems, presentsCount, lateCount, leaveCount } = processFullAttendanceData(result.data || []);
            setChartData({ presents: 20, absents: 0, leave: 40 });
            setSummaryStats({ workingDays: 20, lateArrivals: lateCount, claims: 1 });
            setItems(mappedItems);
        }).catch(err => {
            message.error("Failed to load employee attendance.");
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-medium mb-4">Attendance</h1>
            <Space direction="vertical" size="large" className="w-full">
                <Card title="Overall Performance">
                    <div style={{ height: 120 }}><LeaveChart data={chartData} /></div>
                </Card>
                
                <Card>
                    <Row gutter={16}>
                        <Col span={8}><Statistic title="Working Days" value={summaryStats.workingDays} /></Col>
                        <Col span={8}><Statistic title="Late Arrivals" value={summaryStats.lateArrivals} /></Col>
                        <Col span={8}><Statistic title="Leave Early" value={summaryStats.claims} /></Col>
                    </Row>
                </Card>
                
                <Card><Calendar fullscreen={false} /></Card>
                
                <Card title="Attendance Log">
                    <Spin spinning={loading}>
                        {items.length > 0 ? (
                            <AttendanceCard items={items} />
                        ) : (
                            <div className="text-center py-10 text-gray-500">No attendance data found.</div>
                        )}
                    </Spin>
                </Card>
            </Space>
        </div>
    );
};

export default AttendancePage;