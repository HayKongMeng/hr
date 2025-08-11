"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Loading from "@/components/ui/Loading";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import Image from "next/image";
import { fetchCompanyHistories } from "@/lib/api/companyHistory";

type CompanyHistory = {
    id: number;
    company: {
        id: number;
        name: string;
    };
    employee: {
        id: number;
        name: string;
    };
    start_date: string,
    end_date: string;
    notes: string;
};

const columns = [
    { header: "Company Name", accessor: "company_name" },
    { header: "Employee Name", accessor: "employee_name", className: "hidden md:table-cell" },
    { header: "Start Date", accessor: "start_date", className: "hidden lg:table-cell" },
    { header: "End Date", accessor: "end_date", className: "hidden lg:table-cell" },
    { header: "Note", accessor: "notes", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action" },
];

const AssignEmployeeToCompanyListPage = () => {
    const [CompanyHistoryByPage, setCompanyHistoryByPage] = useState<{ [page: number]: CompanyHistory[] }>({});
    const [companyHistories, setCompanyHistories] = useState<CompanyHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    useEffect(() => {
        const getCompanyHistories = async () => {
            // Use cached data if available
            if (CompanyHistoryByPage[currentPage]) {
                setCompanyHistories(CompanyHistoryByPage[currentPage]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetchCompanyHistories(currentPage, itemsPerPage);
                const filtered = res.data.filter((p: any) => p && p.start_date);

                // Save to page cache
                setCompanyHistoryByPage((prev) => ({
                    ...prev,
                    [currentPage]: filtered,
                }));

                setCompanyHistories(filtered);
                setTotalPages(res.total_pages);
                setTotalItems(res.total_items);
            } catch (err: any) {
                setError(err.message || "Failed to fetch company history");
            } finally {
                setLoading(false);
            }
        };

        getCompanyHistories();
    }, [currentPage]);

    const handleCompanyHistorySuccess = (updatedCompanyHistory: CompanyHistory) => {
        setCompanyHistoryByPage((prev) => {
            const updatedPage = (prev[currentPage] || []).map((comh) =>
                comh.id === updatedCompanyHistory.id ? updatedCompanyHistory : comh
            );

            const exists = prev[currentPage]?.some((comh) => comh.id === updatedCompanyHistory.id);

            const newPage = exists
                ? updatedPage
                : [updatedCompanyHistory, ...(prev[currentPage] || [])];

            return {
                ...prev,
                [currentPage]: newPage,
            };
        });

        // Update visible companies
        setCompanyHistories((prev) => {
            const index = prev.findIndex((comh) => comh.id === updatedCompanyHistory.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = updatedCompanyHistory;
                return updated;
            } else {
                return [updatedCompanyHistory, ...prev];
            }
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderRow = (item: CompanyHistory) => {
        return (
            <tr
                key={item.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-kungkeaPurpleLight"
            >
                <td className="flex items-center p-4">{item.company?.name || 'N/A'}</td>
                <td className="hidden md:table-cell">{item.employee?.name || 'N/A'}</td>
                <td className="hidden md:table-cell">{item.start_date}</td>
                <td className="hidden md:table-cell">{item.end_date}</td>
                <td className="hidden md:table-cell">{item.notes}</td>
                <td>
                    <div className="flex items-center gap-2">
                        {role === "admin" && (
                            <>
                                <FormModal
                                    table="CompanyHistory"
                                    type="update"
                                    data={item}
                                    onSuccess={handleCompanyHistorySuccess}
                                />
                                <FormModal
                                    table="CompanyHistory"
                                    type="delete"
                                    id={item.id}
                                    onSuccess={() => {
                                        const updated = companyHistories.filter((comh) => comh.id !== item.id);
                                        setCompanyHistories(updated);
                                        setCompanyHistoryByPage((prev) => ({
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
                        <h1 className="hidden md:block text-lg font-semibold">All Assign Employee To Company</h1>
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <TableSearch />
                            <div className="flex items-center gap-4 self-end">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                                    <Image src="/filter.png" alt="" width={14} height={14} />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                                    <Image src="/sort.png" alt="" width={14} height={14} />
                                </button>
                                <FormModal
                                    table="CompanyHistory"
                                    type="create"
                                    onSuccess={handleCompanyHistorySuccess}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LIST */}
                    <Table columns={columns} renderRow={renderRow} data={companyHistories} />

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

export default AssignEmployeeToCompanyListPage;
