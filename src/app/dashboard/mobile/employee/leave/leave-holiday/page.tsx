"use client";
import { DatePicker, DatePickerProps, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import ButtonCustom from "@/components/ui/Button";
import { IoMdAdd } from "react-icons/io";
import TextArea from "antd/es/input/TextArea";
import Modal from "@/components/Modal";
import { RangePickerProps } from "antd/es/date-picker";
import InfoCard from "@/components/card/InfoCard";
import {
  fetchHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/lib/api/holidays";
import Pagination from "@/components/Pagination";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedHoliday, setSelectedHoliday] = useState<any | null>(null);

  // Form fields
  const [occasion, setOccasion] = useState("");
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  const handleHolidayClick = () => {
    setSelectedHoliday(null);
    setOccasion("");
    setStartDate(null);
    setEndDate(null);
    setType("");
    setDescription("");
    setIsHolidayModalOpen(true);
  };

  const closeHolidayTimeModal = () => {
    setIsHolidayModalOpen(false);
    setSelectedHoliday(null);
  };

  const fetchAndSetHolidays = async (page = 1, perPage = ITEMS_PER_PAGE) => {
    setLoading(true);
    try {
      const response = await fetchHolidays(page, perPage);
      setHolidays(response.data);
      setTotalPages(response.total_pages || 1);
      setTotalItems(response.total_items || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetHolidays(currentPage, ITEMS_PER_PAGE);
  }, [currentPage]);

  // For editing
  const handleEdit = (holiday: any) => {
    setSelectedHoliday(holiday);
    setOccasion(holiday.name);
    setStartDate(holiday.start_date);
    setEndDate(holiday.end_date);
    setType(holiday.type);
    setDescription(holiday.description);
    setIsHolidayModalOpen(true);
  };

  // For deleting
  const handleDelete = async (holidayId: number) => {
    await deleteHoliday(holidayId);
    fetchAndSetHolidays(currentPage, ITEMS_PER_PAGE);
  };

  // For submitting (create or update)
  const handleSubmit = async () => {
    const payload = {
      name: occasion,
      start_date: startDate,
      end_date: endDate,
      type,
      description,
    };
    if (selectedHoliday) {
      await updateHoliday(selectedHoliday.id, payload);
    } else {
      await createHoliday(payload);
    }
    setIsHolidayModalOpen(false);
    fetchAndSetHolidays(currentPage, ITEMS_PER_PAGE);
  };

  return (
    <div>
      <div className="bg-shadow">
        <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
          Holidays
        </h1>
        <div className="p-4 flex flex-col items-end">
          <Input
            className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
            placeholder="Search..."
            prefix={<CiSearch className="text-[#364663] text-xl" />}
          />
          <ButtonCustom
            onClick={handleHolidayClick}
            label="Add Holidays"
            icon={<IoMdAdd />}
            className="primary-button mt-4 gap-0 rounded-md px-2 "
          />
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <span>Loading...</span>
          </div>
        ) : holidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <img src="/empty.svg" alt="No holidays" className="w-40 h-40" />
            <p className="text-gray-500 mt-4 text-sm font-satoshi">
              No holidays found
            </p>
          </div>
        ) : (
          holidays.map((holiday) => (
            <div key={holiday.id} className="flex items-center gap-2 mb-2">
              <InfoCard
                name={holiday.name}
                description={holiday.start_date + " - " + holiday.end_date}
              />
              <ButtonCustom
                label="Edit"
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => handleEdit(holiday)}
              />
              <ButtonCustom
                label="Delete"
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(holiday.id)}
              />
            </div>
          ))
        )}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={closeHolidayTimeModal}
        title={selectedHoliday ? "Edit Holiday" : "Add Holiday"}
        className="px-4"
      >
        <div className="bg-shadow p-4">
          <label htmlFor="leave-type">Occasion</label>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              placeholder="Enter occasion..."
              className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <label htmlFor="leave-type">Date Range</label>
            <div className="flex justify-between gap-4">
              <DatePicker
                placeholder="Start Date"
                value={startDate}
                onChange={(value) => setStartDate(value)}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
              <DatePicker
                placeholder="End Date"
                value={endDate}
               onChange={(value) => setEndDate(value)}
                disabledDate={(current) => {
                  if (!startDate)
                    return current && current < dayjs().startOf("day");
                  return current && current < startDate.startOf("day");
                }}
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">Type</label>
            <Select
              className="w-full mt-2"
              placeholder="Select type"
              value={type}
              onChange={setType}
              options={[
                { label: "Public", value: "Public" },
                { label: "Optional", value: "Optional" },
                { label: "Company", value: "Company" },
                { label: "Regional", value: "Regional" },
              ]}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">Description</label>
            <TextArea
              className="mt-4 bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
              showCount
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
            />
          </div>
        </div>
        <ButtonCustom
          label="Submit"
          className="primary-button mt-4 px-5 float-right"
          type="submit"
          onClick={handleSubmit}
        />
      </Modal>
    </div>
  );
};

export default Page;
