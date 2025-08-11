"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import Modal from "../Modal";
import { notification, Spin, Tabs, TabsProps } from "antd";
import Link from "next/link";
import { getEmployeeById } from "@/lib/api/employee";

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

const MobileNavbar = () => {
  const pathname = usePathname();
  const title = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return routeTitleMap[last] || capitalize(last || "Home");
  }, [pathname]);

    const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const name = localStorage.getItem("user_name") || "User";
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
    <div className="font-sans relative">
      <header className="relative z-10 flex items-center justify-between p-4 bg-[#392648]">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Open menu"
        >
          <HiOutlineMenuAlt2 className="w-6 h-6" />
        </button>
        {/* Notification Icon */}
        <div className="relative p-2 text-white">
          <IoNotificationsOutline
            className="w-6 h-6"
            onClick={handleNotificationClick}
          />
          {/* Notification Badge */}
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
            {loadingProfile ? <Spin /> : (
                <>
                    {/* CHANGE: Use dynamic employee data */}
                    <img
                        src={employee?.image || "/avatar.png"}
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full border-white z-10 object-cover"
                    />
                    <p className="mt-2 text-base font-semibold z-10">
                        Good morning, {employee?.name || "User"}
                    </p>
                    <p className="text-sm opacity-80 z-10">{employee?.position?.title || 'Employee'}</p>
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl font-bold">
            JS
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">John Smith</h2>
            <p className="text-sm text-gray-500">john.smith@example.com</p>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Home
              </a>
            </li>
            <li>
              <a
                href="/dashboard/mobile/employee/leave/leave-policies"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Leave Policies
              </a>
            </li>
            <li>
              <a
                href="/dashboard/mobile/employee/roles"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Roles
              </a>
            </li>
            <li>
              <a
                href="/dashboard/mobile/company"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Company
              </a>
            </li>
            <li>
              <a
                href="/dashboard/mobile/employee/leave/leave-holiday"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Holidays
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 13a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                My Attendance
              </a>
            </li>
            <li>
              <a
                href="/dashboard/mobile/report"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.3-.83-2.822.756-2.288 2.288a1.532 1.532 0 01-.947 2.285c-1.56.38-1.56 2.6 0 2.982a1.532 1.532 0 01.948 2.286c-.83 1.3.756 2.822 2.288 2.288a1.532 1.532 0 012.285.947c.38 1.56 2.6 1.56 2.982 0a1.532 1.532 0 012.286-.948c1.3.83 2.822-.756 2.288-2.288a1.532 1.532 0 01.947-2.285c1.56-.38 1.56-2.6 0-2.982a1.532 1.532 0 01-.948-2.286c.83-1.3-.756-2.822-2.288-2.288a1.532 1.532 0 01-2.285-.947zM10 11a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Report
              </a>
            </li>
            <li>
              <a
                href="/dashboard/mobile/timeshift"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.3-.83-2.822.756-2.288 2.288a1.532 1.532 0 01-.947 2.285c-1.56.38-1.56 2.6 0 2.982a1.532 1.532 0 01.948 2.286c-.83 1.3.756 2.822 2.288 2.288a1.532 1.532 0 012.285.947c.38 1.56 2.6 1.56 2.982 0a1.532 1.532 0 012.286-.948c1.3.83 2.822-.756 2.288-2.288a1.532 1.532 0 01.947-2.285c1.56-.38 1.56-2.6 0-2.982a1.532 1.532 0 01-.948-2.286c.83-1.3-.756-2.822-2.288-2.288a1.532 1.532 0 01-2.285-.947zM10 11a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Timeshift
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2V1a1 1 0 012 0v2h2V1a1 1 0 112 0v2h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Leave Requests
              </a>
            </li>
            {/* ... more menu items */}
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.3-.83-2.822.756-2.288 2.288a1.532 1.532 0 01-.947 2.285c-1.56.38-1.56 2.6 0 2.982a1.532 1.532 0 01.948 2.286c-.83 1.3.756 2.822 2.288 2.288a1.532 1.532 0 012.285.947c.38 1.56 2.6 1.56 2.982 0a1.532 1.532 0 012.286-.948c1.3.83 2.822-.756 2.288-2.288a1.532 1.532 0 01.947-2.285c1.56-.38 1.56-2.6 0-2.982a1.532 1.532 0 01-.948-2.286c.83-1.3-.756-2.822-2.288-2.288a1.532 1.532 0 01-2.285-.947zM10 11a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Settings
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Logout
              </a>
            </li>
          </ul>
        </nav>
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
