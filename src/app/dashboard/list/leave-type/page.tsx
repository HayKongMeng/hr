"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// --- Ant Design Components ---
import { Button, Card, Descriptions, Form, Input, InputNumber, List, message, Modal, Space, Spin, Table } from "antd";
import type { DescriptionsProps, TableProps } from 'antd';

// --- Icons ---
import { MdAdd, MdDelete, MdEdit, MdKeyboardArrowRight, MdRemoveRedEye } from "react-icons/md";

// --- API & Data ---
import {
    fetchLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
} from "@/lib/api/leave";
import moment from "moment";
import { FiDatabase } from "react-icons/fi";

type LeaveType = {
    id: number;
    prefix: string;
    type_name: string;
    max_days: number;
    description?: string;
    created_at?: string;
};

const LeaveTypeDetail = ({ leaveType }: { leaveType: LeaveType | null }) => {
    if (!leaveType) return null;

    const items: DescriptionsProps['items'] = [
        { key: '1', label: 'Type Name', children: leaveType.type_name },
        { key: '2', label: 'Prefix', children: leaveType.prefix },
        { key: '3', label: 'Max Days / Year', children: `${leaveType.max_days} days` },
        { key: '4', label: 'Description', children: leaveType.description || 'N/A', span: 3 },
        { key: '5', label: 'Date Created', children: moment(leaveType.created_at).format("DD MMMM, YYYY") },
    ];

    return <Descriptions bordered column={1} items={items} />;
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

const SetupView = ({ onSetup, loading }: { onSetup: () => void; loading: boolean }) => (
    <Card>
        <div className="text-center p-8">
            <FiDatabase className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
            <p className="text-gray-600 mb-6">
                It looks like there are no leave types configured yet. <br />
                You can add them manually or create some sample data to get started.
            </p>
            <Button type="primary" size="large" onClick={onSetup} loading={loading}>
                Auto-Setup Sample Data
            </Button>
        </div>
    </Card>
);

// --- Main Combined Component ---
const LeaveTypeManagementPage = () => {
    // --- Hooks ---
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [form] = Form.useForm();
    const router = useRouter();

    // State to track if setup is needed
    const [needsSetup, setNeedsSetup] = useState(false);

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
    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await fetchLeaveTypes(page, pageSize);
            const data = res.data || [];
            
            if (page === 1 && data.length === 0) {
                setNeedsSetup(true);
            } else {
                setNeedsSetup(false);
            }

            setLeaveTypes(data);
            setPagination({ current: page, pageSize, total: res.total_items });
        } catch (error) {
            message.error("Failed to fetch leave types.");
        } finally {
            setLoading(false);
        }
    }, []);

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
        setSelectedLeaveType(null);
    };

    //view leave type by id
    const handleViewModalOpen = (record: LeaveType) => {
        setSelectedLeaveType(record);
        setIsViewModalOpen(true);
    };

    //modal view cancel
    const handleViewModalCancel = () => {
        setIsViewModalOpen(false);
        setSelectedLeaveType(null); 
    };

    const handleFormSubmit = async (values: Omit<LeaveType, 'id'>) => {
        setIsSubmitting(true);
        try {
            if (selectedLeaveType) {
                await updateLeaveType( selectedLeaveType.id,values );
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

    const handleSetup = async () => {
        setIsSubmitting(true);
        message.loading({ content: 'Creating sample data...', key: 'setup' });
        try {
            const sampleData = [
                { prefix: 'AL', type_name: 'Annual Leave', max_days: 18 },
                { prefix: 'SL', type_name: 'Sick Leave', max_days: 7 },
                { prefix: 'ML', type_name: 'Maternity Leave', max_days: 90 },
                { prefix: 'PL', type_name: 'Paternity Leave', max_days: 7 },
                { prefix: 'UL', type_name: 'Unpaid Leave', max_days: 30 },
            ];
            
            await Promise.all(sampleData.map(item => createLeaveType(item)));
            
            message.success({ content: 'Sample data created successfully!', key: 'setup', duration: 2 });
            
            // Refresh the data to show the new items and exit setup mode
            await fetchData();
        } catch (error) {
            message.error({ content: 'Failed to create sample data.', key: 'setup', duration: 3 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const commonProps = {
        leaveTypes,
        loading,
        pagination,
        fetchData,
        handleModalOpen,
        handleViewModalOpen,
        handleDelete,
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Leave Types</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Leave Types</span>
                    </div>
                </div>
                {/* Hide 'Add' button in setup mode */}
                {!needsSetup && (
                    <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>
                        Add Type
                    </Button>
                )}
            </div>

             {needsSetup ? (
                <SetupView onSetup={handleSetup} loading={isSubmitting} />
            ) : (
                isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />
            )}

            <Modal title={selectedLeaveType ? "Edit Leave Type" : "Add New Leave Type"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting}>
                <LeaveTypeForm form={form} onFinish={handleFormSubmit} />
            </Modal>
            <Modal title="Leave Type Details" open={isViewModalOpen} onCancel={handleViewModalCancel} footer={[ <Button key="close" onClick={handleViewModalCancel}>Close</Button> ]}>
                <LeaveTypeDetail leaveType={selectedLeaveType} />
            </Modal>
        </div>
    );
};


// --- Desktop View ---
const DesktopView = ({ leaveTypes, loading, pagination, fetchData, handleModalOpen, handleViewModalOpen, handleDelete }: any) => {
    
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
                    <Button icon={<MdRemoveRedEye />} onClick={() => handleViewModalOpen(record)}>View</Button>
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
const MobileView = ({ leaveTypes, loading, pagination, fetchData, handleModalOpen, handleViewModalOpen, handleDelete }: any) => (
    <Spin spinning={loading}>
        <List
            dataSource={leaveTypes}
            renderItem={(item: LeaveType) => (
                <List.Item
                    actions={[
                        <Button key="view" type="text" shape="circle" icon={<MdRemoveRedEye />} onClick={() => handleViewModalOpen(item)} />,
                        <Button key="edit" type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                        <Button key="delete" type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
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