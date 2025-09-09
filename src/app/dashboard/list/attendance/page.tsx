"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Ant Design Components ---
import {
    Table,
    Tag,
    Spin,
    Pagination,
    Select,
    Input,
    Card,
    Row,
    Col,
    Statistic,
    Calendar,
    Space,
    Button,
    message,
    Tabs,
    List,
    MenuProps, Dropdown, Typography, Breadcrumb, Avatar, CalendarProps
} from 'antd';
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight } from "react-icons/md";


// --- Custom Components & API ---
import AttendanceCard from "@/components/mobile/employee/AttendanceCard";
import LeaveChart from "@/components/mobile/LeaveChart";
import { fetchAttendances, findEmployees, findEmployeesById } from "@/lib/api/attendances";
import { MappedAttendanceItem, processFullAttendanceData } from "@/lib/dateFormat";
import {useAuth} from "@/lib/AuthContext";
import {FaClock, FaEllipsisV, FaFileExcel, FaUserSlash} from "react-icons/fa";
import {FaFilePdf} from "react-icons/fa6";
import {HomeOutlined} from "@ant-design/icons";
import {LuUser, LuUsers} from "react-icons/lu";
import {Dayjs} from "dayjs";

const { Title, Text } = Typography;

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
    reason: string;
};
const StatCard = ({ icon, title, value, color, loading }: { icon: React.ReactNode; title: string; value: number | string; color: string; loading: boolean }) => (
    <Card bordered={false} className={`shadow-md rounded-xl text-white overflow-hidden ${color}`}>
        <Spin spinning={loading} wrapperClassName="w-full">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <Text className="text-white/80 uppercase tracking-wider text-sm">{title}</Text>
                    <Title level={2} className="!text-white !mb-0">{value}</Title>
                </div>
                <div className="text-white/30 text-5xl">{icon}</div>
            </div>
        </Spin>
    </Card>
);
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
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.roles.includes('Admin');

    if (authLoading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    const tabItems = [
        ...(isAdmin ? [{
            key: 'team',
            label: <span className="flex items-center gap-2"><LuUsers /> Team Attendance</span>,
            children: <TeamAttendanceView isMobile={true}/>
        }] : []),
        {
            key: 'my',
            label: <span className="flex items-center gap-2"><LuUser /> My Attendance</span>,
            children: <MyAttendanceView />
        }
    ];

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <Title level={2} className="!mb-1">Attendance</Title>
            <Breadcrumb
                className="mb-6"
                items={[
                    { href: '/dashboard/list/dashboard/admin', title: <Space><HomeOutlined /> Home</Space> },
                    { title: 'Attendance' },
                ]}
            />
            {isAdmin ? (
                <Tabs defaultActiveKey="team" items={tabItems} />
            ) : (
                <MyAttendanceView />
            )}
        </div>
    );
};

