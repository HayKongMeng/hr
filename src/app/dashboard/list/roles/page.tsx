"use client";

import { useEffect, useState } from "react";
import { BsSortDown } from "react-icons/bs";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Loading from "@/components/ui/Loading";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import { fetchAllRoles } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { MdKeyboardArrowRight } from "react-icons/md";

type Role = {
    id: number;
    role_name: string;
    permissions: {
        id: number;
        action: string;
        module: string;
    }[];
};

const columns = [
    { header: "Role", accessor: "role_name" },
    { header: "Permissions", accessor: "permissions" },
    { header: "Actions", accessor: "action" },
];

const RoleListPage = () => {
    const router = useRouter();
    const [RolesByPage, setRolesByPage] = useState<{
        [key: string]: Role[];
    }>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    const getRoles = async (page: number, perPage: number) => {
        const cacheKey = `${page}-${perPage}`;

        if (RolesByPage[cacheKey]) {
            setRoles(RolesByPage[cacheKey]);
            setLoading(false);
            return;
        }
     
        setLoading(true);
        try {
            const res = await fetchAllRoles(currentPage, itemsPerPage);
            const filtered = res.data.filter((p: any) => p && p.role_name);

            // Save to page cache
            setRolesByPage((prev) => ({
                ...prev,
                [cacheKey]: filtered,
            }));;

            setRoles(filtered);
            setTotalPages(res.total_pages);
            setTotalItems(res.total_items);
        } catch (err: any) {
            setError(err.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRoles(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    const handleRolesSuccess = (updatedRole: Role) => {
        setRolesByPage((prev) => {
            const updatedPage = (prev[currentPage] || []).map((role) =>
                role.id === updatedRole.id ? updatedRole : role
            );

            const exists = prev[currentPage]?.some((role) => role.id === updatedRole.id);

            const newPage = exists
                ? updatedPage
                : [updatedRole, ...(prev[currentPage] || [])];

            return {
                ...prev,
                [currentPage]: newPage,
            };
        });

        // Update visible roles
        setRoles((prev) => {
            const index = prev.findIndex((role) => role.id === updatedRole.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = updatedRole;
                return updated;
            } else {
                return [updatedRole, ...prev];
            }
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        setItemsPerPage(newSize);
        setCurrentPage(1);
        setRoles([]); // Reset current visible data
        setRolesByPage({}); // Clear cached data
    };

    const goBack = () => {
        router.push("/dashboard/list/dashboard/admin");
    };

    const renderRow = (item: Role) => {
        if (!item || !item.role_name) return null;
        return (
            <tr
                key={item.id}
                className="border-b border-gray-200 text-sm"
            >
                <td className="py-4 px-4">
                    <div className="flex items-center uppercase">
                        {item.role_name}
                    </div>
                </td>
                <td className="hidden md:table-cell py-4 px-4">
                    {item.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {item.permissions.map((perm) => (
                                <span
                                    key={perm.id}
                                    className="gradient-green text-white px-3 py-0.5 rounded text-xs font-light"
                                >
                                    {perm.action} {perm.module}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-400 italic">No permissions</span>
                    )}
                </td>
                <td className="w-32 py-4 px-4">
                    <div className="flex items-center gap-2">
                        {role === "admin" && (
                            <>
                                <FormModal
                                    table="Role"
                                    type="update"
                                    data={item}
                                    onSuccess={handleRolesSuccess}
                                />
                                <FormModal
                                    table="Role"
                                    type="delete"
                                    id={item.id}
                                    onSuccess={() => {
                                        const updated = roles.filter((role) => role.id !== item.id);
                                        setRoles(updated);
                                        setRolesByPage((prev) => ({
                                            ...prev,
                                            [currentPage]: updated,
                                        }));
                                    }}
                                />
                            </>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between m-4">
                <div>
                    <h1 className="hidden md:block text-lg font-semibold mb-0">Manage Roles</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                            onClick={goBack}
                            className="hover:underline cursor-pointer text-blue-600 font-light"
                        >
                            Home
                        </span>
                        <MdKeyboardArrowRight />
                        <span className="text-gray-700 font-light">Role</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end m-4 mb-0">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                        <BsSortDown className="text-white font-semibold" />
                    </button>
                    <FormModal
                        table="Role"
                        type="create"
                        onSuccess={handleRolesSuccess}
                    />
                </div>
            </div>


            {loading ? (
                <Loading />
            ) : (
                <div className="bg-white rounded-2xl m-4 mt-0 card-table">
                    <>
                        {/* TOP */}
                        <div className="flex items-center justify-between pr-6 pl-6 pt-10 pb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <select
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                    className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {[10, 20, 30, 50].map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <span>entries per page</span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                <TableSearch />
                            </div>
                        </div>

                        {/* LIST */}
                        <Table columns={columns} renderRow={renderRow} data={roles} />

                        {/* PAGINATION */}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                </div>
            )}
        </div>
    );
};

export default RoleListPage;
