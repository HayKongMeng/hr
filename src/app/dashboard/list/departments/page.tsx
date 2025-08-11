"use client";

import { useEffect, useState } from "react";
import { BsSortDown } from "react-icons/bs";
import moment from "moment";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Loading from "@/components/ui/Loading";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useRouter } from "next/navigation";
import { fetchDepartments } from "@/lib/api/department";

type Department = {
    id: number;
    name: string;
    code: string,
    description: string;
    company: {
        id: number;
        name: string;
    };
    created_at: string;
};

const columns = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code", className: "hidden md:table-cell" },
    { header: "Description", accessor: "description", className: "hidden lg:table-cell" },
    { header: "Company", accessor: "company_name", className: "hidden lg:table-cell" },
    { header: "Created Date", accessor: "created_at", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action" },
];

const DepartmentListPage = () => {
    const router = useRouter();
    const [DepartmentsByPage, setDepartmentsByPage] = useState<{
        [key: string]: Department[];
    }>({});
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    const getDepartments = async (page: number, perPage: number) => {
        const cacheKey = `${page}-${perPage}`;

        // Use cached data if available
        if (DepartmentsByPage[cacheKey]) {
            setDepartments(DepartmentsByPage[cacheKey]);
            setLoading(false);
            return;
        }
       
        setLoading(true);
        try {
            const res = await fetchDepartments(currentPage, itemsPerPage);
            const filtered = res.data.filter((p: any) => p && p.name);

            // Save to page cache
            setDepartmentsByPage((prev) => ({
                ...prev,
                [cacheKey]: filtered,
            }));

            setDepartments(filtered);
            setTotalPages(res.total_pages);
            setTotalItems(res.total_items);
        } catch (err: any) {
            setError(err.message || "Failed to fetch positions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDepartments(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    const handleDepartmentSuccess = (updatedDepartment: Department) => {
        setDepartmentsByPage((prev) => {
            const updatedPage = (prev[currentPage] || []).map((dep) =>
                dep.id === updatedDepartment.id ? updatedDepartment : dep
            );

            const exists = prev[currentPage]?.some((dep) => dep.id === updatedDepartment.id);

            const newPage = exists
                ? updatedPage
                : [updatedDepartment, ...(prev[currentPage] || [])];

            return {
                ...prev,
                [currentPage]: newPage,
            };
        });

        // Update visible departments
        setDepartments((prev) => {
            const index = prev.findIndex((dep) => dep.id === updatedDepartment.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = updatedDepartment;
                return updated;
            } else {
                return [updatedDepartment, ...prev];
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
        setDepartments([]); // Reset current visible data
        setDepartmentsByPage({}); // Clear cached data
    };

    const goBack = () => {
        router.push("/dashboard/list/dashboard/admin");
    };

    const renderRow = (item: Department) => {
        if (!item || !item.name) return null;

        return (
            <tr
                key={item.id}
                className="border-b border-gray-200 text-sm"
            >
                <td className="py-4 px-4">{item.name}</td>
                <td className="hidden md:table-cell py-4 px-4">{item.code}</td>
                <td className="hidden md:table-cell py-4 px-4">{item.description}</td>
                <td className="hidden md:table-cell py-4 px-4">{item.company.name}</td>
                <td className="hidden md:table-cell py-4 px-4">
                   {moment(item.created_at).format("DD MMM YYYY")}
                </td>
                <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                        {role === "admin" && (
                            <>
                                <FormModal
                                    table="Department"
                                    type="update"
                                    data={item}
                                    onSuccess={handleDepartmentSuccess}
                                />
                                <FormModal
                                    table="Department"
                                    type="delete"
                                    id={item.id}
                                    onSuccess={() => {
                                        const updated = departments.filter((dep) => dep.id !== item.id);
                                        setDepartments(updated);
                                        setDepartmentsByPage((prev) => ({
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
                    <h1 className="hidden md:block text-lg font-semibold mb-0">Manage Department</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                            onClick={goBack}
                            className="hover:underline cursor-pointer text-blue-600 font-light"
                        >
                            Home
                        </span>
                        <MdKeyboardArrowRight />
                        <span className="text-gray-700 font-light">Department</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end m-4 mb-0">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                        <BsSortDown className="text-white font-semibold" />
                    </button>
                    <FormModal
                        table="Department"
                        type="create"
                        onSuccess={handleDepartmentSuccess}
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
                        <Table columns={columns} renderRow={renderRow} data={departments} />

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

export default DepartmentListPage;
