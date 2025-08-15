'use client';
import { checkIncheckOut } from "@/lib/api/attendances";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MarkedAttendance = () => {
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [attendanceId, setAttendanceId] = useState<number | null>(null);
    const [hasCheckedOut, setHasCheckedOut] = useState<boolean>(false);

    const employeeId = Number(localStorage.getItem("employeeId"));
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const savedDate = localStorage.getItem("attendanceDate");
        const savedId = localStorage.getItem("attendanceId");
        const savedCheckedOut = localStorage.getItem("checkedOut");

        // Only restore if date matches
        if (savedDate === today) {
            if (savedId) setAttendanceId(Number(savedId));
            if (savedCheckedOut === "true") setHasCheckedOut(true);
        } else {
            // New day: clear old attendance data
            localStorage.removeItem("attendanceId");
            localStorage.removeItem("attendanceDate");
            localStorage.removeItem("checkedOut");
            setAttendanceId(null);
            setHasCheckedOut(false);
        }
    }, []);

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
                const returnedId = data?.result?.data?.id;
                setAttendanceId(returnedId);
                localStorage.setItem("attendanceId", returnedId);
                localStorage.setItem("attendanceDate", today);
                toast.success(`✅ Check-${type} successful at ${time}`);
            } else if (type === 'out') {
                setHasCheckedOut(true);
                localStorage.setItem("checkedOut", "true");
            }

            setStatus(`✅ Check-${type} successful at ${time}`);
        } catch (error: any) {
            console.error(error);
            toast.success(`❌ Check-${type} failed: ${error?.response?.data?.message || error.message}`);
            setStatus(`❌ Check-${type} failed: ${error?.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderButtons = () => {
        if (!attendanceId && !hasCheckedOut) {
            return (
                <button
                    onClick={() => handleCheck("in")}
                    disabled={loading}
                    className="bg-[#6FD943] hover:bg-[#63db31] text-white font-normal text-sm py-2 px-6 rounded-lg"
                >
                    Clock In
                </button>
            );
        } else if (attendanceId && !hasCheckedOut) {
            return (
                <button
                    onClick={() => handleCheck("out")}
                    disabled={loading}
                    className="bg-pink-400 hover:bg-[#f161ac] text-white font-normal text-sm py-2 px-6 rounded-lg"
                >
                    Clock Out
                </button>
            );
        } else {
            return <p className="text-sm text-gray-500">✅ Attendance completed for today.</p>;
        }
    };

    return (
        <div className="bg-white">
            <div className="flex items-center mt-5">
                <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                    <h2 className="text-lg font-semibold">Mark Attendance</h2>
                </div>
            </div>
            <div className="px-4 py-4 mb-5">
                <p className="text-gray-600 mb-6 font-light text-sm">My Office Time: 09:00 to 18:00</p>
                <div className="flex justify-start gap-4">
                    {renderButtons()}
                </div>
                {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
            </div>
        </div>
    );
};

export default MarkedAttendance;
