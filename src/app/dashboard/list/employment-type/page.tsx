"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import { Button, Card, Form, Input, InputNumber, List, message, Modal, Space, Spin, Table } from "antd";
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete } from "react-icons/md";

// --- API & Data ---
import {
    fetchEmploymentTypes,
    createEmploymentType,
    updateEmploymentType,
    deleteEmploymentType,
} from "@/lib/api/employmenttype"; 
import { FiDatabase } from "react-icons/fi";

// --- Type Definition ---
type EmploymentType = {
    id: number;
    type_code: number;
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
const EmploymentTypeForm = ({ form, onFinish }: { form: any, onFinish: (values: any) => void }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="status_name" label="Status Name" rules={[{ required: true, message: 'Please enter the status name!' }]}>
            <Input placeholder="e.g., Full-time, Part-time, Contract" />
        </Form.Item>
        <Form.Item name="type_code" label="Type Code" rules={[{ required: true, message: 'Please enter the type code!' }]}>
            <InputNumber className="w-full" placeholder="e.g., 101, 102" />
        </Form.Item>
    </Form>
);

const SetupView = ({ onSetup, loading }: { onSetup: () => void; loading: boolean }) => (
    <Card>
        <div className="text-center p-8">
            <FiDatabase className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
            <p className="text-gray-600 mb-6">
                It looks like there are no employment types set up yet. <br />
                You can add them manually or create some sample data to get started.
            </p>
            <Button type="primary" size="large" onClick={onSetup} loading={loading}>
                Auto-Setup Sample Data
            </Button>
        </div>
    </Card>
);

// --- Main Page Component ---
const EmploymentTypePage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<EmploymentType | null>(null);

    // State to track if setup is needed
    const [needsSetup, setNeedsSetup] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchEmploymentTypes();
            const data = res.data || [];

            // If it's the first page and data is empty, trigger setup mode
            if (data.length === 0) {
                setNeedsSetup(true);
            } else {
                setNeedsSetup(false);
            }

            setEmploymentTypes(data);
        } catch (error) {
            message.error("Failed to fetch employment types.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { setIsClient(true); }, []);
    useEffect(() => {
        if (isClient) {
            fetchData();
        }
    }, [isClient,  fetchData]);

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    const handleModalOpen = (record: EmploymentType | null) => {
        setSelected(record);
        form.setFieldsValue(record || { name: '', type_code: null });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelected(null);
    };

    const handleFormSubmit = async (values: { type_code: number; status_name: string }) => {
        setIsSubmitting(true);
        try {
            if (selected) {
                await updateEmploymentType(selected.id, values);
                message.success("Employment type updated successfully!");
            } else {
                await createEmploymentType(values);
                message.success("Employment type created successfully!");
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
            title: 'Delete Employment Type?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteEmploymentType(id);
                    message.success("Employment type deleted.");
                    fetchData();
                } catch (error) { message.error("Failed to delete employment type."); }
            },
        });
    };
    
    const handleTableChange: TableProps<EmploymentType>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    const handleSetup = async () => {
        setIsSubmitting(true);
        message.loading({ content: 'Creating sample data...', key: 'setup' });
        try {
            const sampleData = [
                { status_name: 'Full-time', type_code: 101 },
                { status_name: 'Part-time', type_code: 102 },
                { status_name: 'Contractor', type_code: 201 },
                { status_name: 'Intern', type_code: 301 },
                { status_name: 'Probation', type_code: 401 },
            ];
            
            // Create all sample items concurrently
            await Promise.all(sampleData.map(item => createEmploymentType(item)));
            
            message.success({ content: 'Sample data created successfully!', key: 'setup', duration: 2 });
            
            // Refresh the data to show the new items and exit setup mode
            await fetchData();
        } catch (error) {
            message.error({ content: 'Failed to create sample data.', key: 'setup', duration: 3 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const commonProps = { employmentTypes, loading, pagination, handleTableChange, handleModalOpen, handleDelete };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Employment Types</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Employment Types</span>
                    </div>
                </div>
                {/* Hide 'Add' button in setup mode */}
                {!needsSetup && (
                    <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Type</Button>
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
                title={selected ? "Edit Employment Type" : "Add New Employment Type"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
            >
                <EmploymentTypeForm form={form} onFinish={handleFormSubmit} />
            </Modal>
        </div>
    );
};

// --- Desktop View Sub-Component ---
const DesktopView = ({ employmentTypes, loading, pagination, handleTableChange, handleModalOpen, handleDelete }: any) => {
    const columns: TableProps<EmploymentType>['columns'] = [
        { title: 'Status Name', dataIndex: 'status_name', key: 'status_name' },
        { title: 'Type Code', dataIndex: 'type_code', key: 'type_code' },
        { title: 'Date Created', dataIndex: 'created_at', key: 'created_at', render: (date) => moment(date).format("DD MMM YYYY") },
        {
            title: 'Actions', key: 'actions', align: 'right', render: (_, record: EmploymentType) => (
                <Space>
                    <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            )
        }
    ];

    return <Table columns={columns} dataSource={employmentTypes} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />;
};

// --- Mobile View Sub-Component ---
const MobileView = ({ employmentTypes, loading, handleModalOpen, handleDelete }: any) => (
    <List
        loading={loading}
        dataSource={employmentTypes}
        renderItem={(item: EmploymentType) => (
            <List.Item
                actions={[
                    <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                    <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                ]}
            >
                <List.Item.Meta
                    title={item.status_name}
                    description={`Code: ${item.type_code}`}
                />
            </List.Item>
        )}
    />
);

export default EmploymentTypePage;