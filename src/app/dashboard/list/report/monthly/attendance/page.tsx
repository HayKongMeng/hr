"use client";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { TbFileReport } from "react-icons/tb";
import { MdOutlineReport } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { RiTimerLine } from "react-icons/ri";
import { MdKeyboardArrowRight } from "react-icons/md";
import { BsSortDown } from "react-icons/bs";
import { TbReport } from "react-icons/tb";
import { PiCalendarDotBold } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { findEmployees } from "@/lib/api/attendances";
import Table from "@/components/Table";
import Loading from "@/components/ui/Loading";

type Attendance = {
    id: number;
    employee: {
        name: string;
    };
    attendance: {
        [day: string]: "P" | "A" | null;
    };
};

const columns = [
    {
        header: "NAME",
        accessor: "name",
        className: "sticky left-0 bg-[#f8f9fd] z-10",
    },
    ...Array.from({ length: 30 }, (_, i) => {
        const day = (i + 1).toString().padStart(2, "0");
        return {
            header: day,
            accessor: day,
            className: "text-center text-xs",
        };
    }),
];

const MonthlyAttendance = () => {
    const router = useRouter();
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            try {
                const result = await findEmployees();
                const rawData = result.data;
               
                // Group by employee and date
                const grouped: { [employeeId: number]: Attendance } = {};

                rawData.forEach((record: any) => {
                const day = new Date(record.date).getDate().toString().padStart(2, "0");

                if (!grouped[record.employee_id]) {
                    grouped[record.employee_id] = {
                        id: record.employee_id,
                        employee: {
                            name: record.employee.name,
                        },
                        attendance: {},
                    };
                }

                // ✅ Get correct status from nested attendance_data[0]
                const attendanceStatus = record.attendance_data?.[0]?.status;

                grouped[record.employee_id].attendance[day] =
                    attendanceStatus?.startsWith("P") ? "P" : "A";
                });

                setAttendanceData(Object.values(grouped));
            } catch (error) {
                console.error("Failed to fetch attendance:", error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    const goBack = () => {
        router.push("/dashboard/list/dashboard/admin");
    };

    const formattedDate = moment().format("MMMM-YYYY");

    const renderRow = (item: Attendance) => {
        return (
            <tr key={item.id} className="border-b border-gray-200 text-sm">
                <td className="py-4 px-4">
                    {item.employee.name}
                </td>
                {Array.from({ length: 30 }, (_, i) => {
                    const day = (i + 1).toString().padStart(2, "0");
                    const status = item.attendance?.[day];
                    return (
                        <td key={day} className="py-4 px-4">
                            {status === "P" && (
                                <span className="bg-[#6fd943] text-white text-xs px-2 py-1 rounded italic">
                                P
                                </span>
                            )}
                            {status === "A" && (
                                <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded italic">
                                A
                                </span>
                            )}
                            {!status && (
                                <span className="text-gray-300 text-xs"></span>
                            )}
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <div>
            {/* Header and Navigation */}
            <div className="flex items-center justify-between m-4">
                <div>
                    <h1 className="hidden md:block text-lg font-semibold mb-0">
                        Manage Monthly Attendance
                    </h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                            onClick={goBack}
                            className="hover:underline cursor-pointer text-blue-600 font-light"
                        >
                        Home
                        </span>
                            <MdKeyboardArrowRight />
                            <span className="text-gray-700 font-light">
                            Manage Monthly Attendance Report
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end m-4 mb-0">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                    <BsSortDown className="text-white font-semibold" />
                </button>
                </div>
            </div>

            {/* Table or Loading */}
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 m-4">
                        <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                            <div className="p-4 bg-[#6FD943] rounded-lg text-white">
                                <TbReport size={24} />
                            </div>
                            <div className="ml-3">
                                <h1 className="hidden md:block text-lg font-semibold mb-0">Report</h1>
                                <span className="text-sm text-gray-400 font-light">Monthly Leave Summary</span>
                            </div>
                        </div>
                        <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                            <div className="p-4 bg-[#6c757d] rounded-lg text-white">
                                <PiCalendarDotBold size={24} />
                            </div>
                            <div className="ml-3">
                                <h1 className="hidden md:block text-lg font-semibold mb-0">Duration</h1>
                                <span className="text-sm text-gray-400 font-light">{formattedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 m-4">
                        <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                            <div className="p-4 bg-[#6FD943] rounded-lg text-white">
                                <TbFileReport size={24} />
                            </div>
                            <div className="ml-3">
                                <h1 className="hidden md:block text-lg font-semibold mb-0">Attendance</h1>
                                <p className="text-xs text-gray-400 font-light">Total present: </p>
                                <p className="text-xs text-gray-400 font-light">Total leave: </p>
                            </div>
                        </div>
                        <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                            <div className="p-4 bg-[#6c757d] rounded-lg text-white">
                                <IoMdTime size={24} />
                            </div>
                            <div className="ml-3">
                                <h1 className="hidden md:block text-lg font-semibold mb-0">Overtime</h1>
                                <span className="text-xs text-gray-400 font-light">Total overtime in hours: </span>
                            </div>
                        </div>
                        <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                            <div className="p-4 bg-[#6FD943] rounded-lg text-white">
                               <MdOutlineReport size={24} />
                            </div>
                            <div className="ml-3">
                                <h1 className="hidden md:block text-lg font-semibold mb-0">Early leave</h1>
                                <span className="text-xs text-gray-400 font-light">Total early leave in hours: </span>
                            </div>
                        </div>
                        <div className="bg-white card-table rounded-2xl p-5 flex items-center">
                            <div className="p-4 bg-[#6FD943] rounded-lg text-white">
                                <RiTimerLine size={24} />
                            </div>
                            <div className="ml-3">
                                <h1 className="hidden md:block text-lg font-semibold mb-0">Employee late</h1>
                                <span className="text-xs text-gray-400 font-light">Total late in hours:</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl m-4 mt-0 card-table overflow-auto pt-5 pb-10">
                        <Table columns={columns} data={attendanceData} renderRow={renderRow} />
                    </div>
                </>
               
            )}
        </div>
    );
};

export default MonthlyAttendance;
