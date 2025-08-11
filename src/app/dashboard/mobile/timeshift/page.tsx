"use client";
import ChipInput from "@/components/ChipInput";
import Modal from "@/components/Modal";
import ButtonCustom from "@/components/ui/Button";
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
  Space,
} from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import TextArea from "antd/es/input/TextArea";
import React, { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowDown, IoMdAdd } from "react-icons/io";

const Timeshift = () => {
  // manage shift
  const [selectedOption, setSelectedOption] = useState("ManageShift");
  const [isShiftTimeModalOpen, setIsShiftTimeModalOpen] = useState(false);
  const handleShiftTimeClick = () => {
    setIsShiftTimeModalOpen(true);
  };

  const closeShiftTimeModal = () => {
    setIsShiftTimeModalOpen(false);
  };
  const onOk = (
    value: DatePickerProps["value"] | RangePickerProps["value"]
  ) => {
    console.log("onOk: ", value);
  };

  //   employee shift
  const [isEmployeeShiftModalOpen, setIsEmployeeShiftModalOpen] =
    useState(false);
  const handleEmployeeShiftClick = () => {
    setIsEmployeeShiftModalOpen(true);
  };

  const closeEmployeeShiftModal = () => {
    setIsEmployeeShiftModalOpen(false);
  };
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log("Change:", e.target.value);
  };
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    message.info("Click on menu item.");
    console.log("click", e);
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

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <div>
      <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
        Timeshift
      </h1>
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
              value="ManageShift"
              className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
            >
              Manage shift
            </Radio.Button>
            <Radio.Button
              value="EmployeeShift"
              className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
            >
              Employee shift
            </Radio.Button>
          </Radio.Group>
        </Flex>
      </div>
      {selectedOption === "ManageShift" && (
        <div className="bg-shadow p-4 flex flex-col items-end">
          <Input
            className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
            placeholder="Search..."
            prefix={<CiSearch className="text-[#364663] text-xl" />}
          />
          <ButtonCustom
            onClick={handleShiftTimeClick}
            label="Add shift"
            icon={<IoMdAdd />}
            className="primary-button mt-4 gap-0 rounded-md px-2 "
          />
        </div>
      )}
      {selectedOption === "EmployeeShift" && (
        <div className="bg-shadow p-4 flex flex-col items-end">
          <Input
            className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
            placeholder="Search..."
            prefix={<CiSearch className="text-[#364663] text-xl" />}
          />
          <ButtonCustom
            onClick={handleEmployeeShiftClick}
            label="Assign shift"
            icon={<IoMdAdd />}
            className="primary-button mt-4 gap-0 rounded-md px-2 "
          />
        </div>
      )}

      <Modal
        isOpen={isShiftTimeModalOpen}
        onClose={closeShiftTimeModal}
        title="Add shift"
        className="px-4"
      >
        <div className="bg-shadow p-4">
          <label htmlFor="leave-type">Shift name</label>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              placeholder="Shift Name"
              className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
            />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <label htmlFor="leave-type">Date Range</label>
            <div className="flex justify-between gap-4">
              <DatePicker
                showTime
                onChange={(value, dateString) => {
                  console.log("Selected Time: ", value);
                  console.log("Formatted Selected Time: ", dateString);
                }}
                onOk={onOk}
              />

              <DatePicker
                showTime
                onChange={(value, dateString) => {
                  console.log("Selected Time: ", value);
                  console.log("Formatted Selected Time: ", dateString);
                }}
                onOk={onOk}
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="leave-type">Shift time</label>
            <ChipInput />
          </div>
        </div>
        <ButtonCustom
          label="Publish "
          className="primary-button mt-4 px-5 float-right"
          type="submit"
        />
      </Modal>

      <Modal
        isOpen={isEmployeeShiftModalOpen}
        onClose={closeEmployeeShiftModal}
        title="Assign shift"
        className="px-4"
      >
        <div className="bg-shadow p-4">
          <div className="">
            <label htmlFor="leave-type">Shift time</label>
            <ChipInput />
          </div>
          <div>
            <label htmlFor="leave-type">Leave type</label>
            <Dropdown
              menu={menuProps}
              className="flex flex-row items-cente justify-between px-[10px] py-[7px] gap-[12px]
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px]
                        flex-none order-1 self-stretch flex-grow-0 "
            >
              <Button className="mt-4">
                <Space>Button</Space>
                <IoIosArrowDown />
              </Button>
            </Dropdown>
          </div>
          <label htmlFor="leave-type">Shift name</label>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              placeholder="Shift Name"
              className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
            />
          </div>
          <div className=" mt-4">
            <label htmlFor="leave-type">Message</label>
            <TextArea
              className="mt-4  
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
              showCount
              maxLength={100}
              onChange={onChange}
              placeholder="Enter description..."
            />
          </div>
        </div>
        <ButtonCustom
          label="Publish "
          className="primary-button mt-4 px-5 float-right"
          type="submit"
        />
      </Modal>
    </div>
  );
};

export default Timeshift;
