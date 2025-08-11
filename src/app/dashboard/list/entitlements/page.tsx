"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import dayjs from 'dayjs';

// --- Ant Design Components ---
import { Button, Card, Form, InputNumber, List, message, Modal, Select, Space, Spin, Table, DatePicker, Progress, Tag, Row, Col } from "antd";
import type { TableProps } from 'antd';

// --- Icons (from react-icons) ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete } from "react-icons/md";

// --- API & Data ---
import {
    fetchEntitlements,
    createEntitlement, // Enabled
    // updateEntitlement, // Placeholder
    deleteEntitlement, // Enabled
} from "@/lib/api/leave";
import { fetchEmployees, Employee } from "@/lib/api/employee";
import { fetchAllLeaveTypes, LeaveType } from "@/lib/api/leave";

// --- Type Definitions ---
type LeaveEntitlement = {
    id: number;
    employee_id: number;
    leave_type_id: number;
    total_days: number;
    used_days: number;
    remain_days: number;
    start_period: string;
    end_period: string;
};

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

// --- Reusable Form Component (Updated) ---
const EntitlementForm = ({ form, onFinish, employees, leaveTypes }: { form: any; onFinish: (values: any) => void; employees: Employee[]; leaveTypes: LeaveType[] }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="employee_id" label="Employee" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select an employee" options={employees.map(e => ({ value: e.id, label: e.name }))} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
        </Form.Item>
        <Form.Item name="leave_type_id" label="Leave Type" rules={[{ required: true }]}>
            <Select placeholder="Select a leave type" options={leaveTypes.map(lt => ({ value: lt.id, label: lt.type_name }))} />
        </Form.Item>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="total_days" label="Total Days" rules={[{ required: true }]}>
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
            </Col>
            <Col span={12}>
                {/* ADDED: used_days field for creation */}
                <Form.Item name="used_days" label="Used Days (Initial)" initialValue={0} rules={[{ required: true }]}>
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
            </Col>
        </Row>
        <Form.Item name="period" label="Validity Period" rules={[{ required: true }]}>
            <DatePicker.RangePicker className="w-full" />
        </Form.Item>
    </Form>
);

