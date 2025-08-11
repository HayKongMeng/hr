'use client';

import { checkIncheckOut } from "@/lib/api/attendances";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HiOutlineQrCode } from "react-icons/hi2";

const CheckInCheckOut = () => {
    const [currentTime, setCurrentTime] = useState('00:00:00');
    const [currentDate, setCurrentDate] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [attendanceId, setAttendanceId] = useState<number | null>(null);
    const [hasCheckedOut, setHasCheckedOut] = useState<boolean>(false);
    const [isReady, setIsReady] = useState(false);

    const employeeIdStr = localStorage.getItem("employee_id");
    const employeeId = employeeIdStr !== null && !isNaN(Number(employeeIdStr))
        ? Number(employeeIdStr)
        : null;

    if (employeeId === null) {
        // toast.error("Employee ID is missing or invalid.");
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    // Live clock update
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Format and set current date
    useEffect(() => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        };
        const formattedDate = today.toLocaleDateString('en-US', options);
        setCurrentDate(formattedDate);
    }, []);

    // Restore localStorage state
    useEffect(() => {
        const init = () => {
            const savedDate = localStorage.getItem(`attendanceDate-${employeeId}`);
            const savedId = localStorage.getItem(`attendanceId-${employeeId}`);
            const savedCheckedOut = localStorage.getItem(`checkedOut-${employeeId}`);
            // const savedDate = localStorage.getItem("attendanceDate");
            // const savedId = localStorage.getItem("attendanceId");
            // const savedCheckedOut = localStorage.getItem("checkedOut");

            if (savedDate === today) {
                if (savedId) setAttendanceId(Number(savedId));
                if (savedCheckedOut === "true") setHasCheckedOut(true);
            } else {
                localStorage.removeItem(`attendanceId-${employeeId}`);
                localStorage.removeItem(`attendanceDate-${employeeId}`);
                localStorage.removeItem(`checkedOut-${employeeId}`);
                setAttendanceId(null);
                setHasCheckedOut(false);
                // localStorage.removeItem("attendanceId");
                // localStorage.removeItem("attendanceDate");
                // localStorage.removeItem("checkedOut");
                // setAttendanceId(null);
                // setHasCheckedOut(false);
            }

            setIsReady(true);
        };

        init();
    }, [employeeId]);

    const getCurrentTime = (): string => {
        return new Date().toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleCheck = async (type: 'in' | 'out') => {
        if (loading) return;
        setLoading(true);

        const time = getCurrentTime();

        try {
            const data = await checkIncheckOut(
                employeeId,
                today,
                type,
                time,
                type === 'out' && attendanceId ? attendanceId : undefined
            );

            if (type === 'in') {
                // const returnedId = data?.result?.data?.id;
                // setAttendanceId(returnedId);
                // localStorage.setItem("attendanceId", returnedId);
                // localStorage.setItem("attendanceDate", today);
                // toast.success(`✅ Check-${type} successful at ${time}`);
                const returnedId = data?.result?.data?.id;
                setAttendanceId(returnedId);
                localStorage.setItem(`attendanceId-${employeeId}`, returnedId);
                localStorage.setItem(`attendanceDate-${employeeId}`, today);
                toast.success(`✅ Check-${type} successful at ${time}`);
            } else if (type === 'out') {
                setHasCheckedOut(true);
                localStorage.setItem(`checkedOut-${employeeId}`, "true");
                toast.success(`✅ Check-${type} successful at ${time}`);
                // setHasCheckedOut(true);
                // localStorage.setItem("checkedOut", "true");
                // toast.success(`✅ Check-${type} successful at ${time}`);
            }

            setStatus(`✅ Check-${type} successful at ${time}`);
        } catch (error: any) {
            console.error(error);
            toast.error(`❌ Check-${type} failed: ${error?.response?.data?.message || error.message}`);
            setStatus(`❌ Check-${type} failed: ${error?.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Show loader while preparing state
    if (!isReady) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-sm">Loading attendance data...</p>
            </div>
        );
    }

    return (
        <div className="p-8 rounded-[24px] bshadow">
            {/* <div className="bg-white shadow-lg rounded-lg p-4 mx-4 -mt-8 relative z-10"> */}
                <div className="flex justify-between mb-4">
                    <div>
                        <p className="text-xs font-light pb-4 text-gray-700">Date</p>
                        <p className="font-normal text-black">Jul 15, 2025</p>
                    </div>
                    <div>
                        <p className="text-xs font-light pb-4 text-gray-700">Time</p>
                        <p className="font-normal text-black">8:00 am - 5:30 pm</p>
                    </div>
                </div>
                <button className="bg-[#392648] text-white py-3 rounded-full w-full flex items-center justify-center space-x-2">
                    {/* Icon here */}
                    <HiOutlineQrCode />
                    <span>Check in</span>
                </button>
            {/* </div> */}
            {/* <div className='bg-white p-4 bg-gradient-to-b from-teal-400 to-green-500 rounded-t-xl'>
                <p className="text-sm text-white font-semibold">{currentDate}</p>
            </div>

            <div className='p-4'>
                <p className="text-base text-center font-normal text-gray-500">
                    Shift timing 8:00AM to 5:30 PM
                </p>
                <p className="text-2xl font-bold text-center text-gray-900">
                    {currentTime} <span className="text-xl">Hrs</span>
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                 
                    {!attendanceId && !hasCheckedOut && (
                        <div className='col-span-2 border flex justify-center items-center p-4 rounded-lg'>
                            <div>
                                <span className="text-sm block">08:00 AM</span>
                                <button
                                    onClick={() => handleCheck('in')}
                                    className="mt-2 bg-green-500 text-white py-1 px-3 rounded-xl font-semibold shadow-md hover:bg-green-600 transition-colors"
                                    disabled={loading}
                                >
                                    <span className="text-xs block">
                                        {loading ? 'Processing...' : 'Clock In'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    
                    {attendanceId && !hasCheckedOut && (
                        <div className='col-span-2 border flex justify-center items-center p-4 rounded-lg'>
                            <div>
                                <span className="text-sm block">07:00 PM</span>
                                <button
                                    onClick={() => handleCheck('out')}
                                    className="mt-2 bg-red-500 text-white py-1 px-3 rounded-xl font-semibold shadow-md hover:bg-red-600 transition-colors"
                                    disabled={loading}
                                >
                                    <span className="text-xs block">
                                        {loading ? 'Processing...' : 'Clock Out'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                   
                    {attendanceId && hasCheckedOut && (
                        <div className="col-span-2 text-center text-sm text-gray-500">
                            ✅ Attendance completed for today.
                        </div>
                    )}
                </div>

                
                {status && (
                    <div className="mt-4 text-center text-sm text-blue-500">
                        {status}
                    </div>
                )}
            </div> */}
        </div>
    );
};

export default CheckInCheckOut;
