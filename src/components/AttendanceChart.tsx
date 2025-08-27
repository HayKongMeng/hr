"use client";
import Image from "next/image";
import {
    BarChart,
    Bar,
    Rectangle,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {WeeklySummary} from "@/lib/api/company";


const AttendanceChart = ({ weeklyData }: { weeklyData: WeeklySummary }) => {
    const data = Object.keys(weeklyData).map(day => ({
        name: day,
        present: weeklyData[day].present,
        absent: weeklyData[day].absent,
        leave: weeklyData[day].leaves,
    }));

    return (
        <div className="bg-light-card border border-light-border rounded-xl shadow-sm p-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold text-text-primary">Attendance</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            <div className="flex-grow mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEBF1" />
                        <XAxis dataKey="name" axisLine={false} tick={{ fill: "#718096" }} tickLine={false} />
                        <YAxis axisLine={false} tick={{ fill: "#718096" }} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(234, 235, 241, 0.5)' }} // Light grey hover
                            contentStyle={{
                                background: '#FFFFFF',
                                border: '1px solid #EAEBF1',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Legend
                            align="left" verticalAlign="top"
                            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
                            iconType="circle"
                        />
                        <Bar dataKey="present" fill="#FAE27C" legendType="circle" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="absent" fill="#4A3AFF" legendType="circle" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AttendanceChart;