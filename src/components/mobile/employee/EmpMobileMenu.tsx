import Link from 'next/link';
import React from 'react'
import { GoHome } from "react-icons/go";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { LiaUserCircle } from "react-icons/lia";
import { TbReportAnalytics } from "react-icons/tb";


const EmpMobileMenu = () => {

    const employeeId = typeof window !== 'undefined' ? localStorage.getItem('employee_id') : null;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
            <nav className="flex justify-around items-center h-16">
                <Link href="/dashboard/mobile/home" className="flex flex-col items-center text-teal-600 font-bold">
                <GoHome className="w-6 h-6" />
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link href="/dashboard/list/attendance/markedattendance" className="flex flex-col items-center text-gray-500 hover:text-teal-600">
                    <HiOutlineCalendarDays className="w-6 h-6" />
                    <span className="text-xs mt-1">Attendance</span>
                </Link>
                <Link href="/dashboard/list/leaves" className="flex flex-col items-center text-gray-500 hover:text-teal-600">
                    <TbReportAnalytics className="w-6 h-6" />
                    <span className="text-xs mt-1">Leave</span>
                </Link>
                <Link href={`/dashboard/list/employees/${employeeId}`} className="flex flex-col items-center text-gray-500 hover:text-teal-600">
                    <LiaUserCircle className="w-6 h-6" />
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </nav>
        </footer>
    )
}

export default EmpMobileMenu;
