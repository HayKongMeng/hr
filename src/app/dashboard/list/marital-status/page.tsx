"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import { Button, Card, Form, Input, List, message, Modal, Space, Spin, Table } from "antd";
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { FiDatabase } from "react-icons/fi"; 

// --- API & Data ---
import {
    fetchMaritalStatuses,
    createMaritalStatus,
    updateMaritalStatus,
    deleteMaritalStatus,
} from "@/lib/api/maritalstatuses"; 

// --- Type Definition ---
type MaritalStatus = {
    id: number;
    status_name: string;
    created_at: string;
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

// --- Reusable Form Component ---
const MaritalStatusForm = ({ form, onFinish }: { form: any, onFinish: (values: any) => void }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="status_name" label="Marital Status Name" rules={[{ required: true, message: 'Please enter the status name!' }]}>
            <Input placeholder="e.g., Single, Married, Divorced" />
        </Form.Item>
    </Form>
);

// --- Setup View Component ---
const SetupView = ({ onSetup, loading }: { onSetup: () => void; loading: boolean }) => (
    <Card>
        <div className="text-center p-8">
            <FiDatabase className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
            <p className="text-gray-600 mb-6">
                It looks like there are no marital statuses set up yet. <br />
                You can add them manually or create some sample data to get started.
            </p>
            <Button type="primary" size="large" onClick={onSetup} loading={loading}>
                Auto-Setup Sample Data
            </Button>
        </div>
    </Card>
);

// --- Main Page Component ---
const MaritalStatusPage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<MaritalStatus | null>(null);
    const [needsSetup, setNeedsSetup] = useState(false);

    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await fetchMaritalStatuses();
            const data = res.data || [];
            if (page === 1 && data.length === 0) {
                setNeedsSetup(true);
            } else {
                setNeedsSetup(false);
            }
            setMaritalStatuses(data);
            setPagination({ current: page, pageSize, total: res.total_items || 0 });
        } catch (error) {
            message.error("Failed to fetch marital statuses.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { setIsClient(true); }, []);
    useEffect(() => {
        if (isClient) {
            fetchData(pagination.current, pagination.pageSize);
        }
    }, [isClient, pagination.current, pagination.pageSize, fetchData]);

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    const handleModalOpen = (record: MaritalStatus | null) => {
        setSelected(record);
        form.setFieldsValue(record || { status_name: '' });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelected(null);
    };

    const handleFormSubmit = async (values: { status_name: string }) => {
        setIsSubmitting(true);
        try {
            if (selected) {
                await updateMaritalStatus(selected.id, values);
                message.success("Marital status updated successfully!");
            } else {
                await createMaritalStatus(values);
                message.success("Marital status created successfully!");
            }
            handleModalCancel();
            fetchData();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Operation failed.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Marital Status?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteMaritalStatus(id);
                    message.success("Marital status deleted.");
                    fetchData();
                } catch (error) { message.error("Failed to delete marital status."); }
            },
        });
    };

    const handleSetup = async () => {
        setIsSubmitting(true);
        message.loading({ content: 'Creating sample data...', key: 'setup' });
        try {
            const sampleData = [
                { status_name: 'Single' },
                { status_name: 'Married' },
                { status_name: 'Divorced' },
                { status_name: 'Widowed' },
                { status_name: 'Other' },
            ];
            await Promise.all(sampleData.map(item => createMaritalStatus(item)));
            message.success({ content: 'Sample data created successfully!', key: 'setup', duration: 2 });
            await fetchData();
        } catch (error) {
            message.error({ content: 'Failed to create sample data.', key: 'setup', duration: 3 });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleTableChange: TableProps<MaritalStatus>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    const commonProps = { maritalStatuses, loading, pagination, handleTableChange, handleModalOpen, handleDelete };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Marital Statuses</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Marital Statuses</span>
                    </div>
                </div>
                {!needsSetup && (
                    <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Status</Button>
                )}
            </div>

            {needsSetup ? (
                <SetupView onSetup={handleSetup} loading={isSubmitting} />
            ) : (
                <Card>
                    {isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />}
                </Card>
            )}

            <Modal
                title={selected ? "Edit Marital Status" : "Add New Marital Status"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
            >
                <MaritalStatusForm form={form} onFinish={handleFormSubmit} />
            </Modal>
        </div>
    );
};

// --- Desktop View Sub-Component ---
const DesktopView = ({ maritalStatuses, loading, pagination, handleTableChange, handleModalOpen, handleDelete }: any) => {
    const columns: TableProps<MaritalStatus>['columns'] = [
        { title: 'Name', dataIndex: 'status_name', key: 'status_name' },
        { title: 'Date Created', dataIndex: 'created_at', key: 'created_at', render: (date) => moment(date).format("DD MMM YYYY") },
        {
            title: 'Actions', key: 'actions', align: 'right', render: (_, record: MaritalStatus) => (
                <Space>
                    <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            )
        }
    ];

    return <Table columns={columns} dataSource={maritalStatuses} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />;
};

// --- Mobile View Sub-Component ---
const MobileView = ({ maritalStatuses, loading, handleModalOpen, handleDelete }: any) => (
    <List
        loading={loading}
        dataSource={maritalStatuses}
        renderItem={(item: MaritalStatus) => (
            <List.Item
                actions={[
                    <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                    <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                ]}
            >
                <List.Item.Meta
                    title={item.status_name}
                    description={`Created on: ${moment(item.created_at).format("DD MMM YYYY")}`}
                />
            </List.Item>
        )}
    />
);

export default MaritalStatusPage;