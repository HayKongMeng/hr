"use client";
import React, { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { toast } from "sonner";
import { IoCheckmarkDone } from "react-icons/io5";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import moment from "moment";
import { createApprove } from "@/lib/api/leave";
import { getEmployeeName } from "@/lib/api/employee";
import Loading from "./ui/Loading";
import Button from "./ui/Button";
import { useRouter } from "next/navigation";

interface EventData {
    id: any;
    employee: any;
    type: any;
    status: any;
    reason: any;
    applied_on: any;
    start: any;
    end: any;
}

interface LeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: EventData | null;
}

const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [employeeName, setEmployeeName] = useState<string>("");
    const isoString = new Date().toISOString();
    const mysqlDatetime = isoString.replace('T', ' ').replace('Z', '');

    const handleApprove = async () => {
        setLoading(true);
        try {
            const res = await createApprove({
                leave_id: data.id,
                status_id: 2,
                approved_at: mysqlDatetime,
            });
            toast.success("Leave approved successfully!");
            window.location.reload();
        } catch (err) {
            setLoading(false);
            toast.error("Approval failed!");
        }
    };
    const handleReject = async () => {
        setLoading(true);
        try {
            const res = await createApprove({
                leave_id: data.id,
                status_id: 3,
                approved_at: mysqlDatetime,
            });
            toast.success("Leave rejected successfully!");
            window.location.reload();
        } catch (err) {
            setLoading(false);
            toast.error("Rejection failed!");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const name = await getEmployeeName(data.employee);
            setEmployeeName(name); 
        };

        loadData();
    }, [data.employee]);
    

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
            <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white rounded-[24px] border shadow-lg transition-all duration-300 transform animate-modal-popin max-h-[90vh] overflow-y-auto">
                <form className="bg-white rounded-[24px] shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b p-6">
                        <h1 className="text-lg font-bold text-gray-900">
                            {data.type}
                        </h1>
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={onClose}
                            className="p-0.5 rounded-full bg-gray-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <HiXMark size={15} className="text-white" />
                        </button>
                    </div>
                    <div className="pr-6 pl-6 pt-6 space-y-6">
                        <div className="flex items-center">
                            <div className="w-1/2 border-b pb-3">
                                <b>Employee</b>
                            </div>
                            <div className="w-1/2 text-start border-b pb-3">
                                {employeeName}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 border-b pb-3">
                                <b>Leave Type</b>
                            </div>
                            <div className="w-1/2 text-start border-b pb-3">
                                {data.type}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 border-b pb-3">
                                <b>Appplied On</b>
                            </div>
                            <div className="w-1/2 text-start border-b pb-3">
                                {moment(data.applied_on).format("MMM DD, YYYY")}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 border-b pb-3">
                                <b>Start Date</b>
                            </div>
                            <div className="w-1/2 text-start border-b pb-3">
                                {moment(data.start).format("MMM DD, YYYY")}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 border-b pb-3">
                                <b>End Date</b>
                            </div>
                            <div className="w-1/2 text-start border-b pb-3">
                                {moment(data.end).format("MMM DD, YYYY")}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 border-b pb-3">
                                <b>Leave Reason</b>
                            </div>
                            <div className="w-1/2 text-start border-b pb-3">
                                {data.reason ? data.reason : "-"}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1/2 border-b pb-3">
                                <b>Status</b>
                            </div>
                            <div className="w-1/2 text-start border-b pb-3">
                                {data.status}
                            </div>
                        </div>
                    </div>
                    {loading ? ( 
                        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 pr-6 pl-6 border-t"> 
                            <Loading /> 
                        </div> 
                    ) : ( 
                        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 pr-6 pl-6 border-t"> 
                            <Button type="button" onClick={onClose} className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-[24px]" icon={<HiXMark size={18} />} label="Cancel" /> 
                            {data?.status === "Pending" && (
                                <>
                                    <Button
                                        type="button"
                                        onClick={handleApprove}
                                        className="inline-flex items-center px-4 py-2 bg-[#6fd943] border border-[#6fd943] text-sm font-semibold text-white hover:bg-[#48a522] rounded-[24px]"
                                        icon={<IoCheckmarkDone size={18} />}
                                        label="Approved"
                                    /> 
                                    <Button
                                        type="button"
                                        onClick={handleReject}
                                        className="inline-flex items-center px-4 py-2 bg-[#ff3a6e] border border-[#ff3a6e] text-sm font-semibold text-white hover:bg-[#db1e50] rounded-[24px]"
                                        icon={<MdOutlineKeyboardDoubleArrowLeft size={18} />}
                                        label="Reject"
                                    />
                                </>
                            )}
                        </div> 
                    )}
                </form>
            </div>
        </div>
    );
};

export default LeaveModal;
