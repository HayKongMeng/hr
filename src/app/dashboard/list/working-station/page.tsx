"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import { Button, Card, Form, Input, List, message, Modal, Space, Spin, Table } from "antd";
import type { TableProps } from 'antd';

// --- Icons ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete } from "react-icons/md";

// --- API & Data ---
import {
    fetchWorkStation,
    createWorkStation,
    updateWorkStation,
    deleteWorkStation,
} from "@/lib/api/workingstation"; 
import { FiDatabase } from "react-icons/fi";

// --- Type Definition ---
type WorkStation = {
    id: number;
    name: string;
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
const WorkStationForm = ({ form, onFinish }: { form: any, onFinish: (values: any) => void }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Work Station Name" rules={[{ required: true, message: 'Please enter the name!' }]}>
            <Input placeholder="e.g., Head Office, Branch A" />
        </Form.Item>
    </Form>
);

const SetupView = ({ onSetup, loading }: { onSetup: () => void; loading: boolean }) => (
    <Card>
        <div className="text-center p-8">
            <FiDatabase className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
            <p className="text-gray-600 mb-6">
                It looks like there are no work stations set up yet. <br />
                You can add them manually or create some sample data to get started.
            </p>
            <Button type="primary" size="large" onClick={onSetup} loading={loading}>
                Auto-Setup Sample Data
            </Button>
        </div>
    </Card>
);

// --- Main Page Component ---
const WorkStationPage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    const [workStations, setWorkStations] = useState<WorkStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<WorkStation | null>(null);

    // State to track if setup is needed
    const [needsSetup, setNeedsSetup] = useState(false);

    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await fetchWorkStation();
            const data = res.data || [];

            if (page === 1 && data.length === 0) {
                setNeedsSetup(true);
            } else {
                setNeedsSetup(false);
            }

            setWorkStations(data);
            // setPagination({ current: page, pageSize, total: res.total_items || 0 });
        } catch (error) {
            message.error("Failed to fetch work stations.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { setIsClient(true); }, []);
    useEffect(() => {
        if (isClient) {
            fetchData(pagination.current, pagination.pageSize);
        }
    }, [isClient, fetchData]);

    const handleSetup = async () => {
        setIsSubmitting(true);
        message.loading({ content: 'Creating sample data...', key: 'setup' });
        try {
            const sampleData = [
                { name: 'Head Office' },
                { name: 'Warehouse' },
                { name: 'Branch - North' },
                { name: 'Branch - South' },
            ];
            
            // Create all sample items in parallel
            await Promise.all(sampleData.map(item => createWorkStation(item)));
            
            message.success({ content: 'Sample data created successfully!', key: 'setup', duration: 2 });
            
            // Refresh the data to show the new items and exit setup mode
            await fetchData();
        } catch (error) {
            message.error({ content: 'Failed to create sample data.', key: 'setup', duration: 3 });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    const handleModalOpen = (record: WorkStation | null) => {
        setSelected(record);
        form.setFieldsValue(record || { name: '' });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelected(null);
    };

    const handleFormSubmit = async (values: { name: string }) => {
        setIsSubmitting(true);
        try {
            if (selected) {
                await updateWorkStation(selected.id, values);
                message.success("Work station updated successfully!");
            } else {
                await createWorkStation(values);
                message.success("Work station created successfully!");
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
            title: 'Delete Work Station?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteWorkStation(id);
                    message.success("Work station deleted.");
                    fetchData();
                } catch (error) { message.error("Failed to delete work station."); }
            },
        });
    };
    
    const handleTableChange: TableProps<WorkStation>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    const commonProps = { workStations, loading, pagination, handleTableChange, handleModalOpen, handleDelete };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Work Stations</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Work Stations</span>
                    </div>
                </div>
                {/* Hide 'Add' button in setup mode */}
                {!needsSetup && (
                    <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Work Station</Button>
                )}
            </div>

            {needsSetup ? (
                <SetupView onSetup={handleSetup} loading={isSubmitting} />
            ) : (
                <Card>
                    {isMobile ? 
                        <MobileView workStations={workStations} loading={loading} handleModalOpen={handleModalOpen} handleDelete={handleDelete} /> : 
                        <DesktopView workStations={workStations} loading={loading} pagination={pagination} handleTableChange={handleTableChange} handleModalOpen={handleModalOpen} handleDelete={handleDelete} />
                    }
                </Card>
            )}

            <Modal
                title={selected ? "Edit Work Station" : "Add New Work Station"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
            >
                <WorkStationForm form={form} onFinish={handleFormSubmit} />
            </Modal>
        </div>
    );
};

// --- Desktop View Sub-Component ---
const DesktopView = ({ workStations, loading, pagination, handleTableChange, handleModalOpen, handleDelete }: any) => {
    const columns: TableProps<WorkStation>['columns'] = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Date Created', dataIndex: 'created_at', key: 'created_at', render: (date) => moment(date).format("DD MMM YYYY") },
        {
            title: 'Actions', key: 'actions', align: 'right', render: (_, record: WorkStation) => (
                <Space>
                    <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            )
        }
    ];

    return <Table columns={columns} dataSource={workStations} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />;
};

// --- Mobile View Sub-Component ---
const MobileView = ({ workStations, loading, handleModalOpen, handleDelete }: any) => (
    <List
        loading={loading}
        dataSource={workStations}
        renderItem={(item: WorkStation) => (
            <List.Item
                actions={[
                    <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                    <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                ]}
            >
                <List.Item.Meta
                    title={item.name}
                    description={`Created on: ${moment(item.created_at).format("DD MMM YYYY")}`}
                />
            </List.Item>
        )}
    />
);

export default WorkStationPage;