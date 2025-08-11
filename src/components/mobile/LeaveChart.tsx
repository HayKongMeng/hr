// components/LeaveChart.js
"use client";
import { Legend } from "@headlessui/react";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
interface AttendanceData {
  presents: number;
  absents: number;
  leave: number;
}

interface AttendancePieChartProps {
  data: AttendanceData;
}

const COLORS = ["#2d5bff", "#93aafd", "#c6d2fd"];
const LeaveChart: React.FC<AttendancePieChartProps> = ({ data }) => {
  const pieData = [
    { name: "Presents", value: data.presents, color: "#2d5bff" },
    { name: "Absents", value: data.absents, color: "#93aafd" },
    { name: "Leave", value: data.leave, color: "#c6d2fd" },
  ];

  return (
    <div className="flex">
      <div className="w-full h-28">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={40}
              fill="#8884d8"
              label={false}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div className="space-y-5 text-sm pr-4 pl-4">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-[#344054] font-medium ">{item.name}</span>
              <span className="text-[#273240] text-lg font-bold ml-auto">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveChart;
