"use client";
import { useState } from "react";
import LeaveRequestAdmin from "@/components/LeaveRequestAdmin";
import { IoIosCheckboxOutline } from "react-icons/io";

const Report = () => {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const handleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
        Report
      </h1>
      <div className="bg-shadow p-4">
        <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
          Leave Requests
        </h1>
        <div className="flex gap-2 items-center">
          <IoIosCheckboxOutline className="text-2xl text-[#D1D5DB]" /> Select
          All
        </div>
        <LeaveRequestAdmin checkedIds={checkedIds} onCheck={handleCheck} />
      </div>
    </div>
  );
};

export default Report;
