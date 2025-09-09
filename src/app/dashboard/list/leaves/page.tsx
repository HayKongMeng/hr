"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFileExcel, FaFilePdf, FaEllipsisV } from "react-icons/fa";

// --- Ant Design Components ---
import {
    Card, Button, DatePicker, message, Select, Space, Input, Modal, Form, Table, Tag, Spin, List, Tabs, Descriptions,
    Collapse, MenuProps, Dropdown,
    Radio, Row, Breadcrumb, Col, Typography, FormInstance
} from "antd";
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete, MdRemoveRedEye } from "react-icons/md";
import { BiCalendar } from "react-icons/bi";
import { FaCheck, FaTimes } from "react-icons/fa";

// --- API & Data ---
import {
    createLeave,
    fetchAllLeaveTypes,
    fetchEmployeesLeave,
    fetchLeaves,
    updateLeave,
    LeaveType,
    ApproveLeave,
    deleteLeave,
    getLeaveById,
    Approval
} from "@/lib/api/leave";
import { Employee, fetchEmployees } from "@/lib/api/employee";
import Cookies from "js-cookie";
import {useAuth} from "@/lib/AuthContext";
import BoardView from "@/components/ui/BoardView";
import {LuLayoutDashboard, LuList, LuUser, LuUsers} from "react-icons/lu";
import {HomeOutlined} from "@ant-design/icons";
const { Title, Text } = Typography;
// --- Type Definitions ---
export type Leave = {
    id: number;
    employee_id: number;
    leave_type: { id: number; type_name: string };
    status: { id: number; status_name: string };
    start_date: string;
    end_date: string;
    reason: string;
    applied_on: string;
    approved?: Approval[];
};

// --- Responsive Hook ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => { if (typeof window !== "undefined") { const handleResize = () => setIsMobile(window.innerWidth < breakpoint); window.addEventListener("resize", handleResize); handleResize(); return () => window.removeEventListener("resize", handleResize); } }, [breakpoint]);
    return isMobile;
};

// --- Reusable Form Component ---
const LeaveRequestForm = ({ form, onFinish, employees, leaveTypes, loading, user }: { form: FormInstance, onFinish: (v: any) => void, employees: Employee[], leaveTypes: LeaveType[], loading: boolean, user: any; }) => {
    const isEmployeeRole = user?.roles.includes('Employee');
    const employeeOptions = (isEmployeeRole && user)
        ? [{ label: user.name, value: user.emp_id }]
        : employees.map((e: Employee) => ({ label: e.name, value: e.id }));

    return (
        <Form form={form} layout="vertical" name="leave_request_form" onFinish={onFinish}>
            <Spin spinning={loading} tip="Loading data...">
                <Form.Item name="employee_id" label="Employee Name" rules={[{ required: true }]}>
                    <Select placeholder="Select employee" options={employeeOptions} showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} disabled={isEmployeeRole} />
                </Form.Item>
                <Form.Item name="leave_type_id" label="Leave Type" rules={[{ required: true }]}>
                    <Select placeholder="Select leave type" options={leaveTypes.map(t => ({ label: t.type_name, value: t.id }))} />
                </Form.Item>
                <Form.Item name="date_range" label="Date Range" rules={[{ required: true }]}>
                    <DatePicker.RangePicker className="w-full" disabledDate={(current) => current && current < dayjs().startOf('day')} />
                </Form.Item>
                <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
                    <Input.TextArea showCount maxLength={200} placeholder="Reason for leave..." rows={4} />
                </Form.Item>
            </Spin>
        </Form>
    );
};

// --- Shared Helper for Status Tags ---
const getStatusTag = (statusObject: { id: number; status_name: string } | null) => {
    const statusName = statusObject?.status_name || 'Pending';
    const normalized = statusName.toLowerCase();

    let color = 'warning';
    if (normalized === 'approved') color = 'success';
    else if (normalized === 'rejected') color = 'error';

    return <Tag color={color}>{statusName.toUpperCase()}</Tag>;
};

