"use client";
import { MdKeyboardArrowRight } from "react-icons/md";
import { BsSortDown } from "react-icons/bs";
import HolidayCalendar from "@/components/HolidayCalendar";
import { useRouter } from "next/navigation";

const CalenderListPage = () => {
    const router = useRouter();
    const goBack = () => {
        router.push("/dashboard/list/dashboard/admin");
    };
    return (
        <div>
            <div className="flex items-center justify-between m-4">
                <div>
                    <h1 className="hidden md:block text-lg font-semibold mb-0">Manage Holiday</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                            onClick={goBack}
                            className="hover:underline cursor-pointer text-blue-600 font-light"
                        >
                            Home
                        </span>
                        <MdKeyboardArrowRight />
                        <span className="text-gray-700 font-light">Holidays List</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end m-4 mb-0">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-kungkeaYellow">
                        <BsSortDown className="text-white font-semibold" />
                    </button>
                    {/* <FormModal
                        table="Holiday"
                        type="create"
                        onSuccess={handleHolidaySuccess}
                    /> */}
                </div>
            </div>
            <HolidayCalendar />
        </div>
      
    );
}

export default CalenderListPage;