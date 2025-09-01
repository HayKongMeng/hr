"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Spin, Button, Space, Tag, Input, message } from "antd";
import type { TableProps } from 'antd';
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { fetchAllRoles } from "@/lib/api/users";
import FormModal from "@/components/FormModal"; // Assuming this is your Ant Design modal wrapper
import { useAuth } from "@/lib/AuthContext"; // Import useAuth to get the role

type Role = {
    id: number;
    role_name: string;
    permissions: {
        id: number;
        action: string;
        module: string;
    }[];
};

const RoleListPage = () => {
    const router = useRouter();
    const { user } = useAuth(); // Get the current user's role
    const userRole = user?.roles?.[0];

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async (page: number, pageSize: number, search: string) => {
        setLoading(true);
        try {
            // Your API function might need to be updated to accept a search query
            const res = await fetchAllRoles(page, pageSize);
            setRoles(res.data || []);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: res.total_items,
            }));
        } catch (err: any) {
            message.error("Failed to fetch roles.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchData(pagination.current, pagination.pageSize, searchQuery);
        }, 300); // Debounce search to avoid excessive API calls

        return () => clearTimeout(debounce);
    }, [pagination.current, pagination.pageSize, searchQuery, fetchData]);

    const handleSuccess = () => {
        // Refetch data on the current page after a create/update/delete action
        fetchData(pagination.current, pagination.pageSize, searchQuery);
    };

    const handleTableChange: TableProps<Role>['onChange'] = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
        }));
    };

    const columns: TableProps<Role>['columns'] = [
        {
            title: "Role Name",
            dataIndex: "role_name",
            key: "role_name",
            sorter: (a, b) => a.role_name.localeCompare(b.role_name),
        },
        {
            title: "Permissions",
            dataIndex: "permissions",
            key: "permissions",
            render: (permissions: Role['permissions']) => (
                <div className="flex flex-wrap gap-1">
                    {permissions.length > 0 ? permissions.slice(0, 5).map((perm) => (
                        <Tag key={perm.id} color="blue">
                            {`${perm.action} ${perm.module}`}
                        </Tag>
                    )) : <Tag>No Permissions</Tag>}
                    {permissions.length > 5 && <Tag>...</Tag>}
                </div>
            ),
        },
        {
            title: "Actions",
            key: "action",
            align: 'right',
            render: (_, record: Role) => (
                <Space size="middle">
                    {/* Conditionally render buttons based on user role */}
                    {(userRole === 'Admin' || userRole === 'Super Admin') && (
                        <>
                            <FormModal
                                table="Role"
                                type="update"
                                data={record}
                                onSuccess={handleSuccess}
                            />
                            <FormModal
                                table="Role"
                                type="delete"
                                id={record.id}
                                onSuccess={handleSuccess}
                            />
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Roles</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                            onClick={() => router.push("/dashboard/list/dashboard/admin")}
                            className="hover:underline cursor-pointer text-blue-600"
                        >
                            Home
                        </span>
                        <MdKeyboardArrowRight />
                        <span>Roles</span>
                    </div>
                </div>
                {/* Only Admins/Super Admins can create new roles */}
                {(userRole === 'Admin' || userRole === 'Super Admin') && (
                    <FormModal
                        table="Role"
                        type="create"
                        onSuccess={handleSuccess}
                    />
                )}
            </div>

            <Card>
                <div className="flex justify-end mb-4">
                    <Input.Search
                        placeholder="Search by role name..."
                        onSearch={(value) => {
                            setSearchQuery(value);
                            setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
                        }}
                        style={{ width: 250 }}
                        allowClear
                    />
                </div>
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};

export default RoleListPage;