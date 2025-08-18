"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import { Button, Card, Form, Input, List, message, Modal, Space, Spin, Switch, Table, Tag } from "antd";
import type { TableProps } from 'antd';

// --- Icons (from react-icons) ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete } from "react-icons/md";

// --- API & Data ---
import {
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition
} from "@/lib/api/position";
import { FiDatabase } from "react-icons/fi";

// --- Type Definitions ---
type Position = {
    id: number;
    code: string;
    title: string;
    status: boolean;
    description: string;
    created_at: string;
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
const DesignationForm = ({ form, onFinish }: { form: any; onFinish: (values: any) => void; }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="title" label="Designation Title" rules={[{ required: true }]}>
            <Input placeholder="e.g., Senior Software Engineer" />
        </Form.Item>
        <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="e.g., SSE-01" />
        </Form.Item>
        <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Briefly describe this role" />
        </Form.Item>
        <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
    </Form>
);

const SetupView = ({ onSetup, loading }: { onSetup: () => void; loading: boolean }) => (
    <Card>
        <div className="text-center p-8">
            <FiDatabase className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
            <p className="text-gray-600 mb-6">
                It looks like there are no designations set up yet. <br />
                You can add them manually or create some sample data to get started.
            </p>
            <Button type="primary" size="large" onClick={onSetup} loading={loading}>
                Auto-Setup Sample Data
            </Button>
        </div>
    </Card>
);

// --- Main Page Component ---
const DesignationManagementPage = () => {
    // Hooks
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    // State
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [needsSetup, setNeedsSetup] = useState(false);

    // Data Fetching
     const fetchData = useCallback(async (page: number = 1, pageSize: number = 10) => {
        setLoading(true);
        try {
            const res = await fetchPositions(page, pageSize);
            const data = res.data || []; 

            if (page === 1 && data.length === 0) {
                setNeedsSetup(true);
            } else {
                setNeedsSetup(false);
            }

            setPositions(data);
            setPagination(prev => ({ ...prev, total: res.total_items || 0, current: page, pageSize }));
        } catch (error) {
            message.error("Failed to fetch designations.");
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            fetchData(pagination.current, pagination.pageSize);
        }
    }, [isClient, pagination.current, pagination.pageSize]); 

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    // Event Handlers
    const handleModalOpen = (record: Position | null) => {
        setSelectedPosition(record);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
            form.setFieldsValue({ status: true });
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            if (selectedPosition) {
                await updatePosition(selectedPosition.id, values);
                message.success("Designation updated successfully!");
            } else {
                await createPosition(values);
                message.success("Designation created successfully!");
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
            title: 'Delete Designation?',
            content: 'This action is irreversible and may affect assigned employees.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deletePosition(id);
                    message.success("Designation deleted.");
                    // Refetch the data for the current page
                    fetchData(pagination.current, pagination.pageSize);
                } catch (error) {
                    message.error("Failed to delete designation.");
                }
            },
        });
    };
    
    const handleTableChange: TableProps<Position>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    const handleSetup = async () => {
        setIsSubmitting(true);
        message.loading({ content: 'Creating sample data...', key: 'setup' });
        try {
            const sampleData = [
                { title: 'Software Engineer', code: 'SE', status: true },
                { title: 'Senior Software Engineer', code: 'SSE', status: true },
                { title: 'Project Manager', code: 'PM', status: true },
                { title: 'HR Manager', code: 'HRM', status: true },
                { title: 'Accountant', code: 'ACC', status: true },
            ];
            
            await Promise.all(sampleData.map(item => createPosition(item)));
            
            message.success({ content: 'Sample data created successfully!', key: 'setup', duration: 2 });
            
            // Refresh the data to show the new items and exit setup mode
            await fetchData();
        } catch (error) {
            message.error({ content: 'Failed to create sample data.', key: 'setup', duration: 3 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const viewProps = { positions, loading, pagination, handleTableChange, handleModalOpen, handleDelete };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Designations</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Designations</span>
                    </div>
                </div>
                {/* Hide 'Add' button in setup mode */}
                {!needsSetup && (
                    <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Designation</Button>
                )}
            </div>

            {needsSetup ? (
                <SetupView onSetup={handleSetup} loading={isSubmitting} />
            ) : (
                 <Card>
                    {isMobile ? <MobileView {...viewProps} /> : <DesktopView {...viewProps} />}
                </Card>
            )}

            <Modal title={selectedPosition ? "Edit Designation" : "Add New Designation"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting} width={isMobile ? '100%' : 520} style={isMobile ? { top: 0, padding: 0, height: '100vh' } : {}}>
                <div className={isMobile ? 'p-4' : ''}>
                    <DesignationForm form={form} onFinish={handleFormSubmit} />
                </div>
            </Modal>
        </div>
    );
};

// --- Desktop View Sub-Component ---
const DesktopView = ({ positions, loading, pagination, handleTableChange, handleModalOpen, handleDelete }: any) => {
    const columns: TableProps<Position>['columns'] = [
        { title: 'Designation', dataIndex: 'title', key: 'title' },
        { title: 'Code', dataIndex: 'code', key: 'code' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status ? 'green' : 'red'}>{status ? 'Active' : 'Inactive'}</Tag> },
        { title: 'Created', dataIndex: 'created_at', key: 'created', render: (date) => moment(date).format("DD MMM YYYY") },
        { title: 'Actions', key: 'actions', align: 'right', render: (_, record: Position) => (
            <Space>
                <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
            </Space>
        )}
    ];

    return (
        <Table columns={columns} dataSource={positions} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />
    );
};

// --- Mobile View Sub-Component ---
const MobileView = ({ positions, loading, handleModalOpen, handleDelete }: any) => (
    <List
        loading={loading}
        dataSource={positions}
        renderItem={(item: Position) => (
            <List.Item
                actions={[
                    <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                    <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                ]}
            >
                <List.Item.Meta
                    title={item.title}
                    description={`Code: ${item.code}`}
                />
                <Tag color={item.status ? 'green' : 'red'}>{item.status ? 'Active' : 'Inactive'}</Tag>
            </List.Item>
        )}
    />
);

export default DesignationManagementPage;