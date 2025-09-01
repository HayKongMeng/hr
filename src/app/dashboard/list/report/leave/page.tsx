"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Spin, Button, Space, Tag, DatePicker, Row, Col, Statistic, message } from "antd";
import type { TableProps } from 'antd';
import { MdKeyboardArrowRight } from "react-icons/md";
import { fetchLeaves, fetchEmployeesLeave } from "@/lib/api/leave";
import { getEmployeeById } from "@/lib/api/employee";
import LeaveDetailsModal from "@/components/modals/LeaveDetailsModal"; // Import the new modal
import dayjs from "dayjs";

// --- Type Definitions ---
interface Employee {
    name: string;
    employee_code: string;
}

interface Leave {
    id: number;
    employee_id: number;
    reason: string;
    start_date: string;
    end_date: string;
    leave_type: { type_name: string; };
    status: { status_name: string; };
}

type LeaveSummary = {
    approved: number;
    rejected: number;
    pending: number;
};

// This will be the structure for our table rows
type EmployeeLeaveSummary = {
    key: number; // employee_id
    employee_code: string;
    employee_name: string;
    approved: number;
    rejected: number;
    pending: number;
};

const LeaveReportPage = () => {
    const router = useRouter();
    const [summaryData, setSummaryData] = useState<EmployeeLeaveSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    // State for the details modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [employeeLeaves, setEmployeeLeaves] = useState<Leave[]>([]);


    const fetchData = useCallback(async (page: number, pageSize: number, month: dayjs.Dayjs) => {
        setLoading(true);
        try {
            // Your API should ideally support date filtering.
            // Pass month and year to the API.
            const res = await fetchLeaves(page, pageSize);
            const leaves: Leave[] = res.data || [];

            const summaryMap: Record<number, LeaveSummary> = leaves.reduce((acc, leave) => {
                const empId = leave.employee_id;
                if (!acc[empId]) acc[empId] = { approved: 0, rejected: 0, pending: 0 };
                const status = leave.status.status_name.toLowerCase();
                if (status === 'approved') acc[empId].approved++;
                else if (status === 'rejected') acc[empId].rejected++;
                else if (status === 'pending') acc[empId].pending++;
                return acc;
            }, {} as Record<number, LeaveSummary>);

            const employeeIds = Array.from(new Set(leaves.map(l => l.employee_id)));
            const employeePromises = employeeIds.map(id => getEmployeeById(id).catch(() => null));
            const employeeResults = await Promise.all(employeePromises);

            const employeeMap: Record<number, Employee> = {};
            employeeResults.forEach(res => {
                if (res) {
                    const empData = res.data?.result?.data;
                    employeeMap[empData.id] = { name: empData.name, employee_code: empData.employee_code };
                }
            });

            const tableData: EmployeeLeaveSummary[] = employeeIds.map(id => ({
                key: id,
                employee_code: employeeMap[id]?.employee_code || `ID: ${id}`,
                employee_name: employeeMap[id]?.name || 'Unknown Employee',
                ...summaryMap[id],
            }));

            setSummaryData(tableData);
            setPagination(prev => ({ ...prev, total: res.total_items, current: page, pageSize }));

        } catch (err) {
            message.error("Failed to fetch leave report data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize, selectedMonth);
    }, [pagination.current, pagination.pageSize, selectedMonth, fetchData]);

    const handleViewDetails = async (employeeId: number, name: string, status: string) => {
        setSelectedEmployee({ id: employeeId, name });
        setSelectedStatus(status);
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await fetchEmployeesLeave(employeeId);
            setEmployeeLeaves(res.data || []);
        } catch {
            message.error(`Failed to load leaves for ${name}.`);
        } finally {
            setModalLoading(false);
        }
    };

    const columns: TableProps<EmployeeLeaveSummary>['columns'] = [
        { title: "Employee ID", dataIndex: "employee_code", key: "employee_code", sorter: (a, b) => a.employee_code.localeCompare(b.employee_code) },
        { title: "Employee Name", dataIndex: "employee_name", key: "employee_name", sorter: (a, b) => a.employee_name.localeCompare(b.employee_name) },
        { title: "Approved", dataIndex: "approved", key: "approved", align: 'center', render: (count, record) => (
                <Button type="link" onClick={() => handleViewDetails(record.key, record.employee_name, 'approved')} disabled={count === 0}>{count}</Button>
            )},
        { title: "Rejected", dataIndex: "rejected", key: "rejected", align: 'center', render: (count, record) => (
                <Button type="link" onClick={() => handleViewDetails(record.key, record.employee_name, 'rejected')} disabled={count === 0} danger>{count}</Button>
            )},
        { title: "Pending", dataIndex: "pending", key: "pending", align: 'center', render: (count, record) => (
                <Tag color="gold" style={{ cursor: count > 0 ? 'pointer' : 'default' }} onClick={() => count > 0 && handleViewDetails(record.key, record.employee_name, 'pending')}>{count}</Tag>
            )},
    ];

    const totalSummary = useMemo(() => {
        // Ideally, this data would come from a separate summary API endpoint.
        // For now, we calculate from the visible page data.
        return summaryData.reduce((acc, current) => {
            acc.approved += current.approved;
            acc.rejected += current.rejected;
            acc.pending += current.pending;
            return acc;
        }, { approved: 0, rejected: 0, pending: 0 });
    }, [summaryData]);

    return (
        // --- STYLE UPDATE: Main container with background color ---
        <div className="p-4 sm:p-6 bg-light-bg min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <div>
                    {/* --- STYLE UPDATE: Text colors --- */}
                    <h1 className="text-xl font-semibold text-text-primary">Leave Report</h1>
                    <div className="text-sm text-text-secondary flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-accent-purple font-medium">Home</span>
                        <MdKeyboardArrowRight />
                        <span>Leave Report</span>
                    </div>
                </div>
            </div>

            {/* --- STYLE UPDATE: Summary cards --- */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false} className="shadow-sm rounded-lg">
                        <Statistic title="Total Approved" value={totalSummary.approved} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false} className="shadow-sm rounded-lg">
                        <Statistic title="Total Rejected" value={totalSummary.rejected} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false} className="shadow-sm rounded-lg">
                        <Statistic title="Total Pending" value={totalSummary.pending} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
            </Row>

            {/* --- STYLE UPDATE: Main table card --- */}
            <Card bordered={false} className="shadow-sm rounded-lg">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <DatePicker
                        picker="month"
                        value={selectedMonth}
                        onChange={(date) => {
                            setSelectedMonth(date || dayjs());
                            setPagination(prev => ({ ...prev, current: 1 }));
                        }}
                        allowClear={false}
                    />
                    {/* You could add an Export button here later if you wish */}
                </div>
                <Table
                    columns={columns}
                    dataSource={summaryData}
                    loading={loading}
                    pagination={pagination}
                    onChange={(p) => setPagination(prev => ({...prev, current: p.current!, pageSize: p.pageSize! }))}
                    className="ant-table-wrapper--light" // Optional: for custom overrides
                />
            </Card>

            {/* Modal does not need style changes as it's a separate component */}
            {selectedEmployee && (
                <LeaveDetailsModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    employeeName={selectedEmployee.name}
                    status={selectedStatus}
                    leaves={employeeLeaves}
                    loading={modalLoading}
                />
            )}
        </div>
    );
};

export default LeaveReportPage;