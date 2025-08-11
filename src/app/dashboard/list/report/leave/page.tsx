"use client";
import moment from "moment";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { fetchLeaves } from "@/lib/api/leave";
import { getEmployeeById } from "@/lib/api/employee";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdKeyboardArrowRight } from "react-icons/md";
import { BsSortDown } from "react-icons/bs";
import { TbReport } from "react-icons/tb";
import { LuCircleCheck } from "react-icons/lu";
import { MdOutlineCancel } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { PiCalendarDotBold } from "react-icons/pi";
import TableSearch from "@/components/TableSearch";
import DetailsModal from "@/components/DetailsModal";

interface Employee {
    name: string;
    employee_code: string;
}

type LeaveStatus = {
    status_name: string;
};

interface Leave {
    id: number;
    employee_id: number;
    reason: string;
    start_date: string;
    end_date: string;
    leave_type: {
        id: number;
        type_name: string;
    }
    status: LeaveStatus;
}


type LeavesResponse = {
    data: Leave[];
    current_page: number;
    total_pages: number;
    total_items: number;
};

type LeaveSummary = {
    approved: number;
    rejected: number;
    pending: number;
};


interface EmployeeMap {
    [id: number]: Employee;
}

const employeeMap: EmployeeMap = {};

const columns = [
    { header: "Employee ID", accessor: "employee_id" },
    { header: "Employee", accessor: "employee_name" },
    { header: "Approved Leaves", accessor: "approved_leaves" },
    { header: "Rejected Leaves", accessor: "rejected_leaves" },
    { header: "Pending Leaves", accessor: "pending_leaves" },
];


