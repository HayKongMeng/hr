"use client";
import React, { useCallback, useEffect, useState } from "react";
import LeaveStatus from "@/components/mobile/employee/Leavestatus";
import AttendanceCard from "@/components/mobile/employee/AttendanceCard";
import OverviewHr from "@/components/mobile/employee/OverviewHr";
import ButtonCustom from "@/components/ui/Button";
import { LuQrCode } from "react-icons/lu";
import QrCodeModal from "@/components/QrCodeModal";
import { Flex, Input, message, Radio, Space, Spin, Tag } from "antd";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { PiSealCheck } from "react-icons/pi";
import { IoIosCheckboxOutline } from "react-icons/io";
import LeaveRequestAdmin from "@/components/LeaveRequestAdmin";
import { CiEdit, CiSearch } from "react-icons/ci";
import Modal from "@/components/Modal";
import TextArea from "antd/es/input/TextArea";
import FileUpload from "@/components/FileUpload";
import ChipInput from "@/components/ChipInput";
import AnnoucementCard from "@/components/card/AnnoucementCard";
import { checkInAndOut, findEmployees, findEmployeesById } from "@/lib/api/attendances";
import { formattedDate, MappedAttendanceItem, processFullAttendanceData } from "@/lib/dateFormat";
import { getEmployeeById } from "@/lib/api/employee";
import Link from "next/link";

type Employee = {
  name: string;
  email: string;
  image: string | null;
  position?: {
    title: string;
  };
};

