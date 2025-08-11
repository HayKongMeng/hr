// src/app/dashboard/leaves/page.tsx (or your path to LeaveManagementPage)

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import dayjs from "dayjs";

// --- Ant Design Components ---
import { Card , Button, DatePicker, message, Select, Space, Input, Modal, Form, Table, Tag, Spin, List, Tabs } from "antd";
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight, MdAdd, MdEdit } from "react-icons/md";
import { BiCalendar } from "react-icons/bi";
import { FaCheck, FaTimes } from "react-icons/fa";

// --- API & Data ---
import { createLeave, fetchAllLeaveTypes, fetchEmployeesLeave, fetchLeaves, updateLeave, createApprove, LeaveType, ApproveLeave } from "@/lib/api/leave";
import { Employee, fetchEmployees } from "@/lib/api/employee";

// --- Type Definitions ---
type Leave = {
    id: number;
    employee_id: number;
    leave_type: { id: number; type_name: string };
    status: { id: number; status_name: string };
    start_date: string;
    end_date: string;
    reason: string;
    applied_on: string;
};

// --- Responsive Hook ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => { if (typeof window !== "undefined") { const handleResize = () => setIsMobile(window.innerWidth < breakpoint); window.addEventListener("resize", handleResize); handleResize(); return () => window.removeEventListener("resize", handleResize); } }, [breakpoint]);
    return isMobile;
};

// --- Reusable Form Component ---
const LeaveRequestForm = ({ form, onFinish, employees, leaveTypes, loading }: { form: any, onFinish: (v: any) => void, employees: Employee[], leaveTypes: LeaveType[], loading: boolean }) => (
    <Form form={form} layout="vertical" name="leave_request_form" onFinish={onFinish}>
        <Spin spinning={loading} tip="Loading data...">
            <Form.Item name="employee_id" label="Employee Name" rules={[{ required: true }]}>
                <Select placeholder="Select employee" options={employees.map(e => ({ label: e.name, value: e.id }))} showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
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

// --- Shared Helper for Status Tags ---
const getStatusTag = (statusName: string) => {
    const normalized = statusName?.toLowerCase() || 'pending';
    let color = 'default';
    if (normalized === 'approved') color = 'success';
    else if (normalized === 'rejected') color = 'error';
    else if (normalized === 'pending') color = 'warning';
    return <Tag color={color}>{statusName?.toUpperCase() || 'N/A'}</Tag>;
};

// --- View for Team Leave Requests (Corrected) ---
const TeamLeaveView = ({ isMobile, leaves, loading, pagination, employeeMap, onTableChange, onEdit, onManage }: { isMobile: boolean, leaves: Leave[], loading: boolean, pagination: any, employeeMap: { [id: number]: Employee }, onTableChange: (p: any) => void, onEdit: (r: Leave) => void, onManage: (r: Leave) => void }) => {
    
    const columns: TableProps<Leave>['columns'] = [
        { title: 'Employee', dataIndex: 'employee_id', key: 'employee', render: (id) => employeeMap[id]?.name || `ID: ${id}` },
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Dates', key: 'dates', render: (_, r) => `${moment(r.start_date).format("DD MMM")} - ${moment(r.end_date).format("DD MMM")}` },
        { title: 'Days', key: 'days', render: (_, r) => `${moment(r.end_date).diff(moment(r.start_date), 'days') + 1}d` },
        { title: 'Status', dataIndex: ['status', 'status_name'], key: 'status', render: getStatusTag },
        { title: 'Actions', key: 'actions', render: (_, record) => (
            <Space>
                <Button onClick={() => onManage(record)} disabled={record.status.status_name !== 'Pending'}>Manage</Button>
                <Button icon={<MdEdit />} onClick={() => onEdit(record)}>Edit</Button>
            </Space>
        )}
    ];

    if (isMobile) {
        return <List
            loading={loading}
            dataSource={leaves}
            renderItem={(item) => (
                <List.Item
                    actions={[
                         <Button key="manage" type="text" shape="circle" onClick={() => onManage(item)} disabled={item.status.status_name !== 'Pending'} icon={<FaCheck />} />,
                         <Button key="edit" type="text" shape="circle" onClick={() => onEdit(item)} icon={<MdEdit />} />,
                    ]}
                >
                    <List.Item.Meta
                        title={employeeMap[item.employee_id]?.name || 'Unknown Employee'}
                        description={`${item.leave_type.type_name} | ${moment(item.start_date).format("DD MMM")} - ${moment(item.end_date).format("DD MMM")}`}
                    />
                    {getStatusTag(item.status.status_name)}
                </List.Item>
            )}
        />
    }

    return (
        <Table columns={columns} dataSource={leaves} rowKey="id" loading={loading} pagination={pagination} onChange={onTableChange} />
    );
};

// --- View for My Leave Requests ---
const MyLeaveView = ({ isMobile, myLeaves, loading }: { isMobile: boolean, myLeaves: Leave[], loading: boolean }) => {
    const columns: TableProps<Leave>['columns'] = [
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Applied On', dataIndex: 'applied_on', key: 'applied', render: (d) => moment(d).format("DD MMM YYYY") },
        { title: 'Dates', key: 'dates', render: (_, r) => `${moment(r.start_date).format("DD MMM")} - ${moment(r.end_date).format("DD MMM YYYY")}` },
        { title: 'Days', key: 'days', render: (_, r) => `${moment(r.end_date).diff(moment(r.start_date), 'days') + 1}d` },
        { title: 'Status', dataIndex: ['status', 'status_name'], key: 'status', render: getStatusTag },
    ];

     if (isMobile) {
        return <List
            loading={loading}
            dataSource={myLeaves}
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        title={item.leave_type.type_name}
                        description={`${moment(item.start_date).format("DD MMM")} - ${moment(item.end_date).format("DD MMM YYYY")}`}
                    />
                    {getStatusTag(item.status.status_name)}
                </List.Item>
            )}
        />
    }

    return <Table columns={columns} dataSource={myLeaves} rowKey="id" loading={loading} pagination={false} />;
};


