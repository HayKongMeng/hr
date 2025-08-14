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
    fetchNationalities,
    createNationality,
    updateNationality,
    deleteNationality,
} from "@/lib/api/nationality"; 

// --- Type Definition ---
type Nationality = {
    id: number;
    country_name: string;
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
const NationalityForm = ({ form, onFinish }: { form: any, onFinish: (values: any) => void }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="country_name" label="Nationality Name" rules={[{ required: true, message: 'Please enter the nationality country name!' }]}>
            <Input placeholder="e.g., Cambodian, American, Japanese" />
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
                It looks like there are no nationalities set up yet. <br />
                You can add them manually or create some sample data to get started.
            </p>
            <Button type="primary" size="large" onClick={onSetup} loading={loading}>
                Auto-Setup Sample Data
            </Button>
        </div>
    </Card>
);

// --- Main Page Component ---
const NationalitiesPage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    const [nationalities, setNationalities] = useState<Nationality[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<Nationality | null>(null);
    const [needsSetup, setNeedsSetup] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchNationalities();
            const data = res.data || [];
            if (data.length === 0) {
                setNeedsSetup(true);
            } else {
                setNeedsSetup(false);
            }
            setNationalities(data);
        } catch (error) {
            message.error("Failed to fetch nationalities.");
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

    const handleModalOpen = (record: Nationality | null) => {
        setSelected(record);
        form.setFieldsValue(record || { country_name: '' });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelected(null);
    };

    const handleFormSubmit = async (values: { country_name: string }) => {
        setIsSubmitting(true);
        try {
            if (selected) {
                await updateNationality(selected.id, values);
                message.success("Nationality updated successfully!");
            } else {
                await createNationality(values);
                message.success("Nationality created successfully!");
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
            title: 'Delete Nationality?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteNationality(id);
                    message.success("Nationality deleted.");
                    fetchData();
                } catch (error) { message.error("Failed to delete nationality."); }
            },
        });
    };

    const handleSetup = async () => {
        setIsSubmitting(true);
        message.loading({ content: 'Creating sample data...', key: 'setup' });
        try {
            const sampleData = [
                { country_name: 'Cambodian' }, { country_name: 'American' }, { country_name: 'Chinese' },
                { country_name: 'Thai' }, { country_name: 'Japanese' }, { country_name: 'British' }
            ];
            await Promise.all(sampleData.map(item => createNationality(item)));
            message.success({ content: 'Sample data created successfully!', key: 'setup', duration: 2 });
            await fetchData();
        } catch (error) {
            message.error({ content: 'Failed to create sample data.', key: 'setup', duration: 3 });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleTableChange: TableProps<Nationality>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    const commonProps = { nationalities, loading, pagination, handleTableChange, handleModalOpen, handleDelete };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Nationalities</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Nationalities</span>
                    </div>
                </div>
                {!needsSetup && (
                    <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Nationality</Button>
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
                title={selected ? "Edit Nationality" : "Add New Nationality"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
            >
                <NationalityForm form={form} onFinish={handleFormSubmit} />
            </Modal>
        </div>
    );
};

// --- Desktop View Sub-Component ---
const DesktopView = ({ nationalities, loading, pagination, handleTableChange, handleModalOpen, handleDelete }: any) => {
    const columns: TableProps<Nationality>['columns'] = [
        { title: 'Name', dataIndex: 'country_name', key: 'country_name' },
        { title: 'Date Created', dataIndex: 'created_at', key: 'created_at', render: (date) => moment(date).format("DD MMM YYYY") },
        {
            title: 'Actions', key: 'actions', align: 'right', render: (_, record: Nationality) => (
                <Space>
                    <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            )
        }
    ];

    return <Table columns={columns} dataSource={nationalities} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />;
};

// --- Mobile View Sub-Component ---
const MobileView = ({ nationalities, loading, handleModalOpen, handleDelete }: any) => (
    <List
        loading={loading}
        dataSource={nationalities}
        renderItem={(item: Nationality) => (
            <List.Item
                actions={[
                    <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                    <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                ]}
            >
                <List.Item.Meta
                    title={item.country_name}
                    description={`Created on: ${moment(item.created_at).format("DD MMM YYYY")}`}
                />
            </List.Item>
        )}
    />
);

export default NationalitiesPage;