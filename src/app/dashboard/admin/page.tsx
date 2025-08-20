'use client';

import Announcements from '@/components/Announcements';
import AttendanceChart from '@/components/AttendanceChart';
import CountChart from '@/components/CountChart';
import EventCalendar from '@/components/EventCalendar';
import FinanceChart from '@/components/FinanceChart';
import UserCard from '@/components/UserCard';
import { fetchDashboardSummary, DashboardSummary } from '@/lib/api/company';
import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd'; // Import message for error feedback

const AdminPage = () => {
    const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSummary = async () => {
            try {
                // No need to setLoading(true) here, it's already true initially
                const data = await fetchDashboardSummary();
                console.log("Fetched Summary Data:", data); // DEBUGGING: Check if data is correct
                setSummaryData(data);
            } catch (error) {
                console.error("Could not load dashboard data.", error);
                message.error("Failed to load dashboard data. Please try again.");
                // Set data to null in case of error
                setSummaryData(null);
            } finally {
                setLoading(false);
            }
        };

        getSummary();
    }, []);

    // --- THE FIX IS HERE ---
    // Combine the loading and data checks. Show the spinner if we are loading OR if we don't have data yet.
    // This prevents rendering children with null/undefined props.
    if (loading || !summaryData) {
        return (
            <div className='p-4 flex justify-center items-center h-[80vh]'>
                {/* Show spinner while loading, show error message if loading is done but data is still null */}
                {loading ? <Spin size="large" /> : <div>Failed to load dashboard data. Please try refreshing the page.</div>}
            </div>
        );
    }

    // By the time we reach this point, we are guaranteed to have valid summaryData.
    return (
        <div className='p-4 flex gap-4 flex-col md:flex-row'>
            <div className='w-full lg:w-2/3 flex flex-col gap-8'>
                <div className='flex gap-4 justify-between flex-wrap'>
                    <UserCard type='TOTAL EMPLOYEES' count={summaryData.total_employees} />
                    <UserCard type='TOTAL CHECK - IN' count={summaryData.checkins_today} />
                    <UserCard type='TOTAL CHECK - OUT' count={summaryData.checkouts_today} />
                    <UserCard type='TOTAL LEAVE REQUEST' count={summaryData.leave_requests_today} />
                </div>
                <div className='flex gap-4 flex-col lg:flex-row'>
                    <div className='w-full lg:w-1/3 h-[450px]'>
                        <CountChart genderData={summaryData.employee_gender} totalEmployees={summaryData.total_employees} />
                    </div>
                    <div className='w-full lg:w-2/3 h-[450px]'>
                        <AttendanceChart />
                    </div>
                </div>
                <div className='className="w-full h-[500px]"'>
                    <FinanceChart />
                </div>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <EventCalendar />
                <Announcements />
            </div>
        </div>
    )
}

export default AdminPage;