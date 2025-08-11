'use client';

import MenuItem from '@/components/mobile/MenuItem';
import {
    FaCalendarAlt,
    FaUmbrellaBeach,
    FaFileInvoiceDollar,
    FaRegPaperPlane,
    FaMoneyBillWave,
    FaTasks,
    FaUsers,
    FaChartBar,
    FaFileContract,
    FaSignOutAlt,
} from 'react-icons/fa';

const Menu = () => {
    const handleMenuItemClick = (label: string) => {
        alert(`Clicked on: ${label}`);
    };

    const handleExitApp = (label: string) => {
        alert(`Clicked on: ${label}`);
    };

    return (
        <div className="min-h-screen w-full absolute -mt-[27px] z-20 bg-white rounded-t-[15px] overflow-y-auto max-h-[calc(100vh-62px)] border">
            <main className="p-4 pt-6 space-y-6 relative z-20 pb-52">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
                    <MenuItem
                        Icon={FaCalendarAlt}
                        label="Attendance"
                        onClick={() => handleMenuItemClick("Attendance")}
                    />
                    <MenuItem
                        Icon={FaUmbrellaBeach}
                        label="Leave"
                        onClick={() => handleMenuItemClick("Leave")}
                    />
                    <MenuItem
                        Icon={FaFileInvoiceDollar} // Changed for TDS
                        label="TDS"
                        onClick={() => handleMenuItemClick("TDS")}
                    />

                    <MenuItem
                        Icon={FaRegPaperPlane} 
                        label="Post Request"
                        onClick={() => handleMenuItemClick("Post Request")}
                    />
                    <MenuItem
                        Icon={FaMoneyBillWave}
                        label="Loan Apply"
                        onClick={() => handleMenuItemClick("Loan Apply")}
                    />
                    <MenuItem
                        Icon={FaTasks}
                        label="Task"
                        onClick={() => handleMenuItemClick("Task")}
                    />

           
                    <MenuItem
                        Icon={FaUsers} 
                        label="Visitor"
                        onClick={() => handleMenuItemClick("Visitor")}
                    />
                    <MenuItem
                        Icon={FaChartBar} 
                        label="Reports"
                        onClick={() => handleMenuItemClick("Reports")}
                    />
                    <MenuItem
                        Icon={FaFileContract}
                        label="Claim"
                        onClick={() => handleMenuItemClick("Claim")}
                    />
                    <MenuItem
                        Icon={FaSignOutAlt}
                        label=" Exit App"
                        onClick={() => handleExitApp("Exit App")}
                    />
                </div>
            </main>
        </div>
    );
}

export default Menu;