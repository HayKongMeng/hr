"use client";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import LogoutModal from "@/components/LogoutModal";
import { getEmployeeById } from "@/lib/api/employee";
import { useEffect, useState } from "react";
import { CiCalendar, CiCalendarDate, CiEdit } from "react-icons/ci";
import { FaTransgender } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
const Profile = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [showChangePassword, setChangePassword] = useState(false);
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    const employeeId = 1;
    getEmployeeById(employeeId)
      .then((res) => {
        console.log("API response:", res);
        setEmployee(res.data.result.data);
      })
      .catch((err) => {
        console.error("API error:", err);
      });
  }, []);
  return (
    <div className="m-[-20px] bg-[url('/profileBackground.svg')] h-[50%] md:h-[40%] xl:h-[50%] 2xl:h-[40%] bg-no-repeat bg-cover">
      <div className="">
        <div className="px-[18px] pb-[85px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-medium text-white">Profile</h1>

            <span className="flex gap-2 items-center text-white">
              <CiEdit /> Edit Profile
            </span>
          </div>

          <div className="flex items-start gap-7 mt-[35px]">
            <div className="relative">
              <div className="w-[126px] h-[126px] rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 p-1">
                <img
                  src={employee?.image_url || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            <div className="w-[130px]">
              <div className="flex items-center gap-[19px] mt-1">
                <span className="text-[12px] font-medium text-white font-satoshi">
                  Name:
                </span>
                <span className="text-sm font-bold text-[#FFFFFF] font-satoshi">
                  {employee?.name || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-[19px] mt-1">
                <span className="text-[12px] font-medium text-white font-satoshi">
                  ID:
                </span>
                <span className="text-sm font-bold text-white font-satoshi">
                  {employee?.employee_code || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-7 mt-1">
                <span className="text-[12px] font-medium text-white font-satoshi">
                  Position:
                </span>
                <span className="text-sm font-bold text-[#FFFFFF] font-satoshi">
                  {employee?.position?.title || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-[37px] mt-1">
                <span className="text-[12px] font-medium text-white font-satoshi">
                  Department:
                </span>
                <span className="text-sm font-bold text-[#FFFFFF] font-satoshi">
                  {employee?.department?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="bg-white border border-[#EFF1F8] rounded-[10px] shadow-[0px_0.3px_0.9px_rgba(0,0,0,0.11),0px_1.6px_3.6px_rgba(0,0,0,0.132)] mt-5 p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Gender */}
              <div className="text-center">
                <div className="w-10 bg-[#F3F6FD] rounded-[8px] h-10 mx-auto mb-[18px] flex items-center justify-center">
                  <FaTransgender className="text-[#4B68FF]" />
                </div>
                <div className="text-[12px] font-medium text-[#737391] font-satoshi">
                  Gender
                </div>
                <div className="text-[16px] font-bold text-[#344054] font-satoshi leading-[22px]">
                  {employee?.gender || "N/A"}
                </div>
              </div>

              {/* Member Since */}
              <div className="text-center">
                <div className="w-10 bg-[#F3F6FD] rounded-[8px] h-10 mx-auto mb-[18px] flex items-center justify-center">
                  <CiCalendarDate className="text-[#4B68FF]" />
                </div>
                <div className="text-[12px] font-medium text-[#737391] font-satoshi">
                  Member since
                </div>
                <div className="text-[16px] font-bold text-[#344054] font-satoshi leading-[22px]">
                  {employee?.hire_date || "N/A"}
                </div>
              </div>

              {/* Phone Number */}
              <div className="text-center">
                <div className="w-10 bg-[#F3F6FD] rounded-[8px] h-10 mx-auto mb-[18px] flex items-center justify-center">
                  <FiPhone className="text-[#4B68FF]" />
                </div>
                <div className="text-[12px] font-medium text-[#737391] font-satoshi mt-[18px] pt-0.5">
                  Phone Number
                </div>
                <div className="text-[16px] font-bold text-[#344054] font-satoshi leading-[22px]">
                  {employee?.phone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Button */}
          <div className="flex gap-3">
            <button
              className="w-full bg-[#392648] text-white rounded-full py-2 px-3 mt-5 text-sm font-bold tracking-[-0.32px] leading-5 font-satoshi"
              onClick={() => setChangePassword(true)}
            >
              Change password
            </button>
            <button
              className="w-full bg-[#392648] text-white rounded-full py-2 px-3 mt-5 text-sm font-bold tracking-[-0.32px] leading-5 font-satoshi"
              onClick={() => setShowLogout(true)}
            >
              Logout
            </button>
          </div>

          {/* Other Information Section */}
          <div className="bg-white border border-[#EFF1F8] rounded-[10px] shadow-[0px_0.3px_0.9px_rgba(0,0,0,0.11),0px_1.6px_3.6px_rgba(0,0,0,0.132)] mt-5 p-[15px]">
            <h3 className="text-[16px] font-semibold text-[#273240] mb-5 font-inter">
              Other Information
            </h3>
            <div className="border-t border-[#EFF1F8] mb-5"></div>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-[14px] font-normal text-black font-satoshi">
                  Email
                </label>
                <div className="mt-2.5 p-2 border border-[#EFF1F8] rounded-md bg-white text-[14px] text-[#273240] font-inter">
                  {employee?.email || "N/A"}
                </div>
              </div>

              {/* Place of Birth */}
              <div>
                <label className="text-[14px] font-normal text-black font-satoshi">
                  Place of Birth
                </label>
                <div className="mt-2.5 p-2 border border-[#EFF1F8] rounded-md bg-white text-[14px] text-[#273240] font-inter">
                  {employee?.place_of_birth || "N/A"}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-[14px] font-normal text-black font-satoshi">
                  Address
                </label>
                <div className="mt-2.5 p-2 border border-[#EFF1F8] rounded-md bg-white text-[14px] text-[#273240] font-inter">
                  {employee?.address || "N/A"}
                </div>
              </div>

              {/* Marital Status */}
              <div>
                <label className="text-[14px] font-normal text-black font-satoshi">
                  Marital Status
                </label>
                <div className="mt-2.5 p-2 border border-[#EFF1F8] rounded-md bg-white text-[14px] text-[#273240] font-inter">
                  {employee?.marital_status || "N/A"}
                </div>
              </div>

              {/* Date of employment */}
              <div>
                <label className="text-[14px] font-normal text-black font-satoshi">
                  Date of employment
                </label>
                <div className="mt-2.5 p-2 border border-[#EFF1F8] rounded-md bg-white text-[14px] text-[#273240] font-inter">
                  {employee?.hire_date || "N/A"}
                </div>
              </div>

              {/* Working shift */}
              <div>
                <label className="text-[14px] font-normal text-black font-satoshi">
                  Working shift
                </label>
                <div className="mt-2.5 p-2 border border-[#EFF1F8] rounded-md bg-white text-[14px] text-[#273240] font-inter">
                  {employee?.working_shift || "N/A"}
                </div>
              </div>

              {/* Under supervision */}
              <div>
                <label className="text-[14px] font-normal text-black font-satoshi">
                  Under supervision
                </label>
                <div className="mt-2.5 p-2 border border-[#EFF1F8] rounded-md bg-white text-[14px] text-[#273240] font-inter">
                  {employee?.posted_by_name || "N/A"}
                </div>
              </div>
            </div>
          </div>
          {/* Logout Modal */}
          {showLogout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="relative z-50">
                <LogoutModal onCancel={() => setShowLogout(false)} />
              </div>
            </div>
          )}
          {showChangePassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="relative z-50">
                <ChangePasswordModal
                  onCancel={() => setChangePassword(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
