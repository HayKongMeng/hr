"use client";
import AttendanceCard from "@/components/mobile/employee/AttendanceCard";
import LeaveChart from "@/components/mobile/LeaveChart";
import { findEmployees } from "@/lib/api/attendances";
import { MappedAttendanceItem, processFullAttendanceData } from "@/lib/dateFormat";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";

const Attendance = () => {
  const [items, setItems] = useState<MappedAttendanceItem[]>([]);
  // State for chart data
  const [chartData, setChartData] = useState({
    presents: 0,
    absents: 0,
    leave: 0,
  });
  // State for summary statistics
  const [summaryStats, setSummaryStats] = useState({
    workingDays: 0,
    lateArrivals: 0,
    claims: 1,
  });

  useEffect(() => {
    findEmployees().then((result) => {
      const data = result.data || [];

      let presentsCount = 0;
      let lateCount = 0;
      let leaveCount = 0;
      const { mappedItems } = processFullAttendanceData(data);
      
      setChartData({
        presents: presentsCount,
        absents: 0,
        leave: leaveCount,
      });

      setSummaryStats({
        workingDays: presentsCount,
        lateArrivals: lateCount,
        claims: 1,
      });
      setItems(mappedItems);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <div className="">
        <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
          Attendance
        </h1>
      </div>
      <div className="bg-shadow">
        <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
          Overall performance
        </h1>
        <div className="w-full h-28 ">
          <LeaveChart data={chartData} />
        </div>
      </div>
      <div className="bg-white border border-[#EFF1F8] rounded-[10px] shadow-[0px_0.3px_0.9px_rgba(0,0,0,0.11),0px_1.6px_3.6px_rgba(0,0,0,0.132)] mt-5 p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Gender */}
          <div className="text-center">
            <div className="text-[12px] font-medium text-[#737391] font-satoshi">
              Working Days
            </div>
            <div className="text-[16px] font-bold text-[#344054] font-satoshi leading-[22px]">
              {summaryStats.workingDays}
            </div>
          </div>

          {/* Member Since */}
          <div className="text-center">
            <div className="text-[12px] font-medium text-[#737391] font-satoshi">
              Late arrival
            </div>
            <div className="text-[16px] font-bold text-[#344054] font-satoshi leading-[22px]">
              {summaryStats.lateArrivals}
            </div>
          </div>

          {/* Phone Number */}
          <div className="text-center">
            <div className="text-[12px] font-medium text-[#737391] font-satoshi pt-0.5">
              Claim
            </div>
            <div className="text-[16px] font-bold text-[#344054] font-satoshi leading-[22px]">
              1
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#EFF1F8] rounded-[10px] shadow-[0px_0.3px_0.9px_rgba(0,0,0,0.11),0px_1.6px_3.6px_rgba(0,0,0,0.132)] mt-5 p-4">
        <Calendar />
      </div>
      <div className="bg-shadow mb-10">
        <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
          Attendance
        </h1>
        {items.length > 0 ? (
          <AttendanceCard items={items} />
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <img
              src="/empty.svg"
              alt="No attendance data"
              className="w-40 h-40"
            />
            <p className="text-gray-500 mt-4 text-sm font-satoshi">
              No attendance data found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
