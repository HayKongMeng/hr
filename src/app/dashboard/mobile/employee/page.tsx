"use client";
import {
  Button,
  DatePicker,
  DatePickerProps,
  Dropdown,
  Flex,
  Input,
  MenuProps,
  message,
  Radio,
  RadioChangeEvent,
  Space,
} from "antd";
import React, { useEffect, useState } from "react";
import ButtonCustom from "@/components/ui/Button";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowDown, IoMdAdd, IoMdRemove } from "react-icons/io";
import Modal from "@/components/Modal";
import { RangePickerProps } from "antd/es/date-picker";
import {
  createEmployee,
  fetchAllEmployees,
  fetchEmployees,
} from "@/lib/api/employee";
import InfoCardLogo from "@/components/card/InfoCardLogo";
import ProfileImageUploader from "@/components/ProfileImageUploader";
import moment from "moment";
import { createExperience } from "@/lib/api/experience";
import { createEducationDetail } from "@/lib/api/educationdetail";

const initialFormData = {
  username: "",
  email: "",
  password: "password123", // Default password, or generate one
  employee_code: "",
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  date_of_birth: "",
  hire_date: "",
  gender: "Male",
  position_id: 1, // Default or null
  department_id: 1, // Default or null
  work_station_id: 1, // Default
  employment_type_id: 1, // Default
  image: null as File | null,
};

const Page = () => {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [value, setValue] = useState(1);
  const [emails, setEmails] = useState([""]);
  const [phoneNumber, setPhoneNumber] = useState([""]);
  const [address, setAddress] = useState([""]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [workExperiences, setWorkExperiences] = useState([
    {
      companyName: "",
      jobTitle: "",
      jobDescription: "",
      startDate: null,
      endDate: null,
    },
  ]);
  const [educations, setEducations] = useState([
    {
      schoolName: "",
      degree: "",
      fieldOfStudy: "",
      startDate: null,
      endDate: null,
    },
  ]);

  const type = "add";
  const data = null;

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLowerCase();
    return (
      employee.name?.toLowerCase().includes(query) ||
      employee.email?.toLowerCase().includes(query) ||
      employee.employee_code?.toLowerCase().includes(query) ||
      employee.department?.name?.toLowerCase().includes(query)
    );
  });

  // --- Generic Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date ? moment(date).format("YYYY-MM-DD") : "",
    }));
  };

  const handleProfileImageChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
  };

  // --- Dynamic Section Handlers (Work/Education) ---
  const handleAddWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        companyName: "",
        jobTitle: "",
        jobDescription: "",
        startDate: null,
        endDate: null,
      },
    ]);
  };

  const handleRemoveWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const handleWorkExperienceChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...workExperiences] as any;
    updated[index][field] = value;
    setWorkExperiences(updated);
  };

  const handleAddEducation = () => {
    setEducations([
      ...educations,
      {
        schoolName: "",
        degree: "",
        fieldOfStudy: "",
        startDate: null,
        endDate: null,
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };
  useEffect(() => {
    fetchEmployees(1, 10).then((respone) => {
      setEmployees(respone.data);
    });
  }, []);
  const handleEducationChange = (index: number, field: string, value: any) => {
    const updated = [...educations] as any;
    updated[index][field] = value;
    setEducations(updated);
  };

  const items: MenuProps["items"] = [
    {
      label: "1st menu item",
      key: "1",
      // icon: <UserOutlined />,
    },
    {
      label: "2nd menu item",
      key: "2",
      // icon: <UserOutlined />,
    },
    {
      label: "3rd menu item",
      key: "3",
      // icon: <UserOutlined />,
      danger: true,
    },
    {
      label: "4rd menu item",
      key: "4",
      // icon: <UserOutlined />,
      danger: true,
      disabled: true,
    },
  ];
  const handleAddPhoneNumberField = () => {
    setPhoneNumber([...phoneNumber, ""]);
  };
  const handleAddEmailField = () => {
    setEmails([...emails, ""]);
  };
  const handleAddaddressField = () => {
    setAddress([...address, ""]);
  };
  const onOk = (
    value: DatePickerProps["value"] | RangePickerProps["value"]
  ) => {
    console.log("onOk: ", value);
  };
  const handleAddressChange = (index: number, value: string) => {
    const updatedAddress = [...address];
    updatedAddress[index] = value;
    setAddress(updatedAddress);
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };
  const handlePhoneNumberChange = (index: number, value: string) => {
    const updatedPhoneNumber = [...phoneNumber];
    updatedPhoneNumber[index] = value;
    setPhoneNumber(updatedPhoneNumber);
  };

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  // --- Modal Controls ---
  const handleEmployeeClick = () => {
    setIsEmployeeModalOpen(true);
  };
  const closeEmployeeTimeModal = () => {
    setIsEmployeeModalOpen(false);
    setFormData(initialFormData);
  };
  const handleSubmit = async () => {
    setLoading(true);
    message.loading({
      content: "Creating employee...",
      key: "employee_creation",
    });

    try {
      // Step 1: Create the main employee record
      const employeePayload = {
        ...formData,
        username: `${formData.first_name} ${formData.last_name}`,
      };
      const employeeResponse = await createEmployee(employeePayload);
      const newEmployeeId = employeeResponse.result.data.id;

      if (!newEmployeeId) {
        throw new Error("Failed to get new employee ID.");
      }

      message.success({
        content: "Employee created! Adding details...",
        key: "employee_creation",
      });

      // Step 2: Create promises for all education and experience entries
      const experiencePromises = workExperiences.map((exp) =>
        createExperience({
          employee_id: newEmployeeId,
          previous_company_name: exp.companyName,
          designation: exp.jobTitle,
          start_date: exp.startDate
            ? moment(exp.startDate).format("YYYY-MM-DD")
            : "",
          end_date: exp.endDate ? moment(exp.endDate).format("YYYY-MM-DD") : "",
        })
      );

      const educationPromises = educations.map((edu) =>
        createEducationDetail({
          employee_id: newEmployeeId,
          institution_name: edu.schoolName,
          course: edu.degree, // Mapping 'degree' to 'course' as per your API
          start_date: edu.startDate
            ? moment(edu.startDate).format("YYYY-MM-DD")
            : "",
          end_date: edu.endDate ? moment(edu.endDate).format("YYYY-MM-DD") : "",
        })
      );

      // Step 3: Execute all promises concurrently
      await Promise.all([...experiencePromises, ...educationPromises]);

      message.success({
        content: "All employee details saved successfully!",
        key: "employee_creation",
        duration: 2,
      });

      // Step 4: Clean up and refresh
      closeEmployeeTimeModal();
      fetchAllEmployees();
    } catch (error) {
      console.error("Failed to create employee:", error);
      message.error({
        content: "An error occurred. Please check the console.",
        key: "employee_creation",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };
  const menuProps = {
    items,
  };
  return (
    <div className="bg-shadow flex flex-col gap-4">
      <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
        Employee
      </h1>
      <div className=" flex flex-col items-end">
        <Input
          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
          placeholder="Search..."
          prefix={<CiSearch className="text-[#364663] text-xl" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonCustom
          onClick={handleEmployeeClick}
          label="Add Employee"
          icon={<IoMdAdd />}
          className="primary-button mt-4 gap-0 rounded-md px-2 "
        />
      </div>
      {filteredEmployees.map((employee) => (
        <InfoCardLogo
          key={employee.id}
          name={employee.name}
          email={employee.email}
          code={employee.employee_code}
          logo={employee.image}
          description={employee.department.name}
        />
      ))}

      {/* --- ADD EMPLOYEE MODAL --- */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={closeEmployeeTimeModal}
        title="Add Employee"
        className="px-4"
      >
        {/* Personal Info Section */}
        <section className="bg-shadow p-4">
          <div>
            <ProfileImageUploader
              initialFile={null}
              onFileChange={(file: File | null) => setProfileImage(file)}
            />
          </div>
          <div>
            <label htmlFor="leave-type">Employee Code</label>
            <div className="flex flex-col gap-4 mt-4">
              <Input
                name="employee_code"
                value={formData.employee_code}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">First Name</label>
            <div className="flex flex-col gap-4 mt-4">
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">Last Name</label>
            <div className="flex flex-col gap-4 mt-4">
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">Date of Birth</label>
            <div className="flex flex-col gap-4 mt-4">
              <DatePicker
                name="date_of_birth"
                value={formData.date_of_birth ? moment(formData.date_of_birth) : null}
                onChange={(date) => handleDateChange("date_of_birth", date)}
                className="w-full mt-2"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <label htmlFor="leave-type">Gender</label>
            <Radio.Group
              name="gender"
              value={formData.gender}
              onChange={(e) => handleRadioChange("gender", e.target.value)}
              className="mt-2"
            >
              <Radio value="Male">Male</Radio>
              <Radio value="Female">Female</Radio>
              <Radio value="Other">Other</Radio>
            </Radio.Group>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <label htmlFor="leave-type">Marital Status</label>
            <Radio.Group
              onChange={onChange}
              value={value}
              options={[
                {
                  value: 1,
                  className: "option-1",
                  label: (
                    <Flex gap="small" justify="center" align="center" vertical>
                      Single
                    </Flex>
                  ),
                },
                {
                  value: 2,
                  className: "option-2",
                  label: (
                    <Flex gap="small" justify="center" align="center" vertical>
                      Married
                    </Flex>
                  ),
                },
              ]}
            />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="leave-type">Email</label>
              <ButtonCustom
                icon={<IoMdAdd />}
                label="Add Field"
                className="bg-shadow"
                onClick={handleAddEmailField}
                disabled={emails.length >= 3}
              />
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {emails.map((email, idx) => (
                <Input name="email" value={formData.email} onChange={handleChange} className="mt-2" />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="leave-type">Address</label>
              <ButtonCustom
                icon={<IoMdAdd />}
                label="Add Field"
                className="bg-shadow"
                onClick={handleAddaddressField}
                disabled={address.length >= 3}
              />
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {address.map((addres, i) => (
                <Input
                  key={i}
                  value={addres}
                  onChange={(e) => handleAddressChange(i, e.target.value)}
                  placeholder={`Address ${i + 1}`}
                  className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="leave-type">Phone Number</label>
              <ButtonCustom
                icon={<IoMdAdd />}
                label="Add Field"
                className="bg-shadow"
                onClick={handleAddPhoneNumberField}
                disabled={phoneNumber.length >= 3}
              />
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {phoneNumber.map((phonenumber, id) => (
                <Input
                  key={id}
                  value={phonenumber}
                  onChange={(e) =>
                    handlePhoneNumberChange(id, e.target.value)
                  }
                  placeholder={`phonenumber ${id + 1}`}
                  className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Work Info Section */}
        <section className="bg-shadow">
          <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
            Currently Work Information
          </h1>
          <div className="mt-4">
            <label htmlFor="leave-type">Date of Joining</label>
            <div className="flex flex-col gap-4 mt-4">
              <DatePicker
                name="hire_date"
                onChange={(date) => handleDateChange("hire_date", date)}
                className="w-full mt-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">Position</label>
            <Dropdown
              menu={menuProps}
              className="flex flex-row items-cente justify-between px-[10px] py-[7px] gap-[12px]
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px]
                        flex-none order-1 self-stretch flex-grow-0 "
            >
              <Button className="mt-4">
                <Space>Select</Space>
                <IoIosArrowDown />
              </Button>
            </Dropdown>
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">Department</label>
            <Dropdown
              menu={menuProps}
              className="flex flex-row items-cente justify-between px-[10px] py-[7px] gap-[12px]
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px]
                        flex-none order-1 self-stretch flex-grow-0 "
            >
              <Button className="mt-4">
                <Space>Select</Space>
                <IoIosArrowDown />
              </Button>
            </Dropdown>
          </div>
        </section>

        {/* Work Experience Section */}
        <section className="bg-shadow mt-4">
          <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
            Work experience
          </h1>
          <div className="flex flex-col gap-4">
            {workExperiences.map((exp, idx) => (
              <div key={idx} className="bg-shadow flex flex-col gap-4 relative">
                <div className="absolute top-2 right-2">
                  {workExperiences.length > 1 && (
                    <Button
                      icon={<IoMdRemove />}
                      danger
                      onClick={() => handleRemoveWorkExperience(idx)}
                    />
                  )}
                </div>
                <div>
                  <label>Company Name</label>
                  <Input
                    value={exp.companyName}
                    onChange={(e) =>
                      handleWorkExperienceChange(
                        idx,
                        "companyName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label>Job Title</label>
                  <Input
                    value={exp.jobTitle}
                    onChange={(e) =>
                      handleWorkExperienceChange(
                        idx,
                        "jobTitle",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label>Job Description</label>
                  <Input
                    value={exp.jobDescription}
                    onChange={(e) =>
                      handleWorkExperienceChange(
                        idx,
                        "jobDescription",
                        e.target.value
                      )
                    }
                    placeholder=""
                    className="mt-4 !stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                  />
                </div>
                <div>
                  <label>Date Range</label>
                  <div className="flex justify-between gap-4 mt-4">
                    <DatePicker
                      placeholder="Start Date"
                      onChange={(date) =>
                        handleWorkExperienceChange(idx, "startDate", date)
                      }
                      className="w-full"
                    />
                    <DatePicker
                      placeholder="End Date"
                      onChange={(date) =>
                        handleWorkExperienceChange(idx, "endDate", date)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              icon={<IoMdAdd />}
              onClick={handleAddWorkExperience}
              className="bg-shadow mt-2 self-end"
              disabled={workExperiences.length >= 5} // <-- limit to 5
            >
              Add Work Experience
            </Button>
          </div>
        </section>

        {/* Education Section */}
        <section className="bg-shadow mt-4">
          <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
            Education Information
          </h1>
          <div className="flex flex-col gap-4">
            {educations.map((edu, idx) => (
              <div key={idx} className="bg-shadow flex flex-col gap-4 relative">
                <div className="absolute top-2 right-2">
                  {educations.length > 1 && (
                    <Button
                      icon={<IoMdRemove />}
                      danger
                      onClick={() => handleRemoveEducation(idx)}
                    />
                  )}
                </div>
                <div>
                  <label>School Name</label>
                  <Input value={edu.schoolName} onChange={(e) => handleEducationChange(idx, "schoolName", e.target.value)} />
                </div>
                <div>
                  <label>Degree</label>
                  <Input value={edu.degree} onChange={(e) => handleEducationChange(idx, "degree", e.target.value)} />

                </div>
                <div>
                  <label>Date Range</label>
                  <div className="flex justify-between gap-4 mt-4">
                    <DatePicker placeholder="Start Date" onChange={(date) => handleEducationChange(idx, "startDate", date)} className="w-full" />
                  <DatePicker placeholder="End Date" onChange={(date) => handleEducationChange(idx, "endDate", date)} className="w-full" />
                  </div>
                </div>
              </div>
            ))}
            <Button
              icon={<IoMdAdd />}
              onClick={handleAddEducation}
              className="bg-shadow mt-2 self-end"
              disabled={educations.length >= 5} // <-- limit to 5
            >
              Add Education
            </Button>
          </div>
        </section>
        <ButtonCustom
          label="Submit"
          className="primary-button mt-4 px-5 float-right mb-20"
          type="submit"
          onClick={handleSubmit}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default Page;