const TeamAttendanceView = ({ isMobile }: { isMobile: boolean }) => {
    const router = useRouter();
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const handleExportExcel = (data: Attendance[]) => {
        const headers = ["Employee", "Date", "Status", "Check In", "Check Out"];
        const body = data.map(att => [
            att.employee.name,
            moment(att.date).format("DD MMM YYYY"),
            att.attendance_data.status || 'Absent',
            att.attendance_data.clock_in ? moment(att.attendance_data.clock_in, "HH:mm:ss").format("h:mm A") : '--:--',
            att.attendance_data.clock_out ? moment(att.attendance_data.clock_out, "HH:mm:ss").format("h:mm A") : '--:--'
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Team Attendance");
        XLSX.writeFile(workbook, "Team_Attendance.xlsx");
    };

    // Handler for PDF Export
    const handleExportPdf = (data: Attendance[]) => {
        const doc = new jsPDF();
        const tableHead = [["Employee", "Date", "Status", "Check In", "Check Out"]];
        const tableBody = data.map(att => [
            att.employee.name,
            moment(att.date).format("DD MMM YYYY"),
            att.attendance_data.status || 'Absent',
            att.attendance_data.clock_in ? moment(att.attendance_data.clock_in, "HH:mm:ss").format("h:mm A") : '--:--',
            att.attendance_data.clock_out ? moment(att.attendance_data.clock_out, "HH:mm:ss").format("h:mm A") : '--:--'
        ]);

        doc.text("Team Attendance Report", 14, 15);
        autoTable(doc, { head: tableHead, body: tableBody, startY: 20 });
        doc.save('Team_Attendance.pdf');
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        setExporting(true);
        message.loading({ content: `Exporting all attendance data...`, key: 'exporting' });
        try {
            const allDataRes = await fetchAttendances(1, 10000); // Fetch a large number for now
            const allData = allDataRes.data.map((item: any) => {
                let parsedData: any = {};
                try {
                    if (item.attendance_data) parsedData = JSON.parse(item.attendance_data);
                } catch (e) { parsedData = {}; }

                return {
                    ...item,
                    attendance_data: {
                        status: parsedData.checkin?.status || 'Absent',
                        clock_in: parsedData.checkin?.time,
                        clock_out: parsedData.checkout?.time,
                        late_minutes: 0,
                    },
                    reason: parsedData.checkin?.reason || parsedData.checkout?.reason || item.reason || null
                };
            });

            if (format === 'excel') {
                handleExportExcel(allData);
            } else {
                handleExportPdf(allData);
            }
            message.success({ content: `Exported to ${format.toUpperCase()} successfully!`, key: 'exporting' });
        } catch (error) {
            message.error({ content: `Failed to export data.`, key: 'exporting' });
        } finally {
            setExporting(false);
        }
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'excel',
            label: 'Export to Excel',
            icon: <FaFileExcel />,
            onClick: () => handleExport('excel'),
        },
        {
            key: 'pdf',
            label: 'Export to PDF',
            icon: <FaFilePdf />,
            onClick: () => handleExport('pdf'),
        },
    ];

    const getAttendances = useCallback(async (page: number, pageSize: number) => {
        setLoading(true);
        try {
            const res = await fetchAttendances(page, pageSize);
            const transformedData = res.data.map((item: any) => {
                let parsedData: any = {};
                try {
                    if (item.attendance_data) parsedData = JSON.parse(item.attendance_data);
                } catch (e) { parsedData = {}; }
                
                return { 
                    ...item, 
                    attendance_data: {
                        status: parsedData.checkin?.status || 'Absent',
                        clock_in: parsedData.checkin?.time,
                        clock_out: parsedData.checkout?.time,
                        late_minutes: 0,
                    },
                    reason: parsedData.checkin?.reason || parsedData.checkout?.reason || item.reason || null

                };
            });

            setAttendances(transformedData);
            setPagination(prev => ({ ...prev, total: res.total_items, current: page, pageSize }));
        } catch (err: any) {
             message.error(err.message || "Failed to fetch team attendance");
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        getAttendances(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize, getAttendances]);

    const handleTableChange: TableProps<Attendance>['onChange'] = (newPagination) => {
        setPagination(prev => ({...prev, current: newPagination.current!, pageSize: newPagination.pageSize!}));
    };

    const getStatusTag = (status: string = 'Absent') => {
        if (status?.toLowerCase() === 'on time') return <Tag color="success">PRESENT</Tag>;
        if (status?.toLowerCase() === 'late') return <Tag color="warning">LATE</Tag>;
        return <Tag color="error">ABSENT</Tag>;
    };

    // --- RENDER MOBILE VIEW ---
    if (isMobile) {
        return (
             <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-lg font-semibold">Team Attendance</h1>
                    </div>
                </div>
                <Card>
                    <Input.Search placeholder="Search employees..." className="mb-4" />
                    <List
                        loading={loading}
                        dataSource={attendances}
                        renderItem={(item: Attendance) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item.employee.name}
                                    description={
                                        <div>
                                            <p>{moment(item.date).format("DD MMM YYYY")}</p>
                                            <p>
                                                In: {item.attendance_data.clock_in ? moment(item.attendance_data.clock_in, "HH:mm:ss").format("h:mm A") : '--:--'} | 
                                                Out: {item.attendance_data.clock_out ? moment(item.attendance_data.clock_out, "HH:mm:ss").format("h:mm A") : '--:--'}
                                            </p>
                                            {item.reason && (
                                                <p style={{ color: '#888', fontStyle: 'italic', marginTop: '4px' }}>
                                                    Reason: {item.reason}
                                                </p>
                                            )}
                                        </div>
                                    }
                                />
                                {getStatusTag(item.attendance_data.status)}
                            </List.Item>
                        )}
                    />
                    <Pagination
                        simple
                        className="mt-4 text-center"
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        // onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })}
                    />
                </Card>
            </div>
        );
    }
    
    // --- RENDER DESKTOP VIEW ---
    const columns: TableProps<Attendance>['columns'] = [
        { title: "Employee", dataIndex: ['employee', 'name'], key: 'employee' },
        { title: "Date", dataIndex: 'date', key: 'date', render: (date) => moment(date).format("DD MMM YYYY") },
        { title: "Status", dataIndex: ['attendance_data', 'status'], key: 'status', render: getStatusTag },
        { title: "Check In", dataIndex: ['attendance_data', 'clock_in'], key: 'check_in', render: (time) => time ? moment(time, "HH:mm:ss").format("h:mm A") : '--:--' },
        { title: "Check Out", dataIndex: ['attendance_data', 'clock_out'], key: 'check_out', render: (time) => time ? moment(time, "HH:mm:ss").format("h:mm A") : '--:--' },
        { title: "Reason", dataIndex: 'reason', key: 'reason', ellipsis: true, render: (reason) => reason || <Text type="secondary">N/A</Text> },
    ];

    const cardTitle = (
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col><Title level={5} className="!m-0">Team Attendance Log</Title></Col>
            <Col>
                <Space>
                    <Input.Search placeholder="Search..." style={{ width: 200 }} />
                    <Dropdown menu={{ items: menuItems }} placement="bottomRight" disabled={exporting}>
                        <Button loading={exporting}>
                            <Space>Export<FaEllipsisV /></Space>
                        </Button>
                    </Dropdown>
                </Space>
            </Col>
        </Row>
    );

    return (
        <Card bordered={false} className="shadow-lg rounded-xl" title={cardTitle}>
            {isMobile ? (
                <List
                    loading={loading}
                    dataSource={attendances}
                    pagination={{...pagination, simple: true, onChange: (page, pageSize) => setPagination(prev => ({...prev, current: page, pageSize}))}}
                    renderItem={(item: Attendance) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={`https://i.pravatar.cc/150?u=${item.employee.id}`} />}
                                title={item.employee.name}
                                description={
                                    <>
                                        <Text type="secondary">{moment(item.date).format("DD MMM YYYY")}</Text>
                                        <div>
                                            <Text>In: {item.attendance_data.clock_in ? moment(item.attendance_data.clock_in, "HH:mm:ss").format("h:mm A") : '--:--'}</Text> | <Text>Out: {item.attendance_data.clock_out ? moment(item.attendance_data.clock_out, "HH:mm:ss").format("h:mm A") : '--:--'}</Text>
                                        </div>
                                    </>
                                }
                            />
                            {getStatusTag(item.attendance_data.status)}
                        </List.Item>
                    )}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={attendances}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(p) => setPagination(prev => ({...prev, current: p.current!, pageSize: p.pageSize!}))}
                    scroll={{ x: 'max-content' }}
                />
            )}
        </Card>
    );
};