const HomePage = () => {
  formattedDate;
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  // const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [items, setItems] = useState<MappedAttendanceItem[]>([]);
  const [todayAttendance, setTodayAttendance] = useState({
    checkIn: "--:--",
    checkInStatus: "-",
    checkOut: "--:--",
    checkOutStatus: "-",
  });

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

    const [employeeId, setEmployeeId] = useState<number | null>(null);
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
  useEffect(() => {
    setIsClient(true);
    const storeEmployeeId = localStorage.getItem('employee_id');
    if (storeEmployeeId) {
        setEmployeeId(Number(storeEmployeeId));
    }
  }, []);

  const checkStatus = getTodayCheckStatus(items);
  // Function to calculate remaining time from check-in timestamp
  const calculateRemainingTime = useCallback((checkInTime: string) => {
    if (!checkInTime || checkInTime === "--:--" || checkInTime === "-") {
      return 0;
    }

    try {
      // Parse the check-in time and create a timestamp for today
      const today = new Date();
      const [time, period] = checkInTime.split(" ");
      const [hours, minutes] = time.split(":");
      
      let hour24 = parseInt(hours);
      if (period?.toLowerCase() === "pm" && hour24 !== 12) {
        hour24 += 12;
      } else if (period?.toLowerCase() === "am" && hour24 === 12) {
        hour24 = 0;
      }

      const checkInDateTime = new Date(today);
      checkInDateTime.setHours(hour24, parseInt(minutes), 0, 0);
      
      // Add 1 minute to check-in time
      const enableTime = new Date(checkInDateTime.getTime() + 60 * 1000);
      const now = new Date();
      
      const remainingMs = enableTime.getTime() - now.getTime();
      
      // Return remaining seconds, minimum 0
      return Math.max(0, Math.floor(remainingMs / 1000));
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return 0;
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (checkStatus === "checkedIn" && timeRemaining > 0) {
      setIsTimerActive(true);
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsTimerActive(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [checkStatus, timeRemaining]);

  // Update timer when attendance data changes
  useEffect(() => {
    if (checkStatus === "checkedIn" && todayAttendance.checkIn) {
      const remaining = calculateRemainingTime(todayAttendance.checkIn);
      setTimeRemaining(remaining);
    } else {
      setTimeRemaining(0);
      setIsTimerActive(false);
    }
  }, [todayAttendance.checkIn, checkStatus, calculateRemainingTime]);


  useEffect(() => {
    if (employeeId === null) {
        return;
    }
    
    findEmployeesById(employeeId).then((result) => {
      const data = result.data || [];
      const { mappedItems, todayDetails } = processFullAttendanceData(data);

      setItems(mappedItems);
      setTodayAttendance(todayDetails);
    });
  }, []);

   function getTodayCheckStatus(items: MappedAttendanceItem[]) {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    
    const todayEntry = items.find((item: any) => item.dateRange === today);

    if (todayEntry) {
      // If checked in but not checked out
      if (
        todayEntry.checkIn &&
        todayEntry.checkIn !== "-" &&
        todayEntry.checkIn !== "--:--" &&
        (!todayEntry.checkOut || todayEntry.checkOut === "-" || todayEntry.checkOut === "--:--")
      ) {
        return "checkedIn";
      }
      // If not checked in
      if (!todayEntry.checkIn || todayEntry.checkIn === "-" || todayEntry.checkIn === "--:--") {
        return "notCheckedIn";
      }
      // If checked in and checked out
      if (
        todayEntry.checkIn &&
        todayEntry.checkIn !== "-" &&
        todayEntry.checkIn !== "--:--" &&
        todayEntry.checkOut &&
        todayEntry.checkOut !== "-" &&
        todayEntry.checkOut !== "--:--"
      ) {
        return "checkedOut";
      }
    }
    return "notCheckedIn";
  }

  const handleQrScan = async (scan_code: string) => {
    setButtonLoading(true);
    try {
      // Get public IP
      const ipRes = await fetch("https://api.ipify.org/?format=json");
      const ipData = await ipRes.json();
      const ip = ipData.ip;

      // Optionally, get geolocation (latitude, longitude)
      let latitude = 0;
      let longitude = 0;
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log("latitude:", pos.coords.latitude);
              console.log("longitude:", pos.coords.longitude);
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }

      // Determine type based on current status
      const type = checkStatus === "checkedIn" ? "checkout" : "checkin";
      if (employeeId === null) {
        message.error("Employee ID not found.");
        return;
    }
      const res = await checkInAndOut({
        employee_id: employeeId,
        type,
        latitude,
        longitude,
        scan_code,
        ip,
      });

      if (res.success) {
        setIsQrModalOpen(false);
        message.success(
          type === "checkin" ? "Check-in successful!" : "Check-out successful!"
        );
      if (employeeId === null) {
        return;
      }
        // Refresh the attendance data
        findEmployeesById(employeeId).then((result) => {
          const data = result.data || [];
          const { mappedItems, todayDetails } = processFullAttendanceData(data);
          setItems(mappedItems);
          setTodayAttendance(todayDetails);
        });
      } else {
        message.error("Check-in/Check-out failed. Please try again.");
      }
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";
    
    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err?.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    message.error(errorMessage);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleCheckInClick = () => {
    setIsQrModalOpen(true);
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
  };

  // radio group
  const [selectedOption, setSelectedOption] = useState("MySpace");
  const options: CheckboxGroupProps<string>["options"] = [
    { label: "My space", value: "MySpace" },
    { label: "Organization", value: "Organization" },
    { label: "Annoucement", value: "Annoucement" },
  ];
  const attendanceItems = [
    {
      id: "1",
      dateRange: "Jul 15, 2025 - Jul 20, 2025",
      status: "late",
      checkIn: "8:27 am",
      checkOut: "5:35 pm",
    },
    {
      id: "2",
      dateRange: "Jul 21, 2025 - Jul 22, 2025",
      status: "on time",
      checkIn: "8:00 am",
      checkOut: "5:30 pm",
    },
  ];
  const [itemsEmployee, setItemsEmployee] = useState<MappedAttendanceItem[]>([]);
  const [employeeAttendance, setEmployeeAttendance] = useState({
    checkIn: "--:--",
    checkInStatus: "-",
    checkOut: "--:--",
    checkOutStatus: "-",
  });

  useEffect(() => {
    findEmployees().then((result) => {
      const data = result.data || [];
      const { mappedItems, todayDetails } = processFullAttendanceData(data);

      setItemsEmployee(mappedItems);
      setEmployeeAttendance(todayDetails);
    });
  }, []);

  // leave request from user
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const handleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  //post annoucement
  const [isAnnoucementModalOpen, setIsAnnoucementModalOpen] = useState(false);
  const handleAnnoucementClick = () => {
    setIsAnnoucementModalOpen(true);
  };

  const closeAnnoucementModal = () => {
    setIsAnnoucementModalOpen(false);
  };
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log("Change:", e.target.value);
  };

  // Format remaining time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonConfig = () => {
    switch (checkStatus) {
      case "checkedIn":
        if (isTimerActive && timeRemaining > 0) {
          return {
            label: `Check out (${formatTime(timeRemaining)})`,
            className: "primary-button bg-gray-400 text-white cursor-not-allowed",
            iconColor: "#6B7280",
            disabled: true
          };
        }
        return {
          label: "Check out",
          className: "primary-button bg-[#D27E4B] text-white",
          iconColor: "#D27E4B",
          disabled: false
        };
      case "checkedOut":
        return {
          label: "Already checked out",
          className: "primary-button bg-gray-400 text-white cursor-not-allowed",
          iconColor: "#6B7280",
          disabled: true
        };
      default:
        return {
          label: "Check in",
          className: "primary-button",
          iconColor: undefined,
          disabled: false
        };
    }
  };

  const buttonConfig = getButtonConfig();

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto max-h-[calc(100vh-62px)] pb-20">
      <main className="relative z-20 ">
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
        <div>
          <Flex vertical gap="middle">
            <Radio.Group
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="bg-shadow border-none flex justify-between"
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button
                value="MySpace"
                className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
              >
                My space
              </Radio.Button>
              <Radio.Button
                value="Organization"
                className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
              >
                Organization
              </Radio.Button>
              <Radio.Button
                value="Annoucement"
                className="!rounded-full !border-none text-black
                "
              >
                Annoucement
              </Radio.Button>
            </Radio.Group>
          </Flex>
        </div>
        {selectedOption === "MySpace" && (
          <>
            <div className="bg-shadow gap-4 flex flex-col p-4">
              <div className="flex justify-between items-center ">
                <div>
                  <h1>Date</h1>
                  <span>{formattedDate}</span>
                </div>
                <div>
                  <h1>Time</h1>
                  <span>8:00 am - 5:30 pm</span>
                </div>
              </div>

              <ButtonCustom
                label={buttonConfig.label}
                className={buttonConfig.className}
                type="submit"
                // disabled={buttonConfig.disabled || buttonLoading}
                icon={
                  <LuQrCode
                    color={buttonConfig.iconColor}
                  />
                }
                onClick={buttonConfig.disabled ? undefined : handleCheckInClick}
              />
            </div>
            {/* <CheckInCheckOut /> */}
            <OverviewHr
              data={{ presents: 30, absents: 20, leave: 5 }}
              todayAttendance={todayAttendance}
            />
            <div className="bg-shadow p-4 mt-4">
              <div className="flex items-center justify-between mb-[19px]">
                <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                  Attendance
                </h2>
                <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                  View more
                </button>
              </div>
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
            <div className="bg-shadow">
              <div className="flex items-center justify-between mb-[19px]">
                <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                  Leave Status
                </h2>
                <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                  View more
                </button>
              </div>
              <LeaveStatus showActions={false}/>
            </div>
          </>
        )}
        {selectedOption === "Organization" && (
          <>
            <div className="bg-shadow p-4">
              <h2 className="text-[20px] font-medium text-black mb-4">
                Overview
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-[#392648] rounded-3xl p-4 h-28">
                    <div className="flex items-center gap-2 mb-3 text-white">
                      <div className="w-6 h-6 flex-shrink-0">
                        <PiSealCheck className="w-6 h-6 mr-2" />
                      </div>
                      <span className="text-[#dedede] text-sm font-medium">
                        Late Arrival
                      </span>
                    </div>
                    <div>
                      <div className="text-white text-base font-normal">
                        1 staff
                      </div>
                      <div className="text-[#dedede] text-xs font-normal mt-1">
                        Manage
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#392648] rounded-3xl p-4 h-28">
                    <div className="flex items-center gap-2 mb-3 text-white">
                      <div className="w-6 h-6 flex-shrink-0">
                        <PiSealCheck className="w-6 h-6 mr-2" />
                      </div>
                      <span className="text-[#dedede] text-sm font-medium">
                        Check in at
                      </span>
                    </div>
                    <div>
                      <div className="text-white text-base font-normal">
                        1 staff
                      </div>
                      <div className="text-[#dedede] text-xs font-normal mt-1">
                        Manage
                      </div>
                    </div>
                  </div>
                </div>
              </h2>
            </div>
            <div className="bg-shadow p-4 mt-4">
              <div className="flex items-center justify-between mb-[19px]">
                <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                  Attendance
                </h2>
                <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                  View more
                </button>
              </div>
              {itemsEmployee.length > 0 ? (
                <AttendanceCard items={itemsEmployee} />
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
            <div className="bg-shadow p-4 mt-4">
              <div className="flex items-center justify-between mb-[19px]">
                <h2 className="text-[20px] font-medium text-black leading-[0.85] tracking-[-0.5px]">
                  Leave Requests
                </h2>
                <button className="text-[#2471e7] text-[12px] leading-[1.42] hover:underline">
                  View more
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <IoIosCheckboxOutline className="text-2xl text-[#D1D5DB]" />{" "}
                Select All
              </div>
              <LeaveRequestAdmin
                checkedIds={checkedIds}
                onCheck={handleCheck}
              />
            </div>
          </>
        )}{" "}
        {selectedOption === "Annoucement" && (
          <>
            <div className="bg-shadow">
              <ButtonCustom
                label="Post Announcement"
                className="bg-shadow mb-4"
                type="submit"
                onClick={handleAnnoucementClick}
                icon={<CiEdit />}
                disabled={false}
                loading={false}
              >
              </ButtonCustom>
              <div className="">
                <Input
                  className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                  placeholder="Search..."
                  prefix={<CiSearch className="text-[#364663] text-xl" />}
                ></Input>
              </div>
              <div>
                <AnnoucementCard />
              </div>
            </div>
          </>
        )}
      </main>
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScan={handleQrScan}
      />
      <Modal
        isOpen={isAnnoucementModalOpen}
        onClose={closeAnnoucementModal}
        title="Post Announcement"
        className="px-4"
      >
        <div className="bg-shadow p-4">
          <div className="">
            <label htmlFor="leave-type">Title</label>
            <Input
              className="mt-4 !stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
              placeholder="Enter your title..."
            ></Input>
          </div>
          <div className=" mt-4">
            <label htmlFor="leave-type">Message</label>
            <TextArea
              className="mt-4  
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
              showCount
              maxLength={100}
              onChange={onChange}
              placeholder="Give as your reason for leave..."
            />
          </div>

          <div className=" mt-4 flex flex-col">
            <label htmlFor="leave-type">Attachments</label>
            <FileUpload />
          </div>
          <div className="mt-4 flex flex-col">
            <label htmlFor="leave-type">Publish to</label>
            <ChipInput />
          </div>
        </div>
        <div className="">
          <ButtonCustom
            label="Publish "
            className="primary-button mt-4 px-5 float-right"
            type="submit"
          />
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
