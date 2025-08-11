import { AttendanceEntry } from "@/type/LeaveRequestType";

const today = new Date();

const options = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const formattedDate = today.toLocaleDateString('en-US', options);


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

export const processFullAttendanceData = (apiData: any[]) => {
  const todayString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  let todayDetails = {
    checkIn: "--:--",
    checkInStatus: "Not Checked In",
    checkOut: "--:--",
    checkOutStatus: "-",
  };

  const mappedItems: AttendanceEntry[] = apiData.map((att: any) => {
    let checkInTime = "--:--";
    let checkOutTime = "--:--";
    let status = "ontime";

    try {
      const parsedData = att.attendance_data
        ? JSON.parse(att.attendance_data)
        : {};

      if (parsedData.checkin) {
        //  THE FIX IS HERE: Apply the formatter for the items list
        checkInTime = formatTime12hr(parsedData.checkin.time);
        const rawStatus = parsedData.checkin.status?.toLowerCase();
        if (rawStatus === "late") status = "late";
        else if (rawStatus === "leave") status = "leave";
      }

      if (parsedData.checkout) {
        // AND THE FIX IS HERE: Apply the formatter for the items list
        checkOutTime = formatTime12hr(parsedData.checkout.time);
      }

      // This part for OverviewHr was already correct
      if (att.date && att.date.startsWith(todayString)) {
        if (parsedData.checkin) {
          todayDetails.checkIn = formatTime12hr(parsedData.checkin.time);
          todayDetails.checkInStatus = parsedData.checkin.status || "-";
        }
        if (parsedData.checkout) {
          todayDetails.checkOut = formatTime12hr(parsedData.checkout.time);
          todayDetails.checkOutStatus = parsedData.checkout.status || "-";
        } else {
            todayDetails.checkOutStatus = "-";
        }
      }
    } catch (err) {
      console.warn("Failed to parse attendance_data:", err);
    }

    return {
      id: String(att.id),
      dateRange: att.date
        ? new Date(att.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "",
      status,
      // Now these values are correctly formatted
      checkIn: checkInTime,
      checkOut: checkOutTime,
    };
  });

  return { mappedItems, todayDetails };
};


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