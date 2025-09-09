"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Card, Table, Spin, Button, Space, Tag, DatePicker, Row, Col, Statistic, message, Typography, Breadcrumb } from "antd";
import type { TableProps } from 'antd';
import { fetchLeaves, fetchEmployeesLeave } from "@/lib/api/leave";
import { getEmployeeById } from "@/lib/api/employee";
import LeaveDetailsModal from "@/components/modals/LeaveDetailsModal";
import dayjs from "dayjs";
import { HomeOutlined } from "@ant-design/icons";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";

const { Title, Text } = Typography;

// --- Type Definitions ---
interface Employee { name: string; employee_code: string; }
interface Leave { id: number; employee_id: number; reason: string; start_date: string; end_date: string; leave_type: { type_name: string; }; status: { status_name: string; }; }
type LeaveSummary = { approved: number; rejected: number; pending: number; };
type EmployeeLeaveSummary = { key: number; employee_code: string; employee_name: string; approved: number; rejected: number; pending: number; };

// --- Styled Statistic Card Component ---
const StatCard = ({ icon, title, value, color, loading }: { icon: React.ReactNode; title: string; value: number | string; color: string; loading: boolean }) => (
    <Card bordered={false} className={`shadow-md rounded-xl text-white overflow-hidden ${color}`}>
        <Spin spinning={loading} wrapperClassName="w-full">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <Text className="text-white/80 uppercase tracking-wider text-sm">{title}</Text>
                    <Title level={2} className="!text-white !mb-0">{value}</Title>
                </div>
                <div className="text-white/30 text-5xl">
                    {icon}
                </div>
            </div>
        </Spin>
    </Card>
);

const LeaveReportPage = () => {
    const [summaryData, setSummaryData] = useState<EmployeeLeaveSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [employeeLeaves, setEmployeeLeaves] = useState<Leave[]>([]);

    const fetchData = useCallback(async (page: number, pageSize: number, month: dayjs.Dayjs) => {
        setLoading(true);
        try {
            // NOTE: Ideally, your API `fetchLeaves` would accept month/year for filtering.
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
                    if(empData) employeeMap[empData.id] = { name: empData.name, employee_code: empData.employee_code };
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
            // Filter leaves by status for the modal view
            const filteredLeaves = (res.data || []).filter((leave: Leave) => leave.status.status_name.toLowerCase() === status);
            setEmployeeLeaves(filteredLeaves);
        } catch {
            message.error(`Failed to load leaves for ${name}.`);
        } finally {
            setModalLoading(false);
        }
    };

    const columns: TableProps<EmployeeLeaveSummary>['columns'] = [
        { title: "Employee ID", dataIndex: "employee_code", key: "employee_code", sorter: (a, b) => a.employee_code.localeCompare(b.employee_code) },
        { title: "Employee Name", dataIndex: "employee_name", key: "employee_name", sorter: (a, b) => a.employee_name.localeCompare(b.employee_name) },
        {
            title: "Approved", dataIndex: "approved", key: "approved", align: 'center',
            render: (count, record) => (
                <Tag color="green" onClick={() => count > 0 && handleViewDetails(record.key, record.employee_name, 'approved')} className={count > 0 ? 'cursor-pointer' : ''} style={{fontSize: '14px', padding: '4px 10px'}}>{count}</Tag>
            )
        },
        {
            title: "Rejected", dataIndex: "rejected", key: "rejected", align: 'center',
            render: (count, record) => (
                <Tag color="red" onClick={() => count > 0 && handleViewDetails(record.key, record.employee_name, 'rejected')} className={count > 0 ? 'cursor-pointer' : ''} style={{fontSize: '14px', padding: '4px 10px'}}>{count}</Tag>
            )
        },
        {
            title: "Pending", dataIndex: "pending", key: "pending", align: 'center',
            render: (count, record) => (
                <Tag color="gold" onClick={() => count > 0 && handleViewDetails(record.key, record.employee_name, 'pending')} className={count > 0 ? 'cursor-pointer' : ''} style={{fontSize: '14px', padding: '4px 10px'}}>{count}</Tag>
            )
        },
    ];

    const totalSummary = useMemo(() => {
        // NOTE: This calculates only the total of the *current page*.
        // For an accurate total, your API should provide a separate summary endpoint.
        return summaryData.reduce((acc, current) => {
            acc.approved += current.approved;
            acc.rejected += current.rejected;
            acc.pending += current.pending;
            return acc;
        }, { approved: 0, rejected: 0, pending: 0 });
    }, [summaryData]);

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <Title level={2} className="!mb-1">Leave Report</Title>
            <Breadcrumb
                className="mb-6"
                items={[
                    { href: '/dashboard/list/dashboard/admin', title: <Space><HomeOutlined /> Home</Space> },
                    { title: 'Leave Report' },
                ]}
            />

            <Row gutter={[24, 24]} className="mb-6">
                <Col xs={24} sm={12} lg={8}>
                    <StatCard icon={<FaCheckCircle />} title="Total Approved" value={totalSummary.approved} color="bg-gradient-to-tr from-green-500 to-green-400" loading={loading} />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <StatCard icon={<FaTimesCircle />} title="Total Rejected" value={totalSummary.rejected} color="bg-gradient-to-tr from-red-500 to-red-400" loading={loading} />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <StatCard icon={<FaHourglassHalf />} title="Total Pending" value={totalSummary.pending} color="bg-gradient-to-tr from-yellow-500 to-yellow-400" loading={loading} />
                </Col>
            </Row>

            <Card bordered={false} className="shadow-lg rounded-xl">
                <Row justify="space-between" align="middle" gutter={[16, 16]} className="mb-4">
                    <Col>
                        <Title level={5} className="!m-0">Employee Leave Summary</Title>
                    </Col>
                    <Col>
                        <DatePicker
                            picker="month"
                            value={selectedMonth}
                            onChange={(date) => {
                                setSelectedMonth(date || dayjs());
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                            allowClear={false}
                            size="large"
                            className="w-full sm:w-auto"
                        />
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={summaryData}
                    loading={loading}
                    pagination={pagination}
                    onChange={(p) => setPagination(prev => ({...prev, current: p.current!, pageSize: p.pageSize! }))}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

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