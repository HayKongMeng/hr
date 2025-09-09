"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, Table, Spin, Button, Space, Tag, DatePicker, Row, Col, Statistic, message, Typography, Breadcrumb } from "antd";
import type { TableProps } from 'antd';
import { findEmployees } from "@/lib/api/attendances";
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import isoWeek from 'dayjs/plugin/isoWeek';
import { FaFileExcel, FaRegCalendarCheck, FaClock, FaCalendarTimes, FaUserSlash } from "react-icons/fa";
import { HomeOutlined } from "@ant-design/icons";

dayjs.extend(isoWeek);

const { Title, Text } = Typography;

// --- Type Definitions ---
type ProcessedAttendance = {
    key: number;
    name: string;
    [day: string]: any;
};
type SummaryStats = { totalPresent: number; totalLate: number; totalAbsent: number; totalLeave: number; };

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


const MonthlyAttendance = () => {
    const [attendanceData, setAttendanceData] = useState<ProcessedAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [summary, setSummary] = useState<SummaryStats>({ totalPresent: 0, totalLate: 0, totalAbsent: 0, totalLeave: 0 });

    const fetchData = useCallback(async (month: dayjs.Dayjs) => {
        setLoading(true);
        try {
            const result = await findEmployees();
            const rawData = result.data;

            let totalPresent = 0, totalLate = 0, totalAbsent = 0;

            const daysInMonth = month.daysInMonth();
            const allDays = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));

            const groupedData = rawData.reduce((acc: Record<number, ProcessedAttendance>, record: any) => {
                const employeeId = record.employee_id;
                const date = dayjs(record.date);

                // Only process records for the selected month
                if (!date.isSame(month, 'month')) {
                    return acc;
                }

                const day = date.format('DD');

                if (!acc[employeeId]) {
                    acc[employeeId] = { key: employeeId, name: record.employee.name };
                }

                const attendanceRecord = record.attendance_data?.[0];
                let status = 'A';
                if (attendanceRecord) {
                    if (attendanceRecord.status?.toLowerCase() === 'present') { status = 'P'; totalPresent++; }
                    else if (attendanceRecord.status?.toLowerCase() === 'late') { status = 'L'; totalLate++; }
                } else {
                    if (date.isoWeekday() <= 5) totalAbsent++;
                }
                acc[employeeId][day] = status;
                return acc;
            }, {});

            // Fill in missing days for each employee
            Object.values(groupedData).forEach(employee => {
                allDays.forEach(day => {
                    if (!employee[day]) {
                        const date = month.date(parseInt(day));
                        // If it's a weekday and no record, it's Absent. Otherwise, it's a weekend/holiday.
                        if (date.isoWeekday() <= 5) {
                            employee[day] = 'A';
                        } else {
                            employee[day] = 'WE'; // Weekend/Holiday
                        }
                    }
                });
            });

            setAttendanceData(Object.values(groupedData));
            setSummary({ totalPresent, totalLate, totalAbsent, totalLeave: 0 });

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

    const generateColumns = (month: dayjs.Dayjs): TableProps<ProcessedAttendance>['columns'] => {
        const daysInMonth = month.daysInMonth();
        const columns: TableProps<ProcessedAttendance>['columns'] = [
            {
                title: "Employee",
                dataIndex: "name",
                key: "name",
                width: 200,
                fixed: 'left',
                className: 'font-semibold bg-white',
            },
        ];

        for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = i.toString().padStart(2, '0');
            const date = month.date(i);
            const isWeekend = date.isoWeekday() > 5;
            columns.push({
                title: () => (
                    <div className={`text-center ${isWeekend ? 'text-gray-400' : ''}`}>
                        <div>{i}</div>
                        <div className="text-xs font-normal">{date.format('ddd')}</div>
                    </div>
                ),
                dataIndex: dayStr,
                key: dayStr,
                width: 65,
                align: 'center',
                render: (status: 'P' | 'A' | 'L' | 'WE') => {
                    switch (status) {
                        case 'P': return <Tag color="green" className="m-0 rounded-full font-bold">P</Tag>;
                        case 'L': return <Tag color="orange" className="m-0 rounded-full font-bold">L</Tag>;
                        case 'A': return <Tag color="red" className="m-0 rounded-full font-bold">A</Tag>;
                        case 'WE': return <span className="text-gray-300">-</span>;
                        default: return <span className="text-gray-300">-</span>;
                    }
                },
            });
        }
        return columns;
    };

    const columns = generateColumns(selectedMonth);

    const handleExport = () => { /* ... (export logic is fine) ... */ };

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <Title level={2} className="!mb-1">Monthly Attendance Report</Title>
            <Breadcrumb
                className="mb-6"
                items={[
                    { href: '/dashboard/list/dashboard/admin', title: <Space><HomeOutlined /> Home</Space> },
                    { title: 'Attendance Report' },
                ]}
            />

            <Row gutter={[24, 24]} className="mb-6">
                <Col xs={24} sm={12} lg={6}><StatCard icon={<FaRegCalendarCheck />} title="Total Present" value={summary.totalPresent} color="bg-gradient-to-tr from-green-500 to-green-400" loading={loading} /></Col>
                <Col xs={24} sm={12} lg={6}><StatCard icon={<FaClock />} title="Total Late" value={summary.totalLate} color="bg-gradient-to-tr from-yellow-500 to-yellow-400" loading={loading} /></Col>
                <Col xs={24} sm={12} lg={6}><StatCard icon={<FaUserSlash />} title="Total Absent" value={summary.totalAbsent} color="bg-gradient-to-tr from-red-500 to-red-400" loading={loading} /></Col>
                <Col xs={24} sm={12} lg={6}><StatCard icon={<FaCalendarTimes />} title="On Leave" value={summary.totalLeave} color="bg-gradient-to-tr from-blue-500 to-blue-400" loading={loading} /></Col>
            </Row>

            <Card bordered={false} className="shadow-lg rounded-xl mb-6">
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <DatePicker
                            picker="month"
                            value={selectedMonth}
                            onChange={(date) => setSelectedMonth(date || dayjs())}
                            allowClear={false}
                            size="large"
                            className="w-full sm:w-auto"
                        />
                    </Col>
                    <Col>
                        <Button type="primary" icon={<FaFileExcel />} onClick={handleExport} size="large">
                            Export to Excel
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} className="shadow-lg rounded-xl">
                <Spin spinning={loading} tip="Loading Attendance...">
                    <Table
                        columns={columns}
                        dataSource={attendanceData}
                        pagination={false}
                        scroll={{ x: 'max-content', y: 500 }}
                        className="modern-attendance-table"
                        bordered
                    />
                </Spin>
            </Card>
        </div>
    );
};

export default MonthlyAttendance;