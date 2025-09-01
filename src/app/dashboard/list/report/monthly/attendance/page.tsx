"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Spin, Button, Space, Tag, DatePicker, Row, Col, Statistic, message } from "antd";
import type { TableProps } from 'antd';
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaFileExcel } from "react-icons/fa";
import { findEmployees } from "@/lib/api/attendances";
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);
// Define the shape of our processed data
type ProcessedAttendance = {
    key: number; // employee_id
    name: string;
    // Each day will be a property, e.g., '01': 'P'
    [day: string]: any;
};

// Define the shape for summary stats
type SummaryStats = {
    totalPresent: number;
    totalLate: number;
    totalAbsent: number;
    totalLeave: number; // Placeholder
};

const MonthlyAttendance = () => {
    const router = useRouter();
    const [attendanceData, setAttendanceData] = useState<ProcessedAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [summary, setSummary] = useState<SummaryStats>({ totalPresent: 0, totalLate: 0, totalAbsent: 0, totalLeave: 0 });

    const fetchData = useCallback(async (month: dayjs.Dayjs) => {
        setLoading(true);
        try {
            const result = await findEmployees();
            const rawData = result.data;

            let totalPresent = 0;
            let totalLate = 0;
            let totalAbsent = 0;

            const groupedData = rawData.reduce((acc: Record<number, ProcessedAttendance>, record: any) => {
                const employeeId = record.employee_id;
                const date = dayjs(record.date);
                const day = date.format('DD');

                if (!acc[employeeId]) {
                    acc[employeeId] = {
                        key: employeeId,
                        name: record.employee.name,
                    };
                }

                // Get status from the nested array
                const attendanceRecord = record.attendance_data?.[0];
                let status = 'A'; // Default to Absent
                if (attendanceRecord) {
                    if (attendanceRecord.status?.toLowerCase() === 'present') {
                        status = 'P';
                        totalPresent++;
                    } else if (attendanceRecord.status?.toLowerCase() === 'late') {
                        status = 'L';
                        totalLate++;
                    }
                } else {
                    // Only count weekdays as absent
                    if(date.isoWeekday() <= 5) {
                        totalAbsent++;
                    }
                }

                acc[employeeId][day] = status;
                return acc;
            }, {});

            setAttendanceData(Object.values(groupedData));
            setSummary({ totalPresent, totalLate, totalAbsent, totalLeave: 0 }); // Update summary stats

        } catch (error) {
            console.error("Failed to fetch attendance:", error);
            message.error("Failed to fetch attendance data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedMonth);
    }, [selectedMonth, fetchData]);

    // --- Generate Table Columns Dynamically ---
    const generateColumns = (month: dayjs.Dayjs): TableProps<ProcessedAttendance>['columns'] => {
        const daysInMonth = month.daysInMonth();
        const columns: TableProps<ProcessedAttendance>['columns'] = [
            {
                title: "Employee Name",
                dataIndex: "name",
                key: "name",
                width: 200,
                fixed: 'left', // Freeze the name column
            },
        ];

        for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = i.toString().padStart(2, '0');
            const date = month.date(i);
            columns.push({
                title: () => (
                    <div className="text-center">
                        <div>{i}</div>
                        <div className="text-xs text-gray-400">{date.format('ddd')}</div>
                    </div>
                ),
                dataIndex: dayStr,
                key: dayStr,
                width: 60,
                align: 'center',
                render: (status: 'P' | 'A' | 'L') => {
                    switch (status) {
                        case 'P': return <Tag color="success">P</Tag>;
                        case 'L': return <Tag color="warning">L</Tag>;
                        case 'A': return <Tag color="error">A</Tag>;
                        default: return <span className="text-gray-300">-</span>;
                    }
                },
            });
        }
        return columns;
    };

    const [columns, setColumns] = useState(generateColumns(selectedMonth));

    useEffect(() => {
        setColumns(generateColumns(selectedMonth));
    }, [selectedMonth]);

    const handleExport = () => {
        message.loading({ content: 'Generating Excel file...', key: 'export' });

        if (columns === undefined) {
            message.error('No columns found.');
            return;
        }

        const headers = ["Employee Name", ...columns.slice(1).map(col => (col.title as () => JSX.Element)().props.children[0].props.children)];
        const dataToExport = attendanceData.map(row => {
            const rowData: (string | number)[] = [row.name];
            columns.slice(1).forEach(col => {
                const dayKey = col.key as string;
                rowData.push(row[dayKey] || '');
            });
            return rowData;
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataToExport]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance_${selectedMonth.format("MMM_YYYY")}`);
        XLSX.writeFile(workbook, `Attendance_Report_${selectedMonth.format("MMMM_YYYY")}.xlsx`);

        message.success({ content: 'Exported successfully!', key: 'export' });
    };

    return (
        <div className="p-4 sm:p-6 bg-light-bg min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">Monthly Attendance Report</h1>
                    <div className="text-sm text-text-secondary flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-accent-purple font-medium">Home</span>
                        <MdKeyboardArrowRight />
                        <span>Attendance Report</span>
                    </div>
                </div>
            </div>

            {/* --- STYLE UPDATE: Summary cards with new theme styles --- */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm rounded-lg bg-light-card">
                        <Statistic title="Total Present" value={summary.totalPresent} valueStyle={{ color: '#3f8600' }} loading={loading} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm rounded-lg bg-light-card">
                        <Statistic title="Total Late" value={summary.totalLate} valueStyle={{ color: '#faad14' }} loading={loading} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm rounded-lg bg-light-card">
                        <Statistic title="Total Absent" value={summary.totalAbsent} valueStyle={{ color: '#cf1322' }} loading={loading} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm rounded-lg bg-light-card">
                        <Statistic title="Total On Leave" value={summary.totalLeave} loading={loading} />
                    </Card>
                </Col>
            </Row>

            {/* --- STYLE UPDATE: Main table card --- */}
            <Card bordered={false} className="shadow-sm rounded-lg bg-light-card">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <DatePicker
                        picker="month"
                        value={selectedMonth}
                        onChange={(date) => setSelectedMonth(date || dayjs())}
                        allowClear={false}
                    />
                    <Button icon={<FaFileExcel />} onClick={handleExport}>Export to Excel</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={attendanceData}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    className="ant-table-wrapper--light"
                />
            </Card>
        </div>
    );
};

export default MonthlyAttendance;