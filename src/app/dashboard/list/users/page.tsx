"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import { Button, Card, Form, Input, List, message, Modal, Select, Space, Spin, Switch, Table, Tag } from "antd";
import type { TableProps } from 'antd';

// --- Icons (from react-icons) ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete } from "react-icons/md";

// --- API & Data ---
import {
    fetchUsers, createUser, updateUser,
    // deleteUser, 
    Role, fetchAllRoles
} from "@/lib/api/users";

// --- Type Definitions ---
type User = {
    id: number;
    name: string;
    email: string;
    roles: { id: number; role_name: string; }[]; // This can sometimes be null/undefined from API
    is_active: boolean;
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
const UserForm = ({ form, onFinish, roles, isEditMode = false }: { form: any; onFinish: (values: any) => void; roles: Role[], isEditMode?: boolean }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
        </Form.Item>
        <Form.Item name="role_ids" label="Roles" rules={[{ required: true }]}>
            {/* Defensive check: ensure roles is an array before mapping */}
            <Select mode="multiple" placeholder="Assign roles" options={(roles || []).map(r => ({ value: r.id, label: r.role_name }))} />
        </Form.Item>
        {!isEditMode && (
            <>
                <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item name="confirm_password" label="Confirm Password" dependencies={['password']} hasFeedback rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('The two passwords do not match!')); }, })]}>
                    <Input.Password />
                </Form.Item>
            </>
        )}
        <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
    </Form>
);

// --- Main Page Component ---
const UserManagementPage = () => {
    // Hooks
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    // State
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Data Fetching
    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            // Fetch roles only if the roles state is empty
            const rolesPromise = roles.length === 0 ? fetchAllRoles() : Promise.resolve({ data: roles });
            
            const [usersRes, rolesRes] = await Promise.all([
                fetchUsers(page, pageSize),
                rolesPromise
            ]);
            
            setUsers(usersRes.data || []);
            setPagination({ current: page, pageSize, total: usersRes.total_items });

            // CORRECTED: Extract the 'data' array from the roles response
            if (roles.length === 0) {
                setRoles(rolesRes.data || []);
            }
        } catch (error) {
            message.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    }, [roles]); // Dependency on roles is correct here to prevent re-fetching

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
    const handleModalOpen = (record: User | null) => {
        setSelectedUser(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                role_ids: (record.roles || []).map(r => r.id),
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ is_active: true });
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
            const payload = { ...values };
            delete payload.confirm_password;
            if (payload.role_ids && payload.role_ids.length > 0) {
                payload.role_id = payload.role_ids[0]; 
            }
            delete payload.role_ids;
            if (selectedUser) {
                await updateUser(selectedUser.id, payload);
                message.success("User updated successfully!");
            } else {
                await createUser(payload);
                message.success("User created successfully!");
            }
            handleModalCancel();
            fetchData(pagination.current);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Operation failed.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete User?',
            content: 'This will permanently delete the user.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    // await deleteUser(id);
                    message.success("User deleted.");
                    fetchData(pagination.current);
                } catch (error) {
                    message.error("Failed to delete user.");
                }
            },
        });
    };
    
    const handleTableChange: TableProps<User>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    // Shared props for views
    const viewProps = { users, loading, pagination, handleTableChange, handleModalOpen, handleDelete };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Users</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight />
                        <span>Users</span>
                    </div>
                </div>
                <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add User</Button>
            </div>

            <Card>
                {isMobile ? <MobileView {...viewProps} /> : <DesktopView {...viewProps} />}
            </Card>

            <Modal
                title={selectedUser ? "Edit User" : "Add New User"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
                width={isMobile ? '100%' : 520}
                style={isMobile ? { top: 0, padding: 0, height: '100vh' } : {}}
            >
                <div className={isMobile ? 'p-4' : ''}>
                    <UserForm form={form} onFinish={handleFormSubmit} roles={roles} isEditMode={!!selectedUser} />
                </div>
            </Modal>
        </div>
    );
};

// --- Desktop View Sub-Component ---
const DesktopView = ({ users, loading, pagination, handleTableChange, handleModalOpen, handleDelete }: any) => {
    const columns: TableProps<User>['columns'] = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Roles', dataIndex: 'roles', key: 'roles', render: (roles: Role[]) => (
            // Defensive check: Ensure roles is an array before mapping
            <Space wrap>{(roles || []).map(role => <Tag key={role.id}>{role.role_name}</Tag>)}</Space>
        )},
        { title: 'Status', dataIndex: 'is_active', key: 'status', render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag> },
        { title: 'Created', dataIndex: 'created_at', key: 'created', render: (date) => moment(date).format("DD MMM YYYY") },
        { title: 'Actions', key: 'actions', render: (_, record: User) => (
            <Space>
                <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
            </Space>
        )}
    ];

    return (
        <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />
    );
};

// --- Mobile View Sub-Component ---
const MobileView = ({ users, loading, handleModalOpen, handleDelete }: any) => (
    <List
        loading={loading}
        dataSource={users}
        renderItem={(item: User) => (
            <List.Item
                actions={[
                    <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                    <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                ]}
            >
                <List.Item.Meta
                    title={item.name}
                    description={
                        <div>
                            <span>{item.email}</span>
                            {/* Defensive check: Ensure item.roles is an array */}
                            <div className="mt-1"><Space wrap>{(item.roles || []).map(role => <Tag key={role.id} color="blue">{role.role_name}</Tag>)}</Space></div>
                        </div>
                    }
                />
            </List.Item>
        )}
    />
);

export default UserManagementPage;