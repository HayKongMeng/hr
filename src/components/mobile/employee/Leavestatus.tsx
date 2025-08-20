"use client";
import { useEffect, useState } from "react";
import { cn } from "../../../utils/utils";
import { ApproveLeave, createApprove, fetchLeaves } from "@/lib/api/leave";
import { toast } from "sonner";

type LeaveEntry = {
  id: number;
  start_date: string;
  end_date: string;
  status: {
    status_name: string;
  };
  leave_type: {
    type_name: string;
  };
};

interface LeaveStatusProps {
  leaveEntries?: LeaveEntry[];
  onRefresh?: () => void;
  showActions?: boolean;
}

const LeaveStatus = ({ 
  leaveEntries: propLeaveEntries, 
  onRefresh,
  showActions = true 
}: LeaveStatusProps) => {
  const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const companyId = localStorage.getItem('company_id');


  const fetchLeave: () => void = () => {
    fetchLeaves(1, 10).then((result) => {
      setLeaveEntries(result.data || []);
    });
  };

  useEffect(() => {
    // If props are provided, use them; otherwise fetch data
    if (propLeaveEntries) {
      setLeaveEntries(propLeaveEntries);
    } else {
      fetchLeave();
    }
  }, [propLeaveEntries]);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApprove = async () => {
    try {
      // const response = await ApproveLeave({
      //   leave_id: selectedIds[0],
      //   approved_at: "2025-05-27 10:30:00",
      //   company_id: Number(companyId),
      //   status: "Approved",
      // });
      
      // If onRefresh prop is provided, call it; otherwise fetch internally
      if (onRefresh) {
        onRefresh();
      } else {
        fetchLeave();
      }
      
      setSelectedIds([]);
      toast.success("Leave approved successfully");
    } catch (error) {
      toast.error("Failed to approve leave");
    }
  };

  const handleReject = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const formattedApprovedAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      // const response = await ApproveLeave({
      //   leave_id: selectedIds[0],
      //   approved_at: formattedApprovedAt,
      //   company_id: Number(companyId),
      //   status: "Rejected",
      // });
      
      // If onRefresh prop is provided, call it; otherwise fetch internally
      if (onRefresh) {
        onRefresh();
      } else {
        fetchLeave();
      }
      
      setSelectedIds([]);
      toast.success("Leave rejected successfully");
    } catch (error) {
      toast.error("Failed to reject leave");
    }
  };

  return (
    <div>
      {leaveEntries.length > 0 ? (
        <>
          {showActions && (
            <div className="flex gap-2 mb-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
                onClick={handleApprove}
                disabled={selectedIds.length === 0}
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                onClick={handleReject}
                disabled={selectedIds.length === 0}
              >
                Reject
              </button>
            </div>
          )}
          <div className="mt-[19px] space-y-3">
            {leaveEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#F8F9FA] rounded-lg py-1.5 px-0 flex items-center justify-between"
              >
                <div className="flex items-center gap-[11px]">
                  {/* Checkbox */}
                  {showActions && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entry.id)}
                      onChange={() => handleCheckboxChange(entry.id)}
                      className="accent-[#392648] w-4 h-4"
                    />
                  )}
                  {/* Status indicator bar */}
                  <div
                    className={cn(
                      "w-[5px] h-[52px] rounded-r-[20px] flex-shrink-0",
                      entry.status.status_name === "Pending"
                        ? "bg-[#EA580C]"
                        : entry.status.status_name === "Approved"
                        ? "bg-[#16A34A]"
                        : "bg-gray-400"
                    )}
                  />

                  {/* Date information */}
                  <div className="flex flex-col justify-start w-[169px]">
                    <div className="text-[#4E4E4E] text-sm font-medium tracking-[-0.14px] leading-none">
                      Date
                    </div>
                    <div className="text-[#141414] text-sm font-medium tracking-[-0.14px] leading-none mt-1.5">
                      {entry.start_date} - {entry.end_date}
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div
                  className={cn(
                    "mr-4 px-3.5 py-1 rounded text-xs font-bold text-center whitespace-nowrap min-w-[66px]",
                    entry.status.status_name === "Pending"
                      ? "bg-[#FFF2E2] text-[#EA580C]"
                      : entry.status.status_name === "Approved"
                      ? "bg-[#D6FFE3] text-[#16A34A]"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {entry.status.status_name}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <img src="/empty.svg" alt="No leave data" className="w-40 h-40" />
          <p className="text-gray-500 mt-4 text-sm font-satoshi">
            No leave data found
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaveStatus;