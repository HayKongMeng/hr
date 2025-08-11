"use client";
import { Input, Space, Tag } from "antd";
import React, { useState } from "react";
import { CiSearch } from "react-icons/ci";

const ChipInput = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
    }
    setInputValue("");
  };
  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
  };
  return (
      <div className="bg-[rgba(150,166,194,0.2)] rounded-[10px] p-3 mt-4 min-h-[40px] flex flex-wrap items-center gap-2">
        <Space size={[4, 4]} wrap className="flex-1">
          {tags.map((tag, index) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleClose(tag)}
              className=" text-[#364663] rounded-md input-style"
            >
              {tag}
            </Tag>
          ))}
          <Input
            type="text"
            size="small"
            style={{
              width: Math.max(100, inputValue.length * 8 + 20),
              border: "none",
              boxShadow: "none",
              background: "transparent",
            }}
            value={inputValue}
            onChange={handleInputChange}
            onPressEnter={handleInputConfirm}
            onBlur={handleInputConfirm}
            placeholder={
              tags.length === 0 ? "Type and press Enter to add tags..." : ""
            }
            className=" !bg-transparent !border-none !outline-none !shadow-none text-[#364663] !w-full"
          />
        </Space>
        <Input
          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
          placeholder="Search existing tags..."
          prefix={<CiSearch className="text-[#364663] text-xl" />}
        />
      </div>
  );
};

export default ChipInput;
