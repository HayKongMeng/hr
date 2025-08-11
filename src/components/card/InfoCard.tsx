import React from "react";
interface DataCenterCardProps {
  name: string;
  code: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
}
export default function InfoCard({
  name,
  code,
  description,
  isSelected = false,
  onClick
}: DataCenterCardProps) {
  

  return (
        <div className="bg-[#F8F9FA] px-[15px] py-[11px] flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg">
          <div className="flex w-full items-center gap-2.5 sm:gap-[10px]">
        {/* Checkbox */}
        <div className="flex items-center justify-start w-6 flex-shrink-0">
          <div className={`rounded-md border-2 flex h-6 w-6 items-center justify-center ${
            isSelected
              ? 'border-blue-500 bg-blue-500'
              : 'border-[#d1d5db]'
          }`}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          >
            {isSelected && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-white"
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center font-medium">
          <div className="flex w-full items-center gap-2.5 sm:gap-[10px]">

            {/* Text Content */}
            <div className="flex flex-col flex-1">
              {/* Title and Code Row */}
              <div className="flex w-full items-center gap-2 sm:gap-[10px] text-black">
                <div className="text-sm leading-[17px] font-medium flex-1">
                  {name}
                </div>
                <div className="text-xs leading-6 font-medium flex-shrink-0">
                  {code}
                </div>
              </div>

              {/* description and Arrow Row */}
              <div className="flex w-full items-center text-xs text-[#364663] leading-[17px] gap-2">
                <div className="flex-1 ">
                  {description ? description : "No description available"}
                </div>
                <img
                  src="https://api.builder.io/api/v1/image/assets/feb8ce0efd7646cb96252d2c86689552/2c28e0961bc99d8c953765d45658bcd555e43eac?placeholderIfAbsent=true"
                  alt="Arrow"
                  className="w-6 h-6 flex-shrink-0 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
  );
};