// --- Main Page Component ---
const LeaveEntitlementPage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [employeeMap, setEmployeeMap] = useState<{ [id: number]: string }>({});
    const [leaveTypeMap, setLeaveTypeMap] = useState<{ [id: number]: string }>({});

    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEntitlement, setSelectedEntitlement] = useState<LeaveEntitlement | null>(null);

    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const [entRes, empRes, ltRes] = await Promise.all([
                fetchEntitlements(page, pageSize),
                employees.length ? Promise.resolve({ data: employees }) : fetchEmployees(1, 1000),
                leaveTypes.length ? Promise.resolve(leaveTypes) : fetchAllLeaveTypes(), // Corrected promise resolve
            ]);

            setEntitlements(entRes.data || []);
            setPagination({ current: page, pageSize, total: entRes.total_items || (entRes.data || []).length });

            if (employees.length === 0) {
                const allEmployees = empRes.data || [];
                setEmployees(allEmployees);
                const newEmpMap: { [id: number]: string } = {};
                allEmployees.forEach((emp: Employee) => { newEmpMap[emp.id] = emp.name; });
                setEmployeeMap(newEmpMap);
            }
            if (leaveTypes.length === 0) {
                // CORRECTED: Use ltRes directly as it's already the array
                const allLeaveTypes = ltRes || []; 
                setLeaveTypes(allLeaveTypes);
                const newLtMap: { [id: number]: string } = {};
                allLeaveTypes.forEach((lt: LeaveType) => { newLtMap[lt.id] = lt.type_name; });
                setLeaveTypeMap(newLtMap);
            }
        } catch (error) {
            message.error("Failed to fetch entitlement data.");
        } finally {
            setLoading(false);
        }
    }, [employees.length, leaveTypes.length]);

    useEffect(() => { setIsClient(true); }, []);
    useEffect(() => { if (isClient) fetchData(pagination.current, pagination.pageSize); }, [isClient, pagination.current, pagination.pageSize]);

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    const handleModalOpen = (record: LeaveEntitlement | null) => {
        setSelectedEntitlement(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                period: [dayjs(record.start_period), dayjs(record.end_period)],
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => { setIsModalOpen(false); form.resetFields(); };

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            if (selectedEntitlement) {
                // An updateEntitlement function is needed for this logic
                message.info("Update functionality is not yet implemented.");
            } else {
                const payload = {
                    employee_id: values.employee_id,
                    leave_type_id: values.leave_type_id,
                    entitlement_type_id: 1,
                    total_days: values.total_days,
                    used_days: values.used_days || 0,
                    start_period: values.period[0].format('YYYY-MM-DD'),
                    end_period: values.period[1].format('YYYY-MM-DD'),
                };
                await createEntitlement(payload);
                message.success("Entitlement assigned successfully!");
            }
            handleModalCancel();
            fetchData(pagination.current, pagination.pageSize);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Operation failed.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Entitlement?',
            content: 'This will permanently remove the leave balance for this employee and type.',
            okText: 'Delete', okType: 'danger',
            onOk: async () => {
                try {
                    await deleteEntitlement(id);
                    message.success("Entitlement deleted.");
                    fetchData(pagination.current, pagination.pageSize);
                } catch { message.error("Failed to delete entitlement."); }
            },
        });
    };
    
    const handleTableChange: TableProps<LeaveEntitlement>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    const viewProps = { entitlements, loading, pagination, handleTableChange, handleModalOpen, handleDelete, employeeMap, leaveTypeMap };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Leave Entitlements</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Entitlements</span>
                    </div>
                </div>
                <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Assign Entitlement</Button>
            </div>
            <Card>
                {isMobile ? <MobileView {...viewProps} /> : <DesktopView {...viewProps} />}
            </Card>
            <Modal title={selectedEntitlement ? "Edit Entitlement" : "Assign New Entitlement"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting}>
                <EntitlementForm form={form} onFinish={handleFormSubmit} employees={employees} leaveTypes={leaveTypes} />
            </Modal>
        </div>
    );
};
// --- Desktop View Sub-Component ---
const DesktopView = ({ entitlements, loading, pagination, handleTableChange, handleModalOpen, handleDelete, employeeMap, leaveTypeMap }: any) => {
    const columns: TableProps<LeaveEntitlement>['columns'] = [
        { title: 'Employee', dataIndex: 'employee_id', key: 'employee', render: (id) => employeeMap[id] || `ID: ${id}` },
        { title: 'Leave Type', dataIndex: 'leave_type_id', key: 'leave_type', render: (id) => leaveTypeMap[id] || `ID: ${id}` },
        { title: 'Period', key: 'period', render: (_, r) => `${moment(r.start_period).format("DD MMM YY")} - ${moment(r.end_period).format("DD MMM YY")}` },
        { title: 'Total', dataIndex: 'total_days', key: 'total', align: 'center' },
        { title: 'Used', dataIndex: 'used_days', key: 'used', align: 'center' },
        { title: 'Remaining', dataIndex: 'remain_days', key: 'remain', align: 'center', render: (days) => <Tag color={days > 0 ? 'green' : 'red'}>{days}</Tag> },
        { title: 'Actions', key: 'actions', align: 'right', render: (_, record: LeaveEntitlement) => (
            <Space>
                <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
            </Space>
        )}
    ];
    return <Table columns={columns} dataSource={entitlements} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />;
};

// --- Mobile View Sub-Component ---
const MobileView = ({ entitlements, loading, handleModalOpen, handleDelete, employeeMap, leaveTypeMap }: any) => (
    <List
        loading={loading}
        dataSource={entitlements}
        renderItem={(item: LeaveEntitlement) => (
            <List.Item
                actions={[
                    <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                    <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                ]}
            >
                <List.Item.Meta
                    title={employeeMap[item.employee_id] || `Employee ID: ${item.employee_id}`}
                    description={
                        <div>
                            <p>{leaveTypeMap[item.leave_type_id] || `Leave Type ID: ${item.leave_type_id}`}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Progress percent={item.total_days > 0 ? Math.round((item.used_days / item.total_days) * 100) : 0} size="small" showInfo={false} />
                                <span>{item.remain_days} / {item.total_days} days left</span>
                            </div>
                        </div>
                    }
                />
            </List.Item>
        )}
    />
);

export default LeaveEntitlementPage;