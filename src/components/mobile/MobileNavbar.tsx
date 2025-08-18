"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import Modal from "../Modal";
import { Spin, Tabs, TabsProps } from "antd";
import Link from "next/link";
import { getEmployeeById } from "@/lib/api/employee";
import Menu from "@/components/Menu";

type Employee = {
  name: string;
  email: string;
  image: string | null;
  position?: {
    title: string;
  };
};

const routeTitleMap: Record<string, string> = {
  home: "Home",
  menu: "Menu",
  profile: "Profile",
  // notification: 'Notifications',
  // settings: 'Settings',
  // dashboard: 'Dashboard',
  // mobile: 'Mobile',
};

interface MobileNavbarProps {
    toggleMenu: () => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ toggleMenu }) => {

  const pathname = usePathname();
  const title = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return routeTitleMap[last] || capitalize(last || "Home");
  }, [pathname]);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
      setEmployeeId(localStorage.getItem('employee_id'));
  }, []);
  
  //   notification
  const [isNotiModalOpen, setIsNotiModalOpen] = useState(false);
  const handleNotificationClick = () => {
    setIsNotiModalOpen(true);
  };
  const closeNotiModal = () => {
    setIsNotiModalOpen(false);
  };
  const onChange = (key: string) => {
    console.log(key);
  };
  useEffect(() => {
    // Define an async function inside the effect
    const fetchEmployeeData = async () => {
      setLoadingProfile(true);
      
      if (!employeeId) {
        console.error("No employee ID found in localStorage.");
        setLoadingProfile(false);
        return;
      }

      try {
        // Await the promise to get the response
        const response = await getEmployeeById(Number(employeeId));
        // Set the state with the actual data from the response
        if (response.data.result) {
          setEmployee(response.data.result.data);
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    // Call the async function
    fetchEmployeeData();
  }, []);

  const notificationList = [
    {
      id: 1,
      avatar: "/avatar.png",
      name: "Srey Mom",
      message: "approved your leave request.",
      time: "2 min ago",
    },
    {
      id: 2,
      avatar: "/avatar.png",
      name: "John Smith",
      message: "commented on your attendance.",
      time: "10 min ago",
    },
    // Add more notifications as needed
  ];
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "All",
      children: (
        <div className="space-y-4">
          {notificationList.map((noti) => (
            <div
              key={noti.id}
              className="flex  gap-3 bg-[#64B5F6] bg-opacity-15 p-3"
            >
              <img
                src={noti.avatar}
                alt={noti.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="font-semibold text-lg">{noti.name}</div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {noti.time}
                </div>
              </div>
              <div className="text-sm text-gray-600">{noti.message}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "2",
      label: "Attendance",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Leave",
      children: "Content of Tab Pane 3",
    },
    {
      key: "4",
      label: "Announce",
      children: "Content of Tab Pane 3",
    },
  ];

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="font-sans relative" >
      <header className="relative z-10 flex items-center justify-between p-4 bg-[#392648]">
        <button
                onClick={toggleMenu}
                className="p-2 text-white"
                aria-label="Open menu"
            >
                <HiOutlineMenuAlt2 className="w-6 h-6" />
            </button>
        <div className="relative p-2 text-white">
          <IoNotificationsOutline
            className="w-6 h-6"
            onClick={handleNotificationClick}
          />
          <span className="absolute top-0.5 right-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            2
          </span>
        </div>
      </header>
      {/* User Profile Card */}
      {pathname === "/dashboard/mobile/home" && (
        <div className="relative">
          {/* <img src="/banner.svg" className='w-full' alt="bannser" /> */}
          <div className="flex flex-col w-full bg-[url('/banner.svg')] h-[50%] md:h-[40%] xl:h-[50%] 2xl:h-[40%] bg-no-repeat bg-cover items-center justify-end pb-6 text-white">
            {loadingProfile ? (
              <Spin />
            ) : (
              <>
                <img
                  src={employee?.image || "/avatar.png"}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full border-white z-10 object-cover"
                />
                <p className="mt-2 text-base font-semibold z-10">
                  Good morning, {employee?.name || "User"}
                </p>
                <p className="text-sm opacity-80 z-10">
                  {employee?.position?.title || "Employee"}
                </p>
                <p className="text-sm underline mt-2 z-10">
                  <Link href="/dashboard/mobile/employee/profile">
                    View profile
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className={`fixed inset-y-0 z-40 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <img
            src={employee?.image || "/avatar.png"}
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="font-semibold">{employee?.name || "User"}</h2>
            <p className="text-sm text-gray-500">
              {employee?.position?.title || "Employee"}
            </p>
          </div>
        </div>

        {/* Reuse the Menu component */}
        {/* <div className="overflow-y-auto h-full" 
        >
          <Menu closeMenu={() => setIsMenuOpen(false)}/>
        </div> */}
      </div>

      {/* Overlay to close menu when clicked outside */}
      {isMenuOpen && (
        <div className="" onClick={() => setIsMenuOpen(false)}></div>
      )}
      <Modal
        isOpen={isNotiModalOpen}
        onClose={closeNotiModal}
        title="Notifications"
        className="px-4"
      >
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </Modal>
    </div>
  );
};

export default MobileNavbar;