// --- NEW Approval History Component ---
const ApprovalHistory = ({ approvals, employeeMap }: { approvals: Approval[], employeeMap: { [key: number]: Employee } }) => {
    if (!approvals || approvals.length === 0) {
        return <div style={{ padding: '16px', color: '#888' }}>No approval history available.</div>;
    }
    return (
        <List
            size="small"
            dataSource={approvals}
            renderItem={item => (
                <List.Item>
                    <List.Item.Meta
                        title={<span style={{ color: item.action === 'Rejected' ? '#cf1322' : '#3f8600' }}>{item.action} by {employeeMap[item.approved_by]?.name || 'Unknown User'}</span>}
                        description={
                            <>
                                <div>Comment: {item.comments || <em>No comment provided</em>}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>
                                    {moment(item.approved_at).format('DD MMM YYYY, h:mm A')}
                                </div>
                            </>
                        }
                    />
                </List.Item>
            )}
        />
    );
};

// --- View for Team Leave Requests
const TeamLeaveView = ({ isMobile, leaves, loading, pagination, employeeMap, onTableChange, onEdit, onManage, onDelete, onView, isAdmin }: { isMobile: boolean, leaves: Leave[], loading: boolean, pagination: any, employeeMap: { [id: number]: Employee }, onTableChange: (p: any) => void, onEdit: (r: Leave) => void, onManage: (r: Leave) => void, onDelete: (id: number) => void, onView: (r: Leave) => void, isAdmin: Boolean; }) => {

    const columns: TableProps<Leave>['columns'] = [
        // Base columns
        { title: 'Employee', key: 'employee', render: (_, record) => employeeMap[record.employee_id]?.name || 'Unknown' },
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Applied On', dataIndex: 'applied_on', key: 'applied', render: (d) => moment(d).format("DD MMM YYYY") },
        { title: 'Dates', key: 'dates', render: (_, r) => `${moment(r.start_date).format("DD MMM")} - ${moment(r.end_date).format("DD MMM YYYY")}` },
        { title: 'Days', key: 'days', render: (_, r) => `${moment(r.end_date).diff(moment(r.start_date), 'days') + 1}d` },
        { title: 'Status', key: 'status', render: (_, record) => getStatusTag(record.status) },
    ];

    if (isAdmin) {
        columns.push({
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const status = record.status?.status_name;
                const isEditable = status === 'Pending';
                const isManageable = status === 'Pending' || status === 'Approved';
                return (
                    <Space>
                        <Button icon={<MdRemoveRedEye />} onClick={() => onView(record)}>View</Button>
                        <Button onClick={() => onManage(record)} disabled={!isManageable}>Manage</Button>
                        <Button icon={<MdEdit />} onClick={() => onEdit(record)} disabled={!isEditable}>Edit</Button>
                        <Button icon={<MdDelete />} danger onClick={() => onDelete(record.id)} disabled={!isEditable}>Delete</Button>
                    </Space>
                )
            }
        });
    }

    if (isMobile) {
        return <List
            loading={loading}
            dataSource={leaves}
            renderItem={(item) => {
                const status = item.status?.status_name;
                const isEditable = status === 'Pending';
                const isManageable = status === 'Pending' || status === 'Approved';

                return (
                    <List.Item
                        actions={[
                            <Button key="view" type="text" shape="circle" icon={<MdRemoveRedEye />} onClick={() => onView(item)} />,
                            <Button key="manage" type="text" shape="circle" onClick={() => onManage(item)} disabled={!isManageable} icon={<FaCheck />} />,
                            <Button key="edit" type="text" shape="circle" onClick={() => onEdit(item)} disabled={!isEditable} icon={<MdEdit />} />,
                            <Button key="delete" type="text" shape="circle" danger onClick={() => onDelete(item.id)} disabled={!isEditable} icon={<MdDelete />} />,
                        ]}
                    >
                        <List.Item.Meta
                            title={employeeMap[item.employee_id]?.name || 'Unknown Employee'}
                            description={`${item.leave_type?.type_name} | ${moment(item.start_date).format("DD MMM")} - ${moment(item.end_date).format("DD MMM")}`}
                        />
                        {getStatusTag(item.status)}
                    </List.Item>
                )
            }}
        />
    }

    return (
        <Table columns={columns} dataSource={leaves} rowKey="id" loading={loading} pagination={pagination} onChange={onTableChange}/>
    );
};