const LeaveTable: React.FC = () => {
    const router = useRouter();
    const [LeavesByPage, setLeavesByPage] = useState<{
        [key: string]: Leave[];
    }>({});
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [employees, setEmployees] = useState<EmployeeMap>({});

    const [leaveSummaryByEmployee, setLeaveSummaryByEmployee] = useState<{ [employeeId: number]: LeaveSummary }>({});

    const [showModal, setShowModal] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);


    useEffect(() => {
        loadLeaves(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    const loadLeaves = async (page: number, perPage: number) => {
        const cacheKey = `${page}-${perPage}`;

        // Use cached data if available
        if (LeavesByPage[cacheKey]) {
            setLeaves(LeavesByPage[cacheKey]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            setError(null);

            const res: LeavesResponse = await fetchLeaves(page, perPage);
            const filtered: Leave[] = res.data.filter((p: any) => p && p.start_date);

            // Summarize leave counts by employee for the current page data
            const summary: { [id: number]: LeaveSummary } = {};

            res.data.forEach((leave: Leave) => {
                const empId = leave.employee_id;
                const status = leave.status.status_name.toLowerCase();

                if (!summary[empId]) {
                    summary[empId] = { approved: 0, rejected: 0, pending: 0 };
                }

                if (status === "approved") summary[empId].approved++;
                else if (status === "rejected") summary[empId].rejected++;
                else if (status === "pending") summary[empId].pending++;
            });

            setLeaveSummaryByEmployee(summary);

                const employeeIds = Object.keys(summary).map(Number);

            // Fetch employee details
            const employeePromises = employeeIds.map(id => getEmployeeById(id));
            const employeeResults = await Promise.all(employeePromises);

            const newEmployeeMap: EmployeeMap = {};
            employeeResults.forEach((res, idx) => {
                const empData = res.data?.result?.data; // adjust this path to your API response
                if (empData) {
                    newEmployeeMap[employeeIds[idx]] = {
                        name: empData.name,
                        employee_code: empData.employee_code,
                    };
                }
            });
            
            setEmployees(newEmployeeMap);

            // Save to page cache
            setLeavesByPage((prev) => ({
                ...prev,
                [cacheKey]: filtered,
            }));

            setLeaves(filtered);
            setTotalPages(res.total_pages);
            setTotalItems(res.total_items);

        } catch (err) {
            setError("Failed to fetch leaves");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        setItemsPerPage(newSize);
        setCurrentPage(1);
        setLeaves([]); // Reset current visible data
        setLeavesByPage({}); // Clear cached data
    };

    const goBack = () => {
        router.push("/dashboard/list/dashboard/admin");
    };

    const employeeIds = Object.keys(leaveSummaryByEmployee).map(id => Number(id));
    const totalApproved = useMemo(() => {
        return Object.values(leaveSummaryByEmployee).reduce((sum, emp) => sum + emp.approved, 0);
    }, [leaveSummaryByEmployee]);

    const totalRejected = useMemo(() => {
        return Object.values(leaveSummaryByEmployee).reduce((sum, emp) => sum + emp.rejected, 0);
    }, [leaveSummaryByEmployee]);

    const totalPending = useMemo(() => {
        return Object.values(leaveSummaryByEmployee).reduce((sum, emp) => sum + emp.pending, 0);
    }, [leaveSummaryByEmployee]);

    const handleView = (employeeId: number, status: string) => {
        setSelectedEmployeeId(employeeId);
        setSelectedStatus(status);
        setShowModal(true);
    };

    const renderRow = (employeeId: number) => {
        const summary = leaveSummaryByEmployee[employeeId];
        const employee = employees[employeeId];
        return (
            <tr key={employeeId} className="border-b border-gray-200 text-sm">
                <td className="py-4 px-4">
                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 border border-blue-500 hover:border-transparent rounded">
                        #{employee?.employee_code || `ID: ${employeeId}`}
                    </button>
                </td>
                <td className="py-4 px-4">{employee?.name || `ID: ${employeeId}`}</td>
                <td className="py-4 px-4">
                    <button 
                        onClick={() => handleView(employeeId, "approved")}
                        className="px-3 py-1 text-sm text-white bg-[#3ec9d6] hover:bg-[#20a8b5] rounded"
                    >
                        {summary?.approved || 0} View
                    </button>                    
                </td>
                <td className="py-4 px-4">
                    <button 
                        onClick={() => handleView(employeeId, "rejected")}
                        className="px-3 py-1 text-sm text-white bg-[#ff3a6e] hover:bg-[#e71c52] rounded"
                    >
                        {summary?.rejected || 0} View
                    </button>
                </td>
                <td className="py-4 px-4">
                    <button 
                        onClick={() => handleView(employeeId, "pending")}
                        className="px-3 py-1 text-sm text-white bg-[#ffa21d] hover:bg-[#e38f17] rounded"
                    >
                        {summary?.pending || 0} View
                    </button>
                </td>
            </tr>
        );
    };

    const formattedDate = moment().format("MMMM-YYYY");

    if (loading) {
        return <p className="text-center py-10">Loading...</p>;
    }

    if (error) {
        return <p className="text-center py-10 text-red-600">{error}</p>;
    }

    return (
        <div>
            <div className="flex items-center justify-between m-4">
                <div>
                    <h1 className="hidden md:block text-lg font-semibold mb-0">Manage Leave Report</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                            onClick={goBack}
                            className="hover:underline cursor-pointer text-blue-600 font-light"
                        >
                            Home
                        </span>
                        <MdKeyboardArrowRight />
                        <span className="text-gray-700 font-light">Leave Report</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end m-4 mb-0">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                        <BsSortDown className="text-white font-semibold" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 m-4">
                <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                    <div className="p-3 bg-[#6FD943] rounded-lg text-white">
                        <TbReport size={24} />
                    </div>
                    <div className="ml-3">
                        <h1 className="hidden md:block text-lg font-semibold mb-0">Report</h1>
                        <span className="text-sm text-gray-400 font-light">Monthly Leave Summary</span>
                    </div>
                </div>
                <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                    <div className="p-3 bg-[#6c757d] rounded-lg text-white">
                        <PiCalendarDotBold size={24} />
                    </div>
                    <div className="ml-3">
                        <h1 className="hidden md:block text-lg font-semibold mb-0">Duration</h1>
                        <span className="text-sm text-gray-400 font-light">{formattedDate}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 m-4">
                <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                    <div className="p-3 bg-[#6FD943] rounded-lg text-white">
                        <LuCircleCheck size={24} />
                    </div>
                    <div className="ml-3">
                        <h1 className="hidden md:block text-lg font-semibold mb-0">Approved Leaves</h1>
                        <span className="text-sm text-gray-400 font-light">{totalApproved}</span>
                    </div>
                </div>
                <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                    <div className="p-3 bg-[#6c757d] rounded-lg text-white">
                        <MdOutlineCancel size={24} />
                    </div>
                    <div className="ml-3">
                        <h1 className="hidden md:block text-lg font-semibold mb-0">Rejected Leave</h1>
                        <span className="text-sm text-gray-400 font-light">{totalRejected}</span>
                    </div>
                </div>
                <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                    <div className="p-3 bg-[#6FD943] rounded-lg text-white">
                        <FiMinusCircle size={24} />
                    </div>
                    <div className="ml-3">
                        <h1 className="hidden md:block text-lg font-semibold mb-0">Pending Leaves</h1>
                        <span className="text-sm text-gray-400 font-light">{totalPending}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl m-4 mt-0 card-table">
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
                <Table
                    columns={columns}
                    data={employeeIds}
                    renderRow={renderRow}
                />
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
                 {showModal && (
                    <DetailsModal
                        leaves={leaves}
                        selectedEmployeeId={selectedEmployeeId}
                        selectedStatus={selectedStatus}
                        setShowModal={setShowModal}
                    />
                )}
            </div>
           
        </div>
    );
};

export default LeaveTable;
