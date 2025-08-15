import { AttendanceEntry } from "@/type/LeaveRequestType";
import moment from "moment";

const today = new Date();

export const formattedDate = today.toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});



export const formatTime12hr = (time24: string): string => {
  if (!time24 || !time24.includes(":")) return "--:--";
  const [h, m] = time24.split(":");
  let hour = parseInt(h, 10);
  const minute = parseInt(m, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // The hour '0' should be '12'
  const minuteStr = minute < 10 ? "0" + minute : String(minute);
  return `${hour}:${minuteStr} ${ampm}`;
};

// export const processFullAttendanceData = (apiData: any[]) => {
  
//   const todayString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
//   let todayDetails = {
//     checkIn: "--:--",
//     checkInStatus: "Not Checked In",
//     checkOut: "--:--",
//     checkOutStatus: "-",
//   };

//   const mappedItems: AttendanceEntry[] = apiData.map((att: any) => {
//     let checkInTime = "--:--";
//     let checkOutTime = "--:--";
//     let status = "ontime";

//     try {
//       const parsedData = att.attendance_data
//         ? JSON.parse(att.attendance_data)
//         : {};

//       if (parsedData.checkin) {
//         checkInTime = formatTime12hr(parsedData.checkin.time);
//         const rawStatus = parsedData.checkin.status?.toLowerCase();
//         if (rawStatus === "late") status = "late";
//         else if (rawStatus === "leave") status = "leave";
//       }

//       if (parsedData.checkout) {
//         checkOutTime = formatTime12hr(parsedData.checkout.time);
//       }

//       // This part for OverviewHr was already correct
//       if (att.date && att.date.startsWith(todayString)) {
//         if (parsedData.checkin) {
//           todayDetails.checkIn = formatTime12hr(parsedData.checkin.time);
//           todayDetails.checkInStatus = parsedData.checkin.status || "-";
//         }
//         if (parsedData.checkout) {
//           todayDetails.checkOut = formatTime12hr(parsedData.checkout.time);
//           todayDetails.checkOutStatus = parsedData.checkout.status || "-";
//         } else {
//             todayDetails.checkOutStatus = "-";
//         }
//       }
//     } catch (err) {
//       console.warn("Failed to parse attendance_data:", err);
//     }

//     return {
//       id: String(att.id),
//       dateRange: att.date
//         ? new Date(att.date).toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//           })
//         : "",
//       status,
//       // Now these values are correctly formatted
//       checkIn: checkInTime,
//       checkOut: checkOutTime,
//     };
//   });

//   const presentsCount = mappedItems.filter(item => item.checkInStatus === 'Present').length;
//   const lateCount = mappedItems.filter(item => item.checkInStatus === 'Late').length;

//   return {
//     mappedItems,
//     todayDetails,
//     presentsCount,
//     lateCount,
//   };
// };

export type MappedAttendanceItem = {
  id: string;
  date: string;
  day: string;
  status: 'Present' | 'Absent' | 'Late';
  checkIn: string;
  checkOut: string;
};

export function processFullAttendanceData(apiData: any[]): {
  mappedItems: MappedAttendanceItem[];
  todayDetails: {
    checkIn: string;
    checkInStatus: string;
    checkOut: string;
    checkOutStatus: string;
  };
  presentsCount: number;
  lateCount: number;
} {
  const todayString = moment().format("YYYY-MM-DD");
  let todayDetails = {
    checkIn: "--:--",
    checkInStatus: "Absent",
    checkOut: "--:--",
    checkOutStatus: "-",
  };
  let presentsCount = 0;
  let lateCount = 0;

  if (!Array.isArray(apiData)) {
    console.error("processFullAttendanceData expects an array, but received:", apiData);
    return { mappedItems: [], todayDetails, presentsCount, lateCount };
  }

  const mappedItems: MappedAttendanceItem[] = apiData.map((att: any) => {
    let checkInTime = "--:--";
    let checkOutTime = "--:--";
    let status: 'Present' | 'Absent' | 'Late' = 'Absent';
    let checkInStatusForToday = 'Absent';

    const rawData = att.attendance_data;

    try {
      // --- ROBUST PARSING LOGIC ---
      let checkinInfo: any = null;
      let checkoutInfo: any = null;

      if (typeof rawData === 'string') {
        // Handle the OLD format (JSON string)
        const parsedData = JSON.parse(rawData);
        checkinInfo = parsedData.checkin;
        checkoutInfo = parsedData.checkout;
      } else if (Array.isArray(rawData) && rawData.length > 0) {
        const data = rawData[0];
        checkinInfo = { status: data.status, time: data.clock_in || "00:00:00" };
        checkoutInfo = { status: data.early_leaving ? "Left Early" : "On Time", time: data.clock_out };
      }

      // --- UNIFIED PROCESSING LOGIC ---
      if (checkinInfo && checkinInfo.time) {
        presentsCount++;
        checkInTime = formatTime12hr(checkinInfo.time);
        status = (checkinInfo.status?.toLowerCase() === 'late' || checkinInfo.late === true) ? 'Late' : 'Present';
        if (status === 'Late') {
            lateCount++;
        }
      }

      if (checkoutInfo && checkoutInfo.time) {
        checkOutTime = formatTime12hr(checkoutInfo.time);
      }

      if (att.date === todayString) {
        todayDetails.checkIn = checkInTime;
        todayDetails.checkInStatus = status;
        todayDetails.checkOut = checkOutTime;
        todayDetails.checkOutStatus = checkoutInfo?.status || "-";
      }

    } catch (err) {
      console.warn(`Failed to parse attendance_data for record id ${att.id}:`, rawData);
    }

    return {
      id: String(att.id),
      date: moment(att.date).format("ddd, DD MMM"),
      day: moment(att.date).format('dddd'),
      status: status,
      checkIn: checkInTime,
      checkOut: checkOutTime,
    };
  });
  
  return { mappedItems, todayDetails, presentsCount, lateCount };
}




export function getTodayCheckStatus(items: AttendanceEntry[]): "checkedIn" | "checkedOut" | "notCheckedIn" {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const todayEntry = items.find((item: any) => item.dateRange === today);

    if (todayEntry) {
      if (
        todayEntry.checkIn &&
        todayEntry.checkIn !== "-" && todayEntry.checkIn !== "--:--" &&
        (!todayEntry.checkOut || todayEntry.checkOut === "-" || todayEntry.checkOut === "--:--")
      ) {
        return "checkedIn";
      }
      if (!todayEntry.checkIn || todayEntry.checkIn === "-" || todayEntry.checkIn === "--:--") {
        return "notCheckedIn";
      }
      if (
        todayEntry.checkIn &&
        todayEntry.checkIn !== "-" && todayEntry.checkIn !== "--:--" &&
        todayEntry.checkOut &&
        todayEntry.checkOut !== "-" && todayEntry.checkOut !== "--:--"
      ) {
        return "checkedOut";
      }
    }
    return "notCheckedIn";
}