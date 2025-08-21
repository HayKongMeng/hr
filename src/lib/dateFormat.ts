import moment from "moment";

// A simple utility to get today's date for display
export const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

// A utility to format 24hr time to 12hr time with AM/PM
export const formatTime12hr = (time24: string): string => {
    if (!time24 || !time24.includes(":")) return "--:--";
    // Use moment for robust and simple time formatting
    return moment(time24, "HH:mm:ss").format("h:mm a");
};

// Define the shape of the processed attendance item for type safety
export type MappedAttendanceItem = {
    id: string;
    date: string; // For display, e.g., "Thu, 21 Aug"
    dateForCompare: string; // For reliable comparison, e.g., "2025-08-21"
    day: string;
    status: 'Present' | 'Absent' | 'Late';
    checkIn: string;
    checkOut: string;
};

// This is now the single source of truth for processing all attendance data
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
        return { mappedItems: [], todayDetails,presentsCount: 0, lateCount: 0 };
    }

    const mappedItems: MappedAttendanceItem[] = apiData.map((att: any) => {
        let checkInTime = "--:--";
        let checkOutTime = "--:--";
        let status: 'Present' | 'Absent' | 'Late' = 'Absent';

        try {
            let checkinInfo: any = null;
            let checkoutInfo: any = null;

            // The API returns attendance_data as a JSON string, so we must parse it
            if (att.attendance_data) {
                const parsedData = JSON.parse(att.attendance_data);
                checkinInfo = parsedData.checkin;
                checkoutInfo = parsedData.checkout;
            }

            if (checkinInfo && checkinInfo.time) {
                presentsCount++;
                checkInTime = moment(checkinInfo.time, "HH:mm:ss").format("h:mm a");
                status = checkinInfo.status?.toLowerCase() === 'late' ? 'Late' : 'Present';
                if (status === 'Late') {
                    lateCount++;
                }
            }

            if (checkoutInfo && checkoutInfo.time) {
                checkOutTime = formatTime12hr(checkoutInfo.time);
            }

            // --- FIX #1: Use `startsWith` for reliable date comparison ---
            // This correctly finds today's record from the full timestamp
            if (att.date && att.date.startsWith(todayString)) {
                todayDetails.checkIn = checkInTime;
                todayDetails.checkInStatus = status;
                todayDetails.checkOut = checkOutTime;
                todayDetails.checkOutStatus = checkoutInfo?.status || "-";
            }

        } catch (err) {
            console.warn(`Failed to parse attendance_data for record id ${att.id}:`, att.attendance_data, err);
        }

        return {
            id: String(att.id),
            date: moment(att.date).format("ddd, DD MMM"),
            dateForCompare: moment(att.date).format("YYYY-MM-DD"),
            day: moment(att.date).format('dddd'),
            status: status,
            checkIn: checkInTime,
            checkOut: checkOutTime,
        };
    });

    return { mappedItems, todayDetails, presentsCount, lateCount };
}


// --- FIX #2: Corrected `getTodayCheckStatus` ---
// This function now uses the correct types and logic to match the data structure.
export function getTodayCheckStatus(items: MappedAttendanceItem[]): "checkedIn" | "checkedOut" | "notCheckedIn" {
    // Use the same reliable format as the data processing function
    const today = moment().format("YYYY-MM-DD");

    // Find today's entry by comparing the correct property
    const todayEntry = items.find((item) => item.dateForCompare === today);

    if (todayEntry) {
        // Check if checked in but not checked out
        if (
            todayEntry.checkIn && todayEntry.checkIn !== "--:--" &&
            (!todayEntry.checkOut || todayEntry.checkOut === "--:--")
        ) {
            return "checkedIn";
        }
        // Check if not checked in at all
        if (!todayEntry.checkIn || todayEntry.checkIn === "--:--") {
            return "notCheckedIn";
        }
        // Check if both checked in and checked out
        if (
            todayEntry.checkIn && todayEntry.checkIn !== "--:--" &&
            todayEntry.checkOut && todayEntry.checkOut !== "--:--"
        ) {
            return "checkedOut";
        }
    }
    // Default to not checked in if no entry is found for today
    return "notCheckedIn";
}