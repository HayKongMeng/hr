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
import { fetchLeaves } from "@/lib/api/leave";
import { getEmployeeById } from "@/lib/api/employee";

type Leave = {
    id: number;
    leave_type: {
        id: number;
        type_name: string;
    },
    start_date: string;
    employee_id: number;
    end_date: string;
    status: {
        id: number;
        status_name: string;
    }
};

const columns = [
    { header: "Leave Type", accessor: "leave_type_id", className: "hidden md:table-cell" },
    { header: "From", accessor: "start_date", className: "hidden lg:table-cell" },
    { header: "Employee", accessor: "employee_id" },
    { header: "To", accessor: "end_date", className: "hidden lg:table-cell" },
    { header: "No of Days", accessor: "no_of_days", className: "hidden lg:table-cell" },
    { header: "Status", accessor: "status_id", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action" },
];

const LeaveListPage = () => {
    const [employeeMap, setEmployeeMap] = useState<{ [id: number]: any }>({});
    const [LeavesByPage, setLeavesByPage] = useState<{ [page: number]: Leave[] }>({});
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    useEffect(() => {
        const getLeaves = async () => {
            // Use cached data if available
            if (LeavesByPage[currentPage]) {
                setLeaves(LeavesByPage[currentPage]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetchLeaves(currentPage, itemsPerPage);
                const filtered: Leave[] = res.data.filter((p: any) => p && p.start_date);
                const uniqueEmployeeIds: number[] = Array.from(
                    new Set(
                        filtered
                            .filter((item): item is Leave & { employee_id: number } => item.employee_id !== undefined)
                            .map((item) => item.employee_id)
                    )
                );

                // Fetch all employee info in parallel
                const employeeResponses = await Promise.all(
                    uniqueEmployeeIds.map((id) => getEmployeeById(id).catch(() => null)) // avoid break on failure
                );

                const employeeData: { [id: number]: any } = {};
                employeeResponses.forEach((res, index) => {
                    const employee = res?.data?.result?.data;
                    if (employee) {
                        employeeData[uniqueEmployeeIds[index]] = employee;
                    }
                });

                // Save employee info
                setEmployeeMap((prev) => ({
                    ...prev,
                    ...employeeData,
                }));


                // Save to page cache
                setLeavesByPage((prev) => ({
                    ...prev,
                    [currentPage]: filtered,
                }));

                setLeaves(filtered);
                setTotalPages(res.total_pages);
                setTotalItems(res.total_items);
            } catch (err: any) {
                setError(err.message || "Failed to fetch positions");
            } finally {
                setLoading(false);
            }
        };

        getLeaves();
    }, [currentPage]);

    const handleLeaveSuccess = (updatedLeave: Leave) => {
        setLeavesByPage((prev) => {
            const updatedPage = (prev[currentPage] || []).map((lea) =>
                lea.id === updatedLeave.id ? updatedLeave : lea
            );

            const exists = prev[currentPage]?.some((lea) => lea.id === updatedLeave.id);

            const newPage = exists
                ? updatedPage
                : [updatedLeave, ...(prev[currentPage] || [])];

            return {
                ...prev,
                [currentPage]: newPage,
            };
        });

        // Update visible leaves
        setLeaves((prev) => {
            const index = prev.findIndex((lea) => lea.id === updatedLeave.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = updatedLeave;
                return updated;
            } else {
                return [updatedLeave, ...prev];
            }
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderRow = (item: Leave) => {
        if (!item || !item.start_date) return null;

        return (
            <tr
                key={item.id}
                className="border border-gray-200 even:bg-slate-50 text-sm hover:bg-kungkeaPurpleLight "
            >
                <td className="hidden md:table-cell pt-4 pb-4">{item.leave_type.type_name}</td>
                <td className="hidden md:table-cell">
                    {moment(item.start_date).format("DD MMM YYYY")}
                </td>
                <td className="hidden md:table-cell">
                   {employeeMap[item.employee_id]?.name || `ID: ${item.employee_id}`}
                </td>
                <td className="hidden md:table-cell">
                    {moment(item.end_date).format("DD MMM YYYY")}
                </td>
                <td className="hidden md:table-cell">
                   {moment(item.end_date).diff(moment(item.start_date), 'days') + 1} day
                </td>
                <td className="hidden md:table-cell">
                    {item.status.status_name}
                </td>
                <td>
                    <div className="flex items-center gap-2">
                        {role === "admin" && (
                            <>
                                <FormModal
                                    table="Leave"
                                    type="create"
                                    data={item}
                                    onSuccess={handleLeaveSuccess}
                                />
                                <FormModal
                                    table="Leave"
                                    type="update"
                                    data={item}
                                    onSuccess={handleLeaveSuccess}
                                />
                                <FormModal
                                    table="Leave"
                                    type="delete"
                                    id={item.id}
                                    onSuccess={() => {
                                        const updated = leaves.filter((lea) => lea.id !== item.id);
                                        setLeaves(updated);
                                        setLeavesByPage((prev) => ({
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
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* TOP */}
                    <div className="flex items-center justify-between">
                        <h1 className="hidden md:block text-lg font-semibold">Leaves List</h1>
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <TableSearch />
                            <div className="flex items-center gap-4 self-end">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                                    <BsSortDown className="text-white font-semibold" />
                                </button>
                                <FormModal
                                    table="Leave"
                                    type="create"
                                    onSuccess={handleLeaveSuccess}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LIST */}
                    <Table columns={columns} renderRow={renderRow} data={leaves} />

                    {/* PAGINATION */}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default LeaveListPage;
