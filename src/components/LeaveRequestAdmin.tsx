"use client"
import { cn } from "@/utils/utils";
import React from "react";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";
import { MdCheckBoxOutlineBlank } from "react-icons/md";

type LeaveEntry = {
  id: string;
  dateRange: string;
  status: string;
};

type LeaveEntryProps = {
  checkedIds: string[];
  onCheck: (id: string) => void;
};

const LeaveRequestAdmin: React.FC<LeaveEntryProps> = ({
  checkedIds,
  onCheck,
}) => {
  const leaveEntries = [
    {
      id: "1",
      dateRange: "Jul 15, 2025 - Jul 20, 2025",
      status: "pending",
    },
  ];
  return (
    <div>
      <div className="">
        {/* Leave entries */}
        <div className="mt-[19px] space-y-3">
          {leaveEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#F8F9FA] rounded-lg py-1.5 px-0 flex items-center justify-between"
            >
              <div className="flex items-center gap-[11px]">
                {/* Status indicator bar */}
                <div
                  className={cn(
                    "w-[5px] h-[52px] rounded-r-[20px] flex-shrink-0",
                    entry.status === "pending" ? "bg-[#EA580C]" : "bg-[#16A34A]"
                  )}
                />

                {/* Date information */}
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="text-[#4E4E4E] text-sm font-medium tracking-[-0.14px] leading-none">
                      Staff
                    </div>
                    <div className="text-[#141414] text-sm font-medium tracking-[-0.14px] leading-none mt-1.5">
                      Brak sa mouen
                    </div>
                  </div>
                  <div>
                    <div className="text-[#4E4E4E] text-sm font-medium tracking-[-0.14px] leading-none">
                      Department
                    </div>
                    <div className="text-[#141414] text-sm font-medium tracking-[-0.14px] leading-none mt-1.5">
                      IT
                    </div>
                  </div>
                  <div>
                    <div className="text-[#4E4E4E] text-sm font-medium tracking-[-0.14px] leading-none">
                      Date
                    </div>
                    <div className="text-[#141414] text-sm font-medium tracking-[-0.14px] leading-none mt-1.5">
                      {entry.dateRange}
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => onCheck(entry.id)}
                      className="focus:outline-none"
                    >
                      {checkedIds.includes(entry.id) ? (
                        <IoIosCheckbox className="text-2xl text-[#392648]" />
                      ) : (
                        <MdCheckBoxOutlineBlank className="text-2xl text-[#D1D5DB]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestAdmin;