// --- View for My Leave Requests
const MyLeaveView = ({ isMobile, myLeaves, loading, onEdit, onCancel, onView }: {
    isMobile: boolean;
    myLeaves: Leave[];
    loading: boolean;
    onEdit: (record: Leave) => void;
    onCancel: (id: number) => void;
    onView: (record: Leave) => void;
}) => {
    const columns: TableProps<Leave>['columns'] = [
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Applied On', dataIndex: 'applied_on', key: 'applied', render: (d) => moment(d).format("DD MMM YYYY") },
        { title: 'Dates', key: 'dates', render: (_, r) => `${moment(r.start_date).format("DD MMM")} - ${moment(r.end_date).format("DD MMM YYYY")}` },
        { title: 'Days', key: 'days', render: (_, r) => `${moment(r.end_date).diff(moment(r.start_date), 'days') + 1}d` },
        { title: 'Status', key: 'status', render: (_, r) => getStatusTag(r.status) },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => {
                const isActionable = record.status?.status_name === 'Pending';
                return (
                    <Space>
                        <Button icon={<MdRemoveRedEye />} onClick={() => onView(record)}>View</Button>
                        <Button icon={<MdEdit />} onClick={() => onEdit(record)} disabled={!isActionable}>Edit</Button>
                        <Button icon={<MdDelete />} danger onClick={() => onCancel(record.id)} disabled={!isActionable}>Cancel</Button>
                    </Space>
                );
            }
        }
    ];

    if (isMobile) {
        return (
            <List
                loading={loading}
                dataSource={myLeaves}
                renderItem={(item) => {
                    const isActionable = item.status?.status_name === 'Pending';
                    return (
                        <List.Item
                            actions={[
                                <Button key="view" type="text" shape="circle" icon={<MdRemoveRedEye />} onClick={() => onView(item)} />,
                                <Button key="edit" type="text" shape="circle" icon={<MdEdit />} disabled={!isActionable} onClick={() => onEdit(item)} />,
                                <Button key="cancel" type="text" shape="circle" danger icon={<MdDelete />} disabled={!isActionable} onClick={() => onCancel(item.id)} />,
                            ]}
                        >
                            <List.Item.Meta
                                title={item.leave_type.type_name}
                                description={`${moment(item.start_date).format("DD MMM")} - ${moment(item.end_date).format("DD MMM YYYY")}`}
                            />
                            {getStatusTag(item.status)}
                        </List.Item>
                    );
                }}
            />
        );
    }

    return (
        <Table
            columns={columns}
            dataSource={myLeaves}
            rowKey="id"
            loading={loading}
            pagination={false}
        />
    );
};

const LeaveViewContainer = ({
                                leaves,
                                employeeMap,
                                viewType, // 'team' or 'my'
                                listComponent: ListComponent, // The list component to render
                                boardComponent: BoardComponent, // The board component to render
                            }: {
    leaves: Leave[];
    employeeMap: { [id: number]: Employee };
    viewType: 'team' | 'my';
    listComponent: React.ReactNode;
    boardComponent: React.ReactNode;
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} buttonStyle="solid">
                    <Radio.Button value="list"><LuList className="inline-block align-middle mr-1" /> List</Radio.Button>
                    <Radio.Button value="board"><LuLayoutDashboard className="inline-block align-middle mr-1" /> Board</Radio.Button>
                </Radio.Group>
            </div>
            <div className="mt-4">
                {viewMode === 'list' && ListComponent}
                {viewMode === 'board' && BoardComponent}
            </div>
        </div>
    );
};


