"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import dayjs from "dayjs";

// --- Ant Design Components ---
import {
    Card, Button, DatePicker, message, Select, Space, Input, Modal, Form, Table, Tag, Spin, List, Tabs, Descriptions,
    Collapse
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
    // 'approved' will be populated on-demand when viewing details
    approved?: Approval[];
};

// --- Responsive Hook ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => { if (typeof window !== "undefined") { const handleResize = () => setIsMobile(window.innerWidth < breakpoint); window.addEventListener("resize", handleResize); handleResize(); return () => window.removeEventListener("resize", handleResize); } }, [breakpoint]);
    return isMobile;
};

// --- Reusable Form Component ---
const LeaveRequestForm = ({ form, onFinish, employees, leaveTypes, loading, isMobile }: { form: any, onFinish: (v: any) => void, employees: Employee[], leaveTypes: LeaveType[], loading: boolean, isMobile: boolean }) => {

    const [role, setRole] = useState<string | null>(null);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [employeeName, setEmployeeName] = useState<string | null>(null);

    useEffect(() => {
        setRole(localStorage.getItem('user_role'));
        setEmployeeId(localStorage.getItem('employee_id'));
        setEmployeeName(localStorage.getItem('user_name'));
    }, []);

    const [startDateValue, setStartDateValue] = useState<dayjs.Dayjs | null>(null);

    const employeeOptions = (role === 'Employee' && employeeId && employeeName)
        ? [{ label: employeeName, value: Number(employeeId) }]
        : employees.map(e => ({ label: e.name, value: e.id }));

    return (
        <Form form={form} layout="vertical" name="leave_request_form" onFinish={onFinish}>
            <Spin spinning={loading} tip="Loading data...">
                <Form.Item name="employee_id" label="Employee Name" rules={[{ required: true }]}>
                    <Select placeholder="Select employee" options={employeeOptions} showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} disabled={role === 'Employee'} />
                </Form.Item>
                <Form.Item name="leave_type_id" label="Leave Type" rules={[{ required: true }]}>
                    <Select placeholder="Select leave type" options={leaveTypes.map(t => ({ label: t.type_name, value: t.id }))} />
                </Form.Item>

                {/* --- CONDITIONAL DATE PICKER --- */}
                {isMobile ? (
                    <>
                        {/* --- ALWAYS use two separate date pickers --- */}
                        <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Please select a start date!' }]}>
                            <DatePicker
                                className="w-full"
                                placeholder="Select start date"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                onChange={(date) => setStartDateValue(date)}
                            />
                        </Form.Item>
                        <Form.Item
                            name="end_date"
                            label="End Date"
                            dependencies={['start_date']}
                            rules={[
                                { required: true, message: 'Please select an end date!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || !getFieldValue('start_date')) {
                                            return Promise.resolve(); // Let the required rule handle it
                                        }
                                        if (value.isBefore(getFieldValue('start_date'))) {
                                            return Promise.reject(new Error('End date cannot be before start date!'));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                className="w-full"
                                // Disable dates before the selected start date for a better UX
                                disabledDate={(current) => current && (current < dayjs().startOf('day') || (startDateValue ? current < startDateValue : false))}
                            />
                        </Form.Item>
                    </>
                ) : (
                    <Form.Item name="date_range" label="Date Range" rules={[{ required: true }]}>
                        <DatePicker.RangePicker className="w-full" disabledDate={(current) => current && current < dayjs().startOf('day')} />
                    </Form.Item>
                )}

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

// --- View for Team Leave Requests (Updated with onView) ---
// --- View for Team Leave Requests (Corrected and Updated) ---
const TeamLeaveView = ({ isMobile, leaves, loading, pagination, employeeMap, onTableChange, onEdit, onManage, onDelete, onView }: { isMobile: boolean, leaves: Leave[], loading: boolean, pagination: any, employeeMap: { [id: number]: Employee }, onTableChange: (p: any) => void, onEdit: (r: Leave) => void, onManage: (r: Leave) => void, onDelete: (id: number) => void, onView: (r: Leave) => void; }) => {

    const columns: TableProps<Leave>['columns'] = [
        { title: 'Employee', key: 'employee', render: (_, record) => employeeMap[record.employee_id]?.name || 'Unknown' },
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Applied On', dataIndex: 'applied_on', key: 'applied', render: (d) => moment(d).format("DD MMM YYYY") },
        { title: 'Dates', key: 'dates', render: (_, r) => `${moment(r.start_date).format("DD MMM")} - ${moment(r.end_date).format("DD MMM YYYY")}` },
        { title: 'Days', key: 'days', render: (_, r) => `${moment(r.end_date).diff(moment(r.start_date), 'days') + 1}d` },
        { title: 'Status', key: 'status', render: (_, record) => getStatusTag(record.status) },
        {
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
        },
    ];

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

// --- View for My Leave Requests (Updated with onView) ---
const MyLeaveView = ({ isMobile, myLeaves, loading, onEdit, onCancel, onView, employeeMap }: {
    isMobile: boolean;
    myLeaves: Leave[];
    loading: boolean;
    onEdit: (record: Leave) => void;
    onCancel: (id: number) => void;
    onView: (record: Leave) => void;
    employeeMap: { [id: number]: Employee };
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


// --- Main Page Component ---
const LeaveManagementPage = () => {
    const [role, setRole] = useState<string | null>(null);
    useEffect(() => { setRole(localStorage.getItem('user_role')); }, []);

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
    const [activeTabKey, setActiveTabKey] = useState(role === 'Employee' ? 'my' : 'team');

    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [approvalForm] = Form.useForm();

    // --- NEW STATE FOR VIEW MODAL ---
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    // --- NEW HANDLER for viewing details ---
    const handleViewDetails = async (record: Leave) => {
        setIsViewModalOpen(true);
        setViewLoading(true);
        setSelectedLeave(record); // Set basic data immediately
        try {
            const res = await getLeaveById(record.id);
            // API response has data nested under `result.data`
            setSelectedLeave(res.data.result.data);
        } catch {
            message.error("Failed to fetch leave details.");
            setIsViewModalOpen(false); // Close modal on error
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
        setLoading(true);
        try {
            const currentEmployeeId = localStorage.getItem('employee_id');

            // Fetch employees and leave types once if they are not already loaded
            if (employees.length === 0) {
                const [empRes, typesRes] = await Promise.all([
                    fetchEmployees(1, 1000),
                    fetchAllLeaveTypes()
                ]);
                const allEmployees = empRes.data || [];
                setEmployees(allEmployees);
                setLeaveTypes(typesRes || []);
                const newEmployeeMap: { [id: number]: Employee } = {};
                allEmployees.forEach((emp: Employee) => { newEmployeeMap[emp.id] = emp; });
                setEmployeeMap(newEmployeeMap);
            }

            // Fetch role-specific leave data
            if (role === 'Employee') {
                if (currentEmployeeId) {
                    const myLeavesRes = await fetchEmployeesLeave(Number(currentEmployeeId));
                    setMyLeaves(myLeavesRes.data || []);
                }
            } else { // For Admin/Manager
                if (currentEmployeeId) {
                    const [teamRes, myRes] = await Promise.all([
                        fetchLeaves(teamPagination.current, teamPagination.pageSize),
                        fetchEmployeesLeave(Number(currentEmployeeId))
                    ]);
                    setTeamLeaves(teamRes.data || []);
                    setMyLeaves(myRes.data || []);
                    setTeamPagination(prev => ({...prev, total: teamRes.total_items}));
                }
            }
        } catch (error) {
            message.error("Failed to fetch leave data.");
        } finally {
            setLoading(false);
        }
    }, [role, employees.length, teamPagination.current, teamPagination.pageSize]);


    useEffect(() => {
        if (isClient && role) {
            fetchData();
        }
    }, [isClient, role, teamPagination.current, fetchData]);

    useEffect(() => {
        setEmployeeId(localStorage.getItem('employee_id'));
        setCompanyId(localStorage.getItem('company_id'));
    }, []);

    const handleAddLeave = () => {
        setSelectedLeave(null);
        form.resetFields();
        if (role === 'Employee' && employeeId) {
            form.setFieldsValue({ employee_id: Number(employeeId) });
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
        if (!recordToCancel) {
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
                        company_id: Number(companyId),
                        leave_type_id: recordToCancel.leave_type.id,
                        status_id: 4, // Assuming 4 is 'Cancelled' status
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
        if (!companyId) {
            message.error("Company ID not found. Please log in again.");
            setIsSubmitting(false);
            return;
        }
        try {
            const startDate = values.date_range ? values.date_range[0] : values.start_date;
            const endDate = values.date_range ? values.date_range[1] : values.end_date;
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

    const getTabItems = () => {
        const myLeaveTab = {
            key: 'my',
            label: 'My Leave Requests',
            children: <MyLeaveView
                isMobile={isMobile}
                myLeaves={myLeaves}
                loading={loading}
                employeeMap={employeeMap}
                onView={handleViewDetails}
                onEdit={handleEditLeave}
                onCancel={handleCancel}
            />
        };
        const teamLeaveTab = {
            key: 'team',
            label: 'Team Leave Requests',
            children: <TeamLeaveView
                isMobile={isMobile}
                leaves={teamLeaves}
                loading={loading}
                pagination={teamPagination}
                employeeMap={employeeMap}
                onTableChange={handleTableChange}
                onView={handleViewDetails}
                onEdit={handleEditLeave}
                onManage={handleManageLeave}
                onDelete={handleDelete}
            />
        };
        if (role && role !== 'Employee') {
            return [teamLeaveTab, myLeaveTab];
        }
        return [myLeaveTab];
    }

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

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
                <Tabs
                    key={role}
                    defaultActiveKey={role === 'Employee' ? 'my' : 'team'}
                    items={getTabItems()}
                    onChange={setActiveTabKey}
                />
            </Card>

            {/* --- NEW VIEW DETAILS MODAL --- */}
            <Modal
                title="Leave Request Details"
                open={isViewModalOpen}
                onCancel={handleViewModalCancel}
                footer={[ <Button key="close" onClick={handleViewModalCancel}>Close</Button> ]}
                width={600}
            >
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

                            <Card size="small" title="Approval History">
                                <ApprovalHistory approvals={selectedLeave.approved || []} employeeMap={employeeMap} />
                            </Card>
                        </Space>
                    )}
                </Spin>
            </Modal>

            {/* Edit/Create Modal */}
            <Modal title={selectedLeave ? "Edit Leave Request" : "New Leave Request"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting}>
                <LeaveRequestForm form={form} onFinish={handleFormSubmit} employees={employees} leaveTypes={leaveTypes} loading={dropdownLoading} isMobile={isMobile}/>
            </Modal>

            {/* Manage/Approve Modal */}
            <Modal
                title="Manage Leave Request"
                open={isManageModalOpen}
                onCancel={handleModalCancel}
                footer={null}
            >
                {selectedLeave && (
                    <Form
                        form={approvalForm}
                        layout="vertical"
                        onFinish={() => {}} // onFinish is not needed here as buttons have their own handlers
                    >
                        <p>Approve or reject the leave request for <strong>{employeeMap[selectedLeave.employee_id]?.name || '...'}</strong>?</p>
                        <p><strong>Reason Provided:</strong> {selectedLeave.reason}</p>

                        <Form.Item
                            name="comments"
                            label="Manager Comments"
                            rules={[{ required: true, message: 'Please provide a comment for your decision.' }]}
                        >
                            <Input.TextArea rows={4} placeholder="e.g., Approved, project timeline allows for it." />
                        </Form.Item>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button key="back" onClick={handleModalCancel}>
                                Cancel
                            </Button>
                            <Button
                                key="reject"
                                danger
                                loading={isSubmitting}
                                onClick={() => approvalForm.validateFields().then(values => handleApprovalAction(values, 'Rejected'))}
                                icon={<FaTimes />}
                            >
                                Reject
                            </Button>
                            <Button
                                key="approve"
                                type="primary"
                                loading={isSubmitting}
                                onClick={() => approvalForm.validateFields().then(values => handleApprovalAction(values, 'Approved'))}
                                icon={<FaCheck />}
                            >
                                Approve
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default LeaveManagementPage;