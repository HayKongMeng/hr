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
    MenuProps, Dropdown
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
import {FaEllipsisV, FaFileExcel} from "react-icons/fa";
import {FaFilePdf} from "react-icons/fa6";

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
    const { user, loading: authLoading, isAuthenticated } = useAuth();

    const isMobile = useIsMobile();

    const isEmployee = user?.roles.includes('Employee');
    const isAdmin = user?.roles.includes('Admin');

    if (authLoading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    if (isAdmin) {
        const tabItems = [
            {
                key: 'team',
                label: 'Team Attendance',
                children: <TeamAttendanceView isMobile={isMobile}/>
            },
            {
                key: 'my',
                label: 'My Attendance',
                children: <MyAttendanceView />
            }
        ];
        return <Tabs defaultActiveKey="team" items={tabItems} className="p-4" />;
    }

    return <MyAttendanceView />; 
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
        let color = 'red';
        if (status === 'On Time') color = 'success';
        else if (status === 'Late') color = 'warning';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
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
        {
            title: "Reason",
            dataIndex: ['reason'],
            key: 'reason',
            ellipsis: true,
            render: (reason) => reason || 'N/A'
        },
    ];

    return (
        <div>
             <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Attendance</h1>
                     <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Attendance</span>
                    </div>
                </div>
                 <Dropdown menu={{ items: menuItems }} placement="bottomRight" disabled={exporting}>
                     <Button>
                         <Space>
                             Export
                             <FaEllipsisV />
                         </Space>
                     </Button>
                 </Dropdown>
            </div>
            <Card>
                <Row justify="end" className="mb-4">
                    <Col><Input.Search placeholder="Search employees..." style={{ width: 250 }} /></Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={attendances}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    expandable={{
                        expandedRowRender: record => <p style={{ margin: 0 }}><strong>Reason:</strong> {record.reason || 'No reason provided.'}</p>,
                        rowExpandable: record => !!record.reason,
                    }}
                />
            </Card>
        </div>
    );
};


// --- My Attendance View (Refactored from MobileView) ---
const MyAttendanceView = () => {
    const { user, employee, isAuthenticated } = useAuth();

    const [items, setItems] = useState<MappedAttendanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({ presents: 0, absents: 0, lates: 0, leave: 0 }); 
    const [summaryStats, setSummaryStats] = useState({ workingDays: 0, lateArrivals: 0, earlyLeavers: 0 });

    useEffect(() => {
        const employeeId = employee?.data?.id;

        if (!isAuthenticated || !employeeId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        findEmployeesById(employeeId).then((result) => {
            const { mappedItems, presentsCount, lateCount } = processFullAttendanceData(result.data || []);
            setItems(mappedItems);

            let workingDaysSoFar = 0;
            const startOfMonth = moment().startOf('month');
            const today = moment();
            for (let m = moment(startOfMonth); m.isSameOrBefore(today, 'day'); m.add(1, 'days')) {
                if (m.isoWeekday() <= 5) workingDaysSoFar++;
            }
            const absentsCount = workingDaysSoFar - presentsCount;

            setChartData({ presents: presentsCount, absents: absentsCount > 0 ? absentsCount : 0, lates: lateCount, leave: 0 });
            setSummaryStats({ workingDays: presentsCount, lateArrivals: lateCount, earlyLeavers: 0 });
        }).catch(err => {
            message.error("Failed to load your attendance data.");
        }).finally(() => {
            setLoading(false);
        });
    }, [user, isAuthenticated]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-medium mb-4">My Attendance</h1>
            <Space direction="vertical" size="large" className="w-full">
                <Card title="This Month's Performance">
                    <div style={{ height: 120 }}><LeaveChart data={chartData} /></div>
                </Card>
                
                <Card>
                    <Row gutter={16}>
                        <Col span={8}><Statistic title="Present Days" value={summaryStats.workingDays} /></Col>
                        <Col span={8}><Statistic title="Late Arrivals" value={summaryStats.lateArrivals} /></Col>
                        <Col span={8}><Statistic title="Absents" value={chartData.absents} /></Col>
                    </Row>
                </Card>
                
                <Card><Calendar fullscreen={false} /></Card>
                
                <Card title="Attendance Log">
                    <Spin spinning={loading}>
                        {items.length > 0 ? (
                            <AttendanceCard items={items} />
                        ) : (
                            <div className="text-center py-10 text-gray-500">No attendance data found for this month.</div>
                        )}
                    </Spin>
                </Card>
            </Space>
        </div>
    );
};

export default AttendancePage;