// --- My Attendance View (Refactored from MobileView) ---
const MyAttendanceView = () => {
    const { employee, isAuthenticated } = useAuth();
    const [items, setItems] = useState<MappedAttendanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({ presents: 0, absents: 0, lates: 0, leave: 0 });

    useEffect(() => {
        const employeeId = employee?.data?.id;
        if (!isAuthenticated || !employeeId) { setLoading(false); return; }

        setLoading(true);
        findEmployeesById(employeeId).then((result) => {
            const { mappedItems, presentsCount, lateCount } = processFullAttendanceData(result.data || []);
            setItems(mappedItems);

            const workingDaysSoFar = Array.from({ length: moment().date() }, (_, i) => moment().startOf('month').add(i, 'days')).filter(d => d.isoWeekday() <= 5).length;
            const absentsCount = workingDaysSoFar - presentsCount;

            setChartData({ presents: presentsCount, absents: Math.max(0, absentsCount), lates: lateCount, leave: 0 });
        }).catch(() => { message.error("Failed to load your attendance data."); })
            .finally(() => { setLoading(false); });
    }, [employee, isAuthenticated]);

    const dateCellRender = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        const dayData = items.find(item => item.dateForCompare === dateStr);
        if (dayData) {
            let status: 'success' | 'warning' | 'error' = 'success';
            if (dayData.status === 'Late') status = 'warning';
            if (dayData.checkIn === '--:--') status = 'error';
            return <div className="flex justify-center"><Tag color={status} style={{width: '100%', textAlign: 'center'}}>{dayData.checkIn}</Tag></div>;
        }
        return null;
    };

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
                <Space direction="vertical" size="large" className="w-full">
                    <Card bordered={false} className="shadow-lg rounded-xl">
                        <Title level={5}>This Month's Summary</Title>
                        <div style={{ height: 150 }}><LeaveChart data={chartData} /></div>
                    </Card>
                    <StatCard icon={<FaClock />} title="Present Days" value={chartData.presents} color="bg-gradient-to-tr from-green-500 to-green-400" loading={loading} />
                    <StatCard icon={<FaClock />} title="Late Arrivals" value={chartData.lates} color="bg-gradient-to-tr from-yellow-500 to-yellow-400" loading={loading} />
                    <StatCard icon={<FaUserSlash />} title="Absents" value={chartData.absents} color="bg-gradient-to-tr from-red-500 to-red-400" loading={loading} />
                </Space>
            </Col>
            <Col xs={24} lg={16}>
                <Card bordered={false} className="shadow-lg rounded-xl h-full">
                    <Calendar fullscreen={false} cellRender={dateCellRender as CalendarProps<Dayjs>['cellRender']} />
                </Card>
            </Col>
        </Row>
    );
};

export default AttendancePage;