// --- Main Page Component ---
const LeaveManagementPage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    const [teamLeaves, setTeamLeaves] = useState<Leave[]>([]);
    const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeMap, setEmployeeMap] = useState<{ [id: number]: Employee }>({});
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

    const [loading, setLoading] = useState(true);
    const [teamPagination, setTeamPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dropdownLoading, setDropdownLoading] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [activeTabKey, setActiveTabKey] = useState('team');
    
    useEffect(() => { setIsClient(true); }, []);
    
    const fetchData = useCallback(async (key: string) => {
        setLoading(true);
        try {
            if (employees.length === 0) {
                const [empRes, typesRes] = await Promise.all([fetchEmployees(1, 1000), fetchAllLeaveTypes()]);
                const allEmployees = empRes.data || [];
                setEmployees(allEmployees);
                setLeaveTypes(typesRes || []);
                const newEmployeeMap: { [id: number]: Employee } = {};
                allEmployees.forEach(emp => { newEmployeeMap[emp.id] = emp; });
                setEmployeeMap(newEmployeeMap);
            }

            if (key === 'team') {
                const res = await fetchLeaves(teamPagination.current, teamPagination.pageSize);
                setTeamLeaves(res.data || []);
                setTeamPagination(prev => ({...prev, total: res.total_items}));
            } else if (key === 'my') {
                const empoloyeeId = localStorage.getItem('employee_id');
                if (empoloyeeId) {
                    const res = await fetchEmployeesLeave(Number(empoloyeeId));
                    setMyLeaves(res.data || []);
                }
            }
        } catch (error) {
            message.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    }, [employees.length, teamPagination.current, teamPagination.pageSize]);

    useEffect(() => {
        if(isClient) fetchData(activeTabKey);
    }, [isClient, activeTabKey, fetchData]);

    const handleAddLeave = () => {
        setSelectedLeave(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditLeave = (record: Leave) => {
        setSelectedLeave(record);
        form.setFieldsValue({
            ...record,
            leave_type_id: record.leave_type.id, // Ensure leave_type_id is set for the form
            date_range: [dayjs(record.start_date), dayjs(record.end_date)],
        });
        setIsModalOpen(true);
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

    // CHANGE: Updated function to include company_id
    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        
        // NEW: Get company_id from localStorage
        const companyId = localStorage.getItem('company_id');

        // NEW: Add a safety check
        if (!companyId) {
            message.error("Company ID not found. Please log in again.");
            setIsSubmitting(false);
            return;
        }

        try {
            const [startDate, endDate] = values.date_range;
            // NEW: Add company_id to the payload
            const payload = { 
                ...values,
                company_id: Number(companyId), 
                start_date: startDate.format("YYYY-MM-DD"), 
                end_date: endDate.format("YYYY-MM-DD") 
            };
            delete payload.date_range;

            if (selectedLeave) {
                await updateLeave({ ...payload, id: selectedLeave.id, status_id: selectedLeave.status.id });
                message.success("Leave updated!");
            } else {
                await createLeave({ ...payload, status_id: 2 }); // Default to Pending
                message.success("Leave created!");
            }
            handleModalCancel();
            fetchData(activeTabKey);
        } catch (error: any) { message.error(error?.response?.data?.message || "Operation failed."); }
        finally { setIsSubmitting(false); }
    };
    
    const handleApprovalAction = async (status: string) => {
        if (!selectedLeave) return;
        const companyId = localStorage.getItem('company_id');
        if (!companyId) {
            message.error("Company ID not found. Please log in again.");
            return;
        }
        setIsSubmitting(true);
        try {
            await ApproveLeave({ leave_id: selectedLeave.id, status, company_id: Number(companyId) });
            message.success(`Leave status updated.`);
            handleModalCancel();
            fetchData(activeTabKey);
        } catch (error: any) { message.error(error?.response?.data?.message || "Failed to update status."); }
        finally { setIsSubmitting(false); }
    };
    
    const handleTableChange = (pagination: any) => {
        setTeamPagination(prev => ({...prev, current: pagination.current}));
    }

    const tabItems = [
        { key: 'team', label: 'Team Leave Requests', children: <TeamLeaveView isMobile={isMobile} leaves={teamLeaves} loading={loading} pagination={teamPagination} employeeMap={employeeMap} onTableChange={handleTableChange} onEdit={handleEditLeave} onManage={handleManageLeave} /> },
        { key: 'my', label: 'My Leave Requests', children: <MyLeaveView isMobile={isMobile} myLeaves={myLeaves} loading={loading} /> },
    ];

    if (!isClient) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Leave Management</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight />
                        <span>Leave</span>
                    </div>
                </div>
                <Space>
                    <Button icon={<BiCalendar />} onClick={() => router.push("/dashboard/list/leaves/calender")}>Calendar</Button>
                    <Button type="primary" icon={<MdAdd />} onClick={handleAddLeave}>Request Leave</Button>
                </Space>
            </div>
            
            <Card>
                <Tabs defaultActiveKey="team" items={tabItems} onChange={setActiveTabKey} />
            </Card>

            <Modal title={selectedLeave ? "Edit Leave Request" : "New Leave Request"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting}>
                <LeaveRequestForm form={form} onFinish={handleFormSubmit} employees={employees} leaveTypes={leaveTypes} loading={dropdownLoading} />
            </Modal>
            
            <Modal title="Manage Leave Request" open={isManageModalOpen} onCancel={handleModalCancel} footer={[
                <Button key="back" onClick={handleModalCancel}>Cancel</Button>,
                <Button key="reject" danger loading={isSubmitting} onClick={() => handleApprovalAction('Rejected')} icon={<FaTimes />}>Reject</Button>,
                <Button key="approve" type="primary" loading={isSubmitting} onClick={() => handleApprovalAction('Approved')} icon={<FaCheck />}>Approve</Button>,
            ]}>
                <p>Approve or reject the leave request for <strong>{employeeMap[selectedLeave?.employee_id || 0]?.name || '...'}</strong>?</p>
                <p><strong>Reason:</strong> {selectedLeave?.reason}</p>
            </Modal>
        </div>
    );
};

export default LeaveManagementPage;