// --- Main Page Component ---
const LeaveManagementPage = () => {
    const { user, employee, loading: authLoading, isAuthenticated } = useAuth();
    const isMobile = useIsMobile();
    const [form] = Form.useForm();
    const router = useRouter();

    const [teamLeaves, setTeamLeaves] = useState<Leave[]>([]);
    const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
    const [employeesAll, setAllEmployees] = useState<Employee[]>([]);
    const [employeeMap, setEmployeeMap] = useState<{ [id: number]: Employee }>({});
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [myViewMode, setMyViewMode] = useState<'list' | 'board'>('list');
    const [loading, setLoading] = useState(true);
    const [teamPagination, setTeamPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

    const [approvalForm] = Form.useForm();

    const isEmployee = user?.roles.includes('Employee');
    const isAdmin = user?.roles.includes('Admin');
    const currentEmployeeId = employee?.data?.id;

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [teamViewMode, setTeamViewMode] = useState<'list' | 'board'>('list');

    const [activeTabKey, setActiveTabKey] = useState(
        user?.roles.includes('Admin') ? 'team' : 'my'
    );
    const [exporting, setExporting] = useState(false);

    if (employeesAll === null) {
        message.error('Employee does not exist!');
    }

    const handleExportExcel = (data: Leave[], employeeMap: { [id: number]: Employee }, fileName: string) => {
        const headers = ["Employee", "Leave Type", "Applied On", "Start Date", "End Date", "Days", "Status", "Reason"];
        const body = data.map(leave => [
            employeeMap[leave.employee_id]?.name || `ID: ${leave.employee_id}`,
            leave.leave_type.type_name,
            moment(leave.applied_on).format("DD MMM YYYY"),
            moment(leave.start_date).format("DD MMM YYYY"),
            moment(leave.end_date).format("DD MMM YYYY"),
            moment(leave.end_date).diff(moment(leave.start_date), 'days') + 1,
            leave.status.status_name,
            leave.reason
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Data");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const handleExportPdf = (data: Leave[], employeeMap: { [id: number]: Employee }, fileName: string, title: string) => {
        const doc = new jsPDF();
        const tableHead = [["Employee", "Leave Type", "Applied", "Start Date", "End Date", "Days", "Status"]];
        const tableBody = data.map(leave => [
            employeeMap[leave.employee_id]?.name || `ID: ${leave.employee_id}`,
            leave.leave_type.type_name,
            moment(leave.applied_on).format("DD-MM-YY"),
            moment(leave.start_date).format("DD-MM-YY"),
            moment(leave.end_date).format("DD-MM-YY"),
            moment(leave.end_date).diff(moment(leave.start_date), 'days') + 1,
            leave.status.status_name
        ]);

        doc.text(title, 14, 15);
        autoTable(doc, { head: tableHead, body: tableBody, startY: 20 });
        doc.save(`${fileName}.pdf`);
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        if (!employee || !employee.data) {
            message.error("Employee data is not available for export.");
            return;
        }

        setExporting(true);
        message.loading({ content: `Exporting data...`, key: 'exporting' });

        try {
            // Determine which dataset to use based on the active tab
            const isTeamView = activeTabKey === 'team';
            const dataToExport = isTeamView ? teamLeaves : myLeaves;

            if (dataToExport.length === 0) {
                message.warning({ content: "No data to export.", key: 'exporting' });
                setExporting(false);
                return;
            }

            let exportEmployeeMap = employeeMap;
            if (!isTeamView && user) {
                exportEmployeeMap = { [employee.data.id]: { id: employee.data.id,  } as Employee };
            }

            const fileName = isTeamView ? "Team_Leave_Report" : "My_Leave_Report";
            const title = isTeamView ? "Team Leave Report" : "My Leave Report";

            if (format === 'excel') {
                handleExportExcel(dataToExport, exportEmployeeMap, fileName);
            } else {
                handleExportPdf(dataToExport, exportEmployeeMap, title, fileName);
            }
            message.success({ content: "Export successful!", key: 'exporting' });
        } catch (error) {
            console.error("Export failed:", error);
            message.error({ content: "Export failed.", key: 'exporting' });
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
    const handleViewDetails = async (record: Leave) => {
        setIsViewModalOpen(true);
        setViewLoading(true);
        setSelectedLeave(record);
        try {
            const res = await getLeaveById(record.id);
            setSelectedLeave(res.data.result.data);
        } catch {
            message.error("Failed to fetch leave details.");
            setIsViewModalOpen(false);
        } finally {
            setViewLoading(false);
        }
    };

    // --- NEW HANDLER for closing the view modal ---
    const handleViewModalCancel = () => {
        setIsViewModalOpen(false);
        setSelectedLeave(null);
    };

    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !user) return; // Guard against running when not authenticated
        setLoading(true);
        try {
            // --- SIMPLIFIED data fetching ---
            const typesRes = await fetchAllLeaveTypes();
            setLeaveTypes(typesRes || []);

            // Employees ONLY fetch their own leave
            if (isEmployee && !isAdmin) {
                if(currentEmployeeId) {
                    const myLeavesRes = await fetchEmployeesLeave(currentEmployeeId);
                    setMyLeaves(myLeavesRes.data || []);
                }
            } else { // Admins fetch everything
                const [empRes, teamRes, myRes] = await Promise.all([
                    fetchEmployees(1, 1000), // Fetch full employee list for dropdowns
                    fetchLeaves(teamPagination.current, teamPagination.pageSize),
                    currentEmployeeId ? fetchEmployeesLeave(currentEmployeeId) : Promise.resolve({ data: [] })
                ]);

                const allEmployees = empRes.data || [];
                setAllEmployees(allEmployees);
                const newEmployeeMap: { [id: number]: Employee } = {};
                allEmployees.forEach((emp: Employee) => { newEmployeeMap[emp.id] = emp; });
                setEmployeeMap(newEmployeeMap);

                setTeamLeaves(teamRes.data || []);
                setMyLeaves(myRes.data || []);
                setTeamPagination(prev => ({...prev, total: teamRes.total_items}));
            }
        } catch (error) {
            message.error("Failed to fetch leave data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, isEmployee, isAdmin, currentEmployeeId, teamPagination.current, teamPagination.pageSize]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    const handleAddLeave = () => {
        setSelectedLeave(null);
        form.resetFields();
        if (isEmployee && employee) {
            form.setFieldsValue({ employee_id: employee.data.id });
        }
        setIsModalOpen(true);
    };

    const handleEditLeave = (record: Leave) => {
        setSelectedLeave(record);
        const formValues = {
            employee_id: record.employee_id,
            leave_type_id: record.leave_type.id,
            reason: record.reason,
            date_range: [dayjs(record.start_date), dayjs(record.end_date)], // For Desktop
            start_date: dayjs(record.start_date), // For Mobile
            end_date: dayjs(record.end_date),     // For Mobile
        };
        form.setFieldsValue(formValues);
        setIsModalOpen(true);
    };

    const handleCancel = (id: number) => {
        const recordToCancel = myLeaves.find(leave => leave.id === id);
        if (!recordToCancel || !employee?.data?.company_id) {
            message.error("Could not find the leave request to cancel.");
            return;
        }
        Modal.confirm({
            title: 'Cancel Leave Request?',
            content: 'Are you sure you want to cancel this leave request?',
            okText: 'Yes, Cancel',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const companyId = localStorage.getItem('company_id');
                    if (!companyId) {
                        message.error("Company ID not found. Please log in again.");
                        return;
                    }
                    const payload = {
                        id: recordToCancel.id,
                        employee_id: recordToCancel.employee_id,
                        company_id: employee?.data?.company_id,
                        leave_type_id: recordToCancel.leave_type.id,
                        status_id: 4,
                        start_date: recordToCancel.start_date,
                        end_date: recordToCancel.end_date,
                        reason: recordToCancel.reason,
                    };
                    await updateLeave(payload);
                    message.success("Leave request has been cancelled.");
                    fetchData();
                } catch (error) {
                    message.error("Failed to cancel the leave request.");
                }
            },
        });
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Leave Request?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteLeave(id);
                    message.success("Leave request deleted successfully.");
                    fetchData();
                } catch (error) {
                    message.error("Failed to delete leave request.");
                }
            },
        });
    };

    const handleManageLeave = (record: Leave) => {
        setSelectedLeave(record);
        setIsManageModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setIsManageModalOpen(false);
        form.resetFields();
        setSelectedLeave(null);
    };

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        if (!employee?.data?.company_id) {
            message.error("Company ID not found. Please log in again.");
            setIsSubmitting(false);
            return;
        }
        try {
            const startDate = values.date_range ? values.date_range[0] : values.start_date;
            const endDate = values.date_range ? values.date_range[1] : values.end_date;
            const payload = {
                ...values,
                company_id: Number(employee?.data?.company_id),
                start_date: startDate.format("YYYY-MM-DD"),
                end_date: endDate.format("YYYY-MM-DD")
            };
            delete payload.date_range;
            if (selectedLeave) {
                await updateLeave({ ...payload, id: selectedLeave.id, status_id: selectedLeave.status.id });
                message.success("Leave updated!");
            } else {
                await createLeave({ ...payload, status_id: 1 }); // Default to Pending
                message.success("Leave created!");
            }
            handleModalCancel();
            fetchData();
        } catch (error: any) { message.error(error?.response?.data?.message || "Operation failed."); }
        finally { setIsSubmitting(false); }
    };

    const handleApprovalAction = async (values: { comments: string }, action: string) => {
        if (!selectedLeave) return;
        setIsSubmitting(true);
        try {
            await ApproveLeave({ leave_id: selectedLeave.id, action, comments: values.comments });
            message.success(`Leave status updated.`);
            handleModalCancel();
            fetchData();
        } catch (error: any) { message.error(error?.response?.data?.message || "Failed to update status."); }
        finally { setIsSubmitting(false); }
    };

    const handleTableChange = (pagination: any) => {
        setTeamPagination(prev => ({...prev, current: pagination.current}));
    }

    const MyLeaveListComponent = (
        <MyLeaveView isMobile={isMobile} myLeaves={myLeaves} loading={loading} onEdit={handleEditLeave} onCancel={handleCancel} onView={handleViewDetails} />
    );
    const MyLeaveBoardComponent = (
        <BoardView leaves={myLeaves} employeeMap={employeeMap} onView={handleViewDetails} onEdit={handleEditLeave} onManage={handleManageLeave} onDelete={handleCancel} hideEmployeeName={true} />
    );
    const TeamLeaveListComponent = (
        <TeamLeaveView isMobile={isMobile} leaves={teamLeaves} loading={loading} pagination={teamPagination} employeeMap={employeeMap} onTableChange={handleTableChange} onView={handleViewDetails} onEdit={handleEditLeave} onManage={handleManageLeave} onDelete={handleDelete} isAdmin={!!isAdmin} />
    );
    const TeamLeaveBoardComponent = (
        <BoardView leaves={teamLeaves} employeeMap={employeeMap} onView={handleViewDetails} onEdit={handleEditLeave} onManage={handleManageLeave} onDelete={handleDelete} />
    );

    const getTabItems = () => {
        const myLeaveTab = {
            key: 'my',
            label: <span className="flex items-center gap-2"><LuUser /> My Leave</span>,
            children: (
                <Card bordered={false}>
                    <div className="flex justify-end mb-4">
                        <Radio.Group value={myViewMode} onChange={(e) => setMyViewMode(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="list"><LuList className="inline-block align-middle mr-1" /> List</Radio.Button>
                            <Radio.Button value="board"><LuLayoutDashboard className="inline-block align-middle mr-1" /> Board</Radio.Button>
                        </Radio.Group>
                    </div>
                    {myViewMode === 'list' ? MyLeaveListComponent : MyLeaveBoardComponent}
                </Card>
            )
        };
        const teamLeaveTab = {
            key: 'team',
            label: <span className="flex items-center gap-2"><LuUsers /> Team Leave</span>,
            children: (
                <Card bordered={false}>
                    <div className="flex justify-end mb-4">
                        <Radio.Group value={teamViewMode} onChange={(e) => setTeamViewMode(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="list"><LuList className="inline-block align-middle mr-1" /> List</Radio.Button>
                            <Radio.Button value="board"><LuLayoutDashboard className="inline-block align-middle mr-1" /> Board</Radio.Button>
                        </Radio.Group>
                    </div>
                    {teamViewMode === 'list' ? TeamLeaveListComponent : TeamLeaveBoardComponent}
                </Card>
            )
        };
        if (isAdmin) return [teamLeaveTab, myLeaveTab];
        return [myLeaveTab];
    };

    if (authLoading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                    <Title level={2} className="!mb-1">Leave Management</Title>
                    <Breadcrumb items={[{ href: '/dashboard', title: <Space><HomeOutlined /> Home</Space> }, { title: 'Leave' }]} />
                </Col>
                <Col>
                    <Space wrap>
                        <Dropdown menu={{ items: menuItems }} placement="bottomRight" disabled={exporting}>
                            <Button loading={exporting}>Export <FaEllipsisV className="inline-block" /></Button>
                        </Dropdown>
                        <Button icon={<BiCalendar />} onClick={() => router.push("/dashboard/list/leaves/calender")}>Calendar View</Button>
                        <Button type="primary" icon={<MdAdd />} onClick={handleAddLeave}>Request Leave</Button>
                    </Space>
                </Col>
            </Row>

            <Tabs
                key={user?.roles.join('-')}
                defaultActiveKey={isAdmin ? 'team' : 'my'}
                items={getTabItems()}
                onChange={(key) => setActiveTabKey(key)}
                type="card"
                className="modern-tabs"
            />

            {/* --- Modals --- */}
            <Modal title="Leave Request Details" open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]} width={600}>
                <Spin spinning={viewLoading}>
                    {selectedLeave && (
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="Employee">{employeeMap[selectedLeave.employee_id]?.name}</Descriptions.Item>
                                <Descriptions.Item label="Status">{getStatusTag(selectedLeave.status)}</Descriptions.Item>
                                <Descriptions.Item label="Leave Type">{selectedLeave.leave_type?.type_name}</Descriptions.Item>
                                <Descriptions.Item label="Applied On">{moment(selectedLeave.applied_on).format("DD MMM YYYY")}</Descriptions.Item>
                                <Descriptions.Item label="Dates" span={2}>{moment(selectedLeave.start_date).format("DD MMM YYYY")} to {moment(selectedLeave.end_date).format("DD MMM YYYY")}</Descriptions.Item>
                                <Descriptions.Item label="Reason" span={2}>{selectedLeave.reason}</Descriptions.Item>
                            </Descriptions>
                            <Card size="small" title="Approval History"><ApprovalHistory approvals={selectedLeave.approved || []} employeeMap={employeeMap} /></Card>
                        </Space>
                    )}
                </Spin>
            </Modal>
            <Modal title={selectedLeave ? "Edit Leave Request" : "New Leave Request"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting}>
                <LeaveRequestForm form={form} onFinish={handleFormSubmit} employees={employeesAll} leaveTypes={leaveTypes} loading={false} user={user} />
            </Modal>
            <Modal title="Manage Leave Request" open={isManageModalOpen} onCancel={handleModalCancel} footer={null}>
                {selectedLeave && (
                    <Form form={approvalForm} layout="vertical" onFinish={() => {}}>
                        <p>Approve or reject the leave for <strong>{employeeMap[selectedLeave.employee_id]?.name || '...'}</strong>?</p>
                        <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                        <Form.Item name="comments" label="Manager Comments" rules={[{ required: true, message: 'Please provide a comment.' }]}>
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button onClick={handleModalCancel}>Cancel</Button>
                            <Button danger loading={isSubmitting} onClick={() => approvalForm.validateFields().then(values => handleApprovalAction(values, 'Rejected'))} icon={<FaTimes />}>Reject</Button>
                            <Button type="primary" loading={isSubmitting} onClick={() => approvalForm.validateFields().then(values => handleApprovalAction(values, 'Approved'))} icon={<FaCheck />}>Approve</Button>
                        </div>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default LeaveManagementPage;