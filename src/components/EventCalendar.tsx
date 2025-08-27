"use client";

import Image from "next/image";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {UpcomingBirthday} from "@/lib/api/company";
import moment from "moment";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

// TEMPORARY
const events = [
    {
        id: 1,
        title: "Lorem ipsum dolor",
        time: "12:00 PM - 2:00 PM",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
        id: 2,
        title: "Lorem ipsum dolor",
        time: "12:00 PM - 2:00 PM",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
        id: 3,
        title: "Lorem ipsum dolor",
        time: "12:00 PM - 2:00 PM",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
];

const EventCalendar = ({ birthdays }: { birthdays: UpcomingBirthday[] }) => {
    const [value, onChange] = useState<Value>(new Date());

    return (
        <div className="bg-light-card border border-light-border shadow-sm p-4 rounded-xl">
            <Calendar onChange={onChange} value={value} />
            <div className="flex items-center justify-between mt-4">
                <h1 className="text-xl font-semibold text-text-primary">Up Comming birthday</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            <div className="flex flex-col gap-4 mt-4">
                {birthdays.length > 0 ? birthdays.map((birthday) => (
                    <div
                        className="p-4 rounded-lg border border-light-border"
                        key={birthday.id}
                    >
                        <div className="flex items-center justify-between">
                            <h1 className="font-semibold text-gray-700">{birthday.name}</h1>
                            <span className="text-gray-400 text-sm font-medium">
                                {moment(birthday.date_of_birth).format("MMMM Do")}
                            </span>
                        </div>
                        <p className="mt-1 text-gray-500 text-sm">Turning {birthday.age} this year!</p>
                    </div>
                )) : (
                    <p className="text-text-secondary text-center py-4">No upcoming birthdays.</p>
                )}
            </div>
        </div>
    );
};

export default EventCalendar;