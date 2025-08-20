"use client";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import LogoutModal from "@/components/LogoutModal";
import api from "@/lib/api";
import { getEmployeeById, updateEmployee } from "@/lib/api/employee";
import {
  Avatar,
  Button,
  Form,
  Input,
  message,
  Space,
  Spin,
  Upload,
  UploadFile,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CiCalendar, CiCalendarDate, CiEdit } from "react-icons/ci";
import { FaTransgender, FaUpload, FaUser } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { toast } from "sonner";

type Employee = {
  id: number;
  user_id: number;
  name: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  position?: { title: string };
  department?: { name: string };
  image_url?: string;
  gender?: string;
  hire_date?: string;
  phone?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
};

const Profile = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showChangePassword, setChangePassword] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const employeeId = localStorage.getItem("employee_id");
    if (employeeId) {
      setLoading(true);
      getEmployeeById(Number(employeeId))
        .then((res) => {
          const empData = res.data;
          setEmployee(empData);
          form.setFieldsValue({
            ...empData,
            date_of_birth: empData.date_of_birth
              ? dayjs(empData.date_of_birth)
              : null,
            hire_date: empData.hire_date ? dayjs(empData.hire_date) : null,
          });
          if (empData.image_url) {
            setFileList([
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: empData.image_url,
              },
            ]);
          }
        })
        .catch((err) => message.error("Failed to load profile."))
        .finally(() => setLoading(false));
    }
  }, [form]);
  const handleFormSubmit = async (values: any) => {
    if (!employee) return;
    setIsSubmitting(true);

    const imageFile = values.image?.[0]?.originFileObj;

    const payload = {
      ...values,
      date_of_birth: dayjs(values.date_of_birth).format("YYYY-MM-DD"),
      hire_date: dayjs(values.hire_date).format("YYYY-MM-DD"),
      image: imageFile,
      // We need to split name back into first/last for the API
      first_name: values.name.split(" ")[0] || "",
      last_name: values.name.split(" ").slice(1).join(" ") || "",
    };

    const authPayload = {
      email: payload.email,
      username: employee.name,
      password: "password", 
    };
    delete payload.email; // remove from main payload
    if (!imageFile) delete payload.image; // Don't send image if not changed

    try {
      await updateEmployee(employee.id, employee.user_id, authPayload, payload);
      toast.success("Profile updated successfully!");
      setIsEditMode(false); // Exit edit mode
      // Refresh data
      const updatedEmployee = await getEmployeeById(employee.id);
      setEmployee(updatedEmployee.data);
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully!");
      router.push("/sign-in");
    } catch (error: any) {
      toast.error("Logout failed. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="m-[-20px] bg-[url('/profileBackground.svg')] h-[50%] bg-no-repeat bg-cover">
      <Form form={form} onFinish={handleFormSubmit}>
        <div className="px-[18px] pb-[85px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-medium text-white">Profile</h1>

            {isEditMode ? (
              <Space>
                <Button onClick={() => setIsEditMode(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  Save
                </Button>
              </Space>
            ) : (
              <Button
                type="text"
                className="text-white flex items-center gap-2"
                icon={<CiEdit />}
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="flex items-start gap-7 mt-[35px]">
            <div className="relative">
              <div className="w-[126px] h-[126px] rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 p-1">
                {isEditMode ? (
                  <Form.Item
                    name="image"
                    valuePropName="fileList"
                    getValueFromEvent={(e) =>
                      Array.isArray(e) ? e : e?.fileList
                    }
                    noStyle
                  >
                    <Upload
                      listType="picture-circle"
                      maxCount={1}
                      beforeUpload={() => false}
                      fileList={fileList}
                      onChange={({ fileList: newFileList }) =>
                        setFileList(newFileList)
                      }
                      className="w-full h-full"
                    >
                      <Button
                        icon={<FaUpload />}
                        className="!w-full !h-full !rounded-full"
                      >
                        Click to Upload
                      </Button>
                    </Upload>
                  </Form.Item>
                ) : (
                  <Avatar
                    src={employee?.image_url}
                    size={126}
                    icon={<FaUser />}
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>

            <div className="w-[130px] text-white space-y-2">
              <div>
                <span className="text-xs font-medium">Name:</span>
                {isEditMode ? (
                  <Form.Item name="name" noStyle rules={[{ required: true }]}>
                    <Input className="!text-white !bg-transparent !border-b !border-white !rounded-none" />
                  </Form.Item>
                ) : (
                  <span className="text-sm font-bold block">
                    {employee?.name || "N/A"}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-medium">ID:</span>
                <span className="text-sm font-bold block">
                  {employee?.employee_code || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium">Position:</span>
                <span className="text-sm font-bold block">
                  {employee?.position?.title || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium">Department:</span>
                <span className="text-sm font-bold block">
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
          <div className="bg-white border rounded-[10px] shadow-sm mt-5 p-4">
            <h3 className="text-lg font-semibold text-[#273240] mb-5 font-inter">
              Other Information
            </h3>
            <div className="border-t border-[#EFF1F8] mb-5"></div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-normal text-black font-satoshi">
                  Email
                </label>
                {isEditMode ? (
                  <Form.Item
                    name="email"
                    noStyle
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input className="mt-2" />
                  </Form.Item>
                ) : (
                  <div className="mt-2 p-2 border rounded-md bg-gray-50">
                    {employee?.email || "N/A"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-normal text-black font-satoshi">
                  Phone Number
                </label>
                {isEditMode ? (
                  <Form.Item name="phone" noStyle rules={[{ required: true }]}>
                    <Input className="mt-2" />
                  </Form.Item>
                ) : (
                  <div className="mt-2 p-2 border rounded-md bg-gray-50">
                    {employee?.phone || "N/A"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-normal text-black font-satoshi">
                  Address
                </label>
                {isEditMode ? (
                  <Form.Item name="address" noStyle>
                    <Input.TextArea rows={3} className="mt-2" />
                  </Form.Item>
                ) : (
                  <div className="mt-2 p-2 border rounded-md bg-gray-50">
                    {employee?.address || "N/A"}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Logout Modal */}
          {showLogout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="relative z-50">
                <LogoutModal
                  onCancel={() => setShowLogout(false)}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          )}
          {/*{showChangePassword && (*/}
          {/*  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">*/}
          {/*    <div className="relative z-50">*/}
          {/*      <ChangePasswordModal*/}
          {/*        onCancel={() => setChangePassword(false)}*/}
          {/*      />*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
      </Form>
    </div>
  );
};

export default Profile;
