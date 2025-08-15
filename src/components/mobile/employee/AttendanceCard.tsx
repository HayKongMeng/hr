"use client";
import Pagination from "@/components/Pagination";
import { MappedAttendanceItem } from "@/lib/dateFormat";

type AttendanceCardProps = {
  items: MappedAttendanceItem[];
};

const AttendanceCard: React.FC<AttendanceCardProps> = ({ items }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'late':
        return {
          bgColor: 'bg-[#ffe3e3]',
          textColor: 'text-[#dc2626]',
          checkInColor: 'text-[#dc2626]',
          iconUrl: "https://api.builder.io/api/v1/image/assets/feb8ce0efd7646cb96252d2c86689552/90da4342bf08482f85d3851d966c0b0915777c57?placeholderIfAbsent=true"
        };
      case 'on time':
      case 'Present':
        return {
          bgColor: 'bg-[#d5e8ff]',
          textColor: 'text-[#54a0fd]',
          checkInColor: 'text-[#54a0fd]',
          iconUrl: "https://api.builder.io/api/v1/image/assets/feb8ce0efd7646cb96252d2c86689552/60892d42ef576ab76e2ecb3f2669886e29923e23?placeholderIfAbsent=true"
        };
      case 'leave':
        return {
          bgColor: 'bg-[#dadada]',
          textColor: 'text-[#585858]',
          checkInColor: 'text-[#392648]',
          iconUrl: "https://api.builder.io/api/v1/image/assets/feb8ce0efd7646cb96252d2c86689552/8143490f70370bad335aa59829503c748e8a41d0?placeholderIfAbsent=true"
        };
      default:
        return {
          bgColor: 'bg-[#f0f0f0]',
          textColor: 'text-[#666666]',
          checkInColor: 'text-[#666666]',
          iconUrl: "https://api.builder.io/api/v1/image/assets/feb8ce0efd7646cb96252d2c86689552/60892d42ef576ab76e2ecb3f2669886e29923e23?placeholderIfAbsent=true"
        };
    }
  };

  return (
    <div >
      {items.map((item) => {
        const styles = getStatusStyles(item.status);
        
        return (
          <div key={item.id} className="bg-[#f8f9fa] rounded-lg px-4 py-4 mb-[19px] last:mb-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-[#141414] leading-none tracking-[-0.14px] mb-[7px]">
                  {item.date}
                </div>
                <div className="flex items-center gap-7 text-[16px] font-normal tracking-[-0.5px] leading-[1.06]">
                  <div className={`flex items-center gap-[5px] ${styles.checkInColor}`}>
                    <img
                      src={styles.iconUrl}
                      alt="check in"
                      className="w-6 h-6 flex-shrink-0"
                    />
                    <span>{item.checkIn}</span>
                  </div>
                  <div className="flex items-center gap-[5px] text-[#392648]">
                    <img
                      src="https://api.builder.io/api/v1/image/assets/feb8ce0efd7646cb96252d2c86689552/376fb1e709884746f09aa6d948f2b8e09dd2760e?placeholderIfAbsent=true"
                      alt="check out"
                      className="w-6 h-6 flex-shrink-0"
                    />
                    <span>{item.checkOut}</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.bgColor} ${styles.textColor} px-[15px] py-1 rounded text-[12px] font-bold text-center whitespace-nowrap min-w-[66px]`}>
                {item.status === 'Present' ? 'On time' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </div>
            </div>
          </div>
        );
      })}
      {/* <Pagination /> */}
    </div>
  );
};

export default AttendanceCard;