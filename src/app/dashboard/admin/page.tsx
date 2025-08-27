'use client';

import Announcements from '@/components/Announcements';
import AttendanceChart from '@/components/AttendanceChart';
import CountChart from '@/components/CountChart';
import EventCalendar from '@/components/EventCalendar';
import FinanceChart from '@/components/FinanceChart';
import UserCard from '@/components/UserCard';
import { fetchDashboardSummary, DashboardSummary } from '@/lib/api/company';
import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import {toast} from "sonner";
import {Simulate} from "react-dom/test-utils";
import load = Simulate.load; // Import message for error feedback

const AdminPage = () => {
    const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const calculatePeriodChange = (data: number[]): number => {
        if (!data || data.length < 2) {
            return 0; // No change can be calculated
        }

        const initialValue = data[0];
        const currentValue = data[data.length - 1];

        if (initialValue === 0) {
            return currentValue > 0 ? 100 : 0;
        }

        const change = ((currentValue - initialValue) / initialValue) * 100;

        return change;
    };
    useEffect(() => {
        const getSummary = async () => {
            try {
                const data = await fetchDashboardSummary();
                setSummaryData(data);
            } catch (error) {
                toast.error("Failed to load dashboard data. Please try again." + error);
                setSummaryData(null);
            } finally {
                setLoading(false);
            }
        };
        getSummary();
    }, []);

    if (loading || !summaryData) {
        return <Spin />;
    }
    const { total_employees, checkins, checkouts, leave_requests } = summaryData.line_chart_data;
    const employeeChartData = {
        chartData: total_employees.map(value => ({ value })),
        percentageChange: calculatePeriodChange(total_employees),
    };
    const checkInChartData = {
        chartData: checkins.map(value => ({ value })),
        percentageChange: calculatePeriodChange(checkins),
    };
    const checkOutChartData = {
        chartData: checkouts.map(value => ({ value })),
        percentageChange: calculatePeriodChange(checkouts),
    };
    const leaveChartData = {
        chartData: leave_requests.map(value => ({ value })),
        percentageChange: calculatePeriodChange(leave_requests),
    };


    if (loading || !summaryData) {
        return (
            <div className='bg-light-bg p-4 flex justify-center items-center h-[80vh]'>
                {loading ? <Spin size="large" /> : <div className="text-text-secondary">Failed to load data.</div>}
            </div>
        );
    }

    return (
        <div className='p-6 space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                <UserCard data={{type: 'TOTAL EMPLOYEES', count: summaryData.total_employees, ...employeeChartData}} />
                <UserCard data={{type: 'TOTAL CHECK - IN', count: summaryData.checkins_today,...checkInChartData}} />
                <UserCard data={{type: 'TOTAL CHECK - OUT', count: summaryData.checkouts_today, ...checkOutChartData}} />
                <UserCard data={{type: 'TOTAL LEAVE REQUEST', count: summaryData.leave_requests_today, ...leaveChartData}} />
            </div>

            {/* Main content area */}
            <div className='flex gap-6 flex-col lg:flex-row'>
                {/* Left Column */}
                <div className='w-full lg:w-2/3 flex flex-col gap-6'>
                    <div className='flex gap-6 flex-col md:flex-row'>
                        <div className='w-full md:w-1/3 h-[450px]'>
                            <CountChart genderData={summaryData.employee_gender} totalEmployees={summaryData.total_employees} />
                        </div>
                        <div className='w-full md:w-2/3 h-[450px]'>
                            <AttendanceChart weeklyData={summaryData.weekly_summary} />
                        </div>
                    </div>
                    <div className='w-full h-[500px]'>
                        <FinanceChart />
                    </div>
                </div>

                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <EventCalendar birthdays={summaryData.upcoming_birthdays} />
                    <Announcements />
                </div>
            </div>
        </div>
    )
}

export default AdminPage;