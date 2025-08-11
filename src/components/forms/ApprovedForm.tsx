"use client";

import { toast } from "sonner";
import Loading from "../ui/Loading";
import moment from "moment";
import { HiXMark } from "react-icons/hi2";
import Button from "../ui/Button";
import { IoCheckmarkDone } from "react-icons/io5";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { useEffect, useState } from "react";
import { createApprove } from "@/lib/api/leave";
import { getEmployeeName } from "@/lib/api/employee";

const ApprovedForm = ({
    type,
    data,
    onSuccess,
    onCancel,
}: {
    type: "manageLeave";
    data?: any;
    onSuccess?: (data?: any) => void; 
    onCancel?: () => void;
}) => {
    const [loading, setLoading] = useState(false);
    const [employeeName, setEmployeeName] = useState<string>("");
    const isoString = new Date().toISOString();
    const mysqlDatetime = isoString.replace('T', ' ').replace('Z', '');

    const handleApprove = async () => {
        setLoading(true);
        if (type === "manageLeave") { 
            try {
                const res = await createApprove({
                    leave_id: data.id,
                    status_id: 2,
                    approved_at: mysqlDatetime,
                });
                
                toast.success("Leave approved successfully!");
                if (onSuccess) {
                    onSuccess(res.result.data);
                } 
            } catch (err) {
                setLoading(false);
                toast.error("Approval failed!");
            }
        }
    };

    const handleReject = async () => {
        setLoading(true);
        if (type === "manageLeave") { 
            try {
                const res = await createApprove({
                    leave_id: data.id,
                    status_id: 3,
                    approved_at: mysqlDatetime,
                });
                toast.success("Leave rejected successfully!");

                if (onSuccess) {
                    onSuccess(res.result.data);
                } 
            } catch (err) {
                setLoading(false);
                toast.error("Rejection failed!");
            }
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const name = await getEmployeeName(data.employee_id);
            setEmployeeName(name);
        };

        loadData();
    }, [data.employee_id]);

    return (
        <form className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold text-gray-900">
                   Leave Action
                </h1>
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onCancel}
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
                        {data.leave_type.type_name}
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
                        {moment(data.start_date).format("MMM DD, YYYY")}
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="w-1/2 border-b pb-3">
                        <b>End Date</b>
                    </div>
                    <div className="w-1/2 text-start border-b pb-3">
                        {moment(data.end_date).format("MMM DD, YYYY")}
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
                        {data.status.status_name}
                    </div>
                </div>
            </div>

            {loading ? ( 
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 pr-6 pl-6 border-t"> 
                    <Loading /> 
                </div> 
            ) : ( 
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 pr-6 pl-6 border-t"> 
                    <Button type="button" onClick={onCancel} className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-[24px]" icon={<HiXMark size={18} />} label="Cancel" /> 
                    {data?.status?.status_name === "Pending" && (
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
    );
};

export default ApprovedForm;
