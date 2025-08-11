"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// --- Ant Design Components ---
import { Button, Card, Form, Input, InputNumber, List, message, Modal, Space, Spin, Table } from "antd";
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight } from "react-icons/md";

// --- API & Data ---
import {
    fetchLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
} from "@/lib/api/leave";

// Corrected Type Definition matching the API payload and response data
type LeaveType = {
    id: number;
    prefix: string;
    type_name: string;
    max_days: number;
    description?: string;
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

// --- Reusable Form Component ---
const LeaveTypeForm = ({ form, onFinish }: { form: any, onFinish: (values: any) => void }) => (
    <Form form={form} layout="vertical" name="leave_type_form" onFinish={onFinish}>
        <Form.Item name="prefix" label="Prefix" rules={[{ required: true, message: 'Please input the prefix!' }]}>
            <Input placeholder="e.g., SL, AL" />
        </Form.Item>
        <Form.Item name="type_name" label="Leave Type Name" rules={[{ required: true, message: 'Please input the name!' }]}>
            <Input placeholder="e.g., Sick Leave, Annual Leave" />
        </Form.Item>
        <Form.Item name="max_days" label="Maximum Days per Year" rules={[{ required: true, message: 'Please input the max days!' }]}>
            <InputNumber min={1} className="w-full" placeholder="e.g., 14" />
        </Form.Item>
        <Form.Item name="description" label="Description (Optional)">
            <Input.TextArea rows={3} placeholder="Describe the leave type policy" />
        </Form.Item>
    </Form>
);

// --- Main Combined Component ---
const LeaveTypeManagementPage = () => {
    // --- Hooks ---
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [form] = Form.useForm();
    const router = useRouter();

    // --- Effects ---
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            fetchData();
        }
    }, [isClient]);

    // --- Data Functions ---
    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await fetchLeaveTypes(page, pageSize);
            setLeaveTypes(res.data || []);
            setPagination({ current: page, pageSize, total: res.total_items });
        } catch (error) {
            message.error("Failed to fetch leave types.");
        } finally {
            setLoading(false);
        }
    };

    // --- Conditional Return ---
    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }
    
    // --- Event Handlers ---
    const handleModalOpen = (record: LeaveType | null) => {
        setSelectedLeaveType(record);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleFormSubmit = async (values: Omit<LeaveType, 'id'>) => {
        setIsSubmitting(true);
        try {
            if (selectedLeaveType) {
                await updateLeaveType({ ...values, id: selectedLeaveType.id });
                message.success("Leave type updated successfully!");
            } else {
                await createLeaveType(values);
                message.success("Leave type created successfully!");
            }
            handleModalCancel();
            fetchData(pagination.current);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this leave type?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteLeaveType(id);
                    message.success("Leave type deleted successfully.");
                    fetchData(pagination.current);
                } catch (error) {
                    message.error("Failed to delete leave type.");
                }
            },
        });
    };

    const commonProps = {
        leaveTypes,
        loading,
        pagination,
        fetchData,
        handleModalOpen,
        handleDelete,
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Leave Types</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight />
                        <span>Leave Types</span>
                    </div>
                </div>
                <Button type="primary" onClick={() => handleModalOpen(null)}>
                    Add Type
                </Button>
            </div>

            {isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />}

            <Modal
                title={selectedLeaveType ? "Edit Leave Type" : "Add New Leave Type"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
            >
                <LeaveTypeForm form={form} onFinish={handleFormSubmit} />
            </Modal>
        </div>
    );
};


// --- Desktop View ---
const DesktopView = ({ leaveTypes, loading, pagination, fetchData, handleModalOpen, handleDelete }: any) => {
    
    const handleTableChange: TableProps<LeaveType>['onChange'] = (newPagination) => {
        fetchData(newPagination.current, newPagination.pageSize);
    };

    const columns: TableProps<LeaveType>['columns'] = [
        { title: 'Prefix', dataIndex: 'prefix', key: 'prefix' },
        { title: 'Leave Type', dataIndex: 'type_name', key: 'type_name' },
        { title: 'Days / Year', dataIndex: 'max_days', key: 'max_days', align: 'center' },
        {
            title: 'Action', key: 'action', align: 'right', render: (_, record: LeaveType) => (
                <Space size="middle">
                    <Button onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Table
                columns={columns}
                dataSource={leaveTypes}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />
        </Card>
    );
};

// --- Mobile View ---
const MobileView = ({ leaveTypes, loading, pagination, fetchData, handleModalOpen, handleDelete }: any) => (
    <Spin spinning={loading}>
        <List
            dataSource={leaveTypes}
            renderItem={(item: LeaveType) => (
                <List.Item
                    actions={[
                        <Button type="text" shape="circle"  onClick={() => handleModalOpen(item)} />,
                        <Button type="text" shape="circle" danger  onClick={() => handleDelete(item.id)} />,
                    ]}
                >
                    <List.Item.Meta
                        title={`${item.prefix} - ${item.type_name}`}
                        description={`${item.max_days} days per year`}
                    />
                </List.Item>
            )}
        />
        {pagination.current * pagination.pageSize < pagination.total && (
            <div className="flex justify-center mt-4">
                <Button onClick={() => fetchData(pagination.current + 1, pagination.pageSize)} disabled={loading}>
                    Load More
                </Button>
            </div>
        )}
    </Spin>
);

export default LeaveTypeManagementPage;