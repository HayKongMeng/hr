"use client";
import LeaveStatus from "@/components/mobile/employee/Leavestatus";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import React, { useEffect, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import { Button, DatePicker, Flex, message, Radio, Select, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import { createLeave, fetchAllLeaveTypes, fetchEmployeesLeave, fetchLeaves, LeaveType } from "@/lib/api/leave";
import { Employee, fetchEmployees } from "@/lib/api/employee";
import dayjs, { Dayjs } from "dayjs";

type LeaveEntry = {
  id: number;
  start_date: string;
  end_date: string;
  status: {
    status_name: string;
  };
  leave_type: {
    type_name: string;
  };
};

const Leave = () => {
  const [isClient, setIsClient] = useState(false);
  const [selectedOption, setSelectedOption] = useState("MyLeaveRequest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLeaveModalOpen, setIsLeavModalOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([]);
    const [leaveEmployeeEntries, setLeaveEmployeeEntries] = useState<LeaveEntry[]>([]);

    const fetchAllLeave: () => void = () => {
      fetchLeaves(1, 10).then((result) => {
        setLeaveEntries(result.data || []);
      });
      fetchEmployeesLeave(1).then((result) => {
        setLeaveEmployeeEntries(result.data || []);
      });
    };
    useEffect(() => {
      fetchAllLeave();
    }, []);

  useEffect(() => {
    fetchAllLeaveTypes().then(setLeaveTypes).catch(console.error);
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchEmployees(1, 10).then((respone) => {
      setEmployees(respone.data);
    });
  }, []);
  const handleCheckInClick = () => {
    setIsLeavModalOpen(true);
    setSelectedEmployee(null);
    setSelectedLeaveType(null);
    setStartDate(null);
    setEndDate(null);
    setReason("");
  };

  const closeLeaveModal = () => {
    setIsLeavModalOpen(false);
    //reset form fields
    setSelectedEmployee(null);
    setSelectedLeaveType(null);
    setStartDate(null);
    setEndDate(null);
    setReason("");
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  const handleSubmitLeave = async () => {
    // Validation
    if (!selectedEmployee) {
      message.error("Please select an employee");
      return;
    }

    if (!selectedLeaveType) {
      message.error("Please select a leave type");
      return;
    }

    if (!startDate || !endDate) {
      message.error("Please select both start and end dates");
      return;
    }

    if (startDate.isAfter(endDate)) {
      message.error("Start date cannot be after end date");
      return;
    }

    if (!reason.trim()) {
      message.error("Please provide a reason for leave");
      return;
    }

    setIsSubmitting(true);
    const companyId= Number(localStorage.getItem("company_id"));
    try {
      const payload = {
        employee_id: selectedEmployee,
        company_id: companyId,
        leave_type_id: selectedLeaveType,
        status_id: 1, // Assuming 1 is for "Pending" status
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
        reason: reason.trim(),
      };

      await createLeave(payload);

      message.success("Leave request submitted successfully!");
      closeLeaveModal();

      // Optionally refresh the leave status component or data
      // You might want to add a callback to refresh the LeaveStatus component
    } catch (error: any) {
      console.error("Error submitting leave request:", error);
      message.error(
        error?.response?.data?.message ||
          "Failed to submit leave request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isClient) {
    return null; 
  }
  return (
    <div className="">
      <h1 className="text-[20px] font-medium tracking-[-0.5px] leading-[17px]">
        Leave Management
      </h1>
      <Button
        className="absolute text-white bg-[#392648] !gap-0 bg-shadow right-0 bottom-0 mb-20 mr-4 !p-6 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
        icon={<IoAddCircleOutline className=" text-3xl" />}
        onClick={handleCheckInClick}
      ></Button>
      <Flex vertical gap="middle">
        <Radio.Group
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="bg-shadow border-none flex justify-between"
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button
            value="MyLeaveRequest"
            className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
          >
            My leave request
          </Radio.Button>
          <Radio.Button
            value="Organization"
            className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
          >
            Organization Leave Request
          </Radio.Button>
        </Radio.Group>
      </Flex>
      {selectedOption === "MyLeaveRequest" && (
        <>
          <div className="bg-shadow mb-20">
            <span className="text-xl font-medium">My Leave</span>
            <LeaveStatus
              leaveEntries={leaveEmployeeEntries} 
              onRefresh={fetchAllLeave}
              showActions={false}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={100}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </div>
          <Modal
            isOpen={isLeaveModalOpen}
            onClose={closeLeaveModal}
            title="Leave Request"
            className="px-4"
          >
            <div className="mt-4">
              <label htmlFor="employee-name">Employee Name</label>
              <Select
                id="employee-name"
                className="w-full mt-2 "
                placeholder="Select employee name"
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                options={employees.map((employee) => ({
                  label: `${employee.name}`,
                  value: employee.id,
                }))}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="leave-type">Leave type</label>
              <Select
                id="leave-type"
                className="w-full mt-2 "
                placeholder="Select leave type"
                value={selectedLeaveType}
                onChange={setSelectedLeaveType}
                options={leaveTypes.map((type) => ({
                  label: type.type_name,
                  value: type.id,
                }))}
              />
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <label htmlFor="leave-type">Date Range</label>
              <div className="flex justify-between gap-4">
                <DatePicker
                  placeholder="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
                <DatePicker
                  placeholder="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabledDate={(current) => {
                    if (!startDate)
                      return current && current < dayjs().startOf("day");
                    return current && current < startDate.startOf("day");
                  }}
                />
              </div>
            </div>
            <div className=" mt-4">
              <label htmlFor="leave-type">Reason</label>
              <TextArea
                id="reason"
                className="mt-4 bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                showCount
                maxLength={100}
                value={reason}
                onChange={handleReasonChange}
                placeholder="Give your reason for leave..."
              />
            </div>
            <div className="mt-9 float-right">
              <Button
                className=" px-5 py-5 text-white bg-[#392648] rounded-full"
                onClick={handleSubmitLeave}
                loading={isSubmitting}
              >
                <Space>Submit</Space>
              </Button>
            </div>
          </Modal>
        </>
      )}
      {selectedOption === "Organization" && (
        <>
          <div className="bg-shadow mb-20">
            <LeaveStatus 
              leaveEntries={leaveEntries} 
              onRefresh={fetchAllLeave}
              showActions={true}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={100}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Leave;
