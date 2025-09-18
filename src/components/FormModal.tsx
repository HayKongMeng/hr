"use client";

import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useState } from "react";
import Loading from "./ui/Loading";
import { deleteEmployee } from "@/lib/api/employee";
import { deletePosition } from "@/lib/api/position";
import { deleteCompany } from "@/lib/api/company";
import { deleteDepartment } from "@/lib/api/department";
import { RiAddLine, RiEdit2Line, RiDeleteBinLine } from "react-icons/ri";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { deleteRole } from "@/lib/api/users";
import ApprovedForm from "./forms/ApprovedForm";
import { deleteHoliday } from "@/lib/api/holidays";

const CompanyForm = dynamic(() => import("./forms/CompanyForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const EmployeeForm = dynamic(() => import("./forms/EmployeeForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const CompanyHistoryForm = dynamic(() => import("./forms/CompanyHistoryForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const PositionForm = dynamic(() => import("./forms/PositionForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const DepartmentForm = dynamic(() => import("./forms/DepartmentForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const UserForm = dynamic(() => import("./forms/UserForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const RoleForm = dynamic(() => import("./forms/RoleForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const LeaveForm = dynamic(() => import("./forms/LeaveForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const LeaveTypeForm = dynamic(() => import("./forms/LeaveTypeForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const HolidayFrom = dynamic(() => import("./forms/HolidayFrom"), {
    loading: () => <h1 className="p-2">Loading...</h1>,
});

const forms: {
    [key: string]: (type: "create" | "update", data?: any, onSuccess?: () => void, nCancel?: () => void) => JSX.Element;
} = {
    Company: (type, data, onSuccess, onCancel) => <CompanyForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    Employee: (type, data, onSuccess, onCancel) => <EmployeeForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    CompanyHistory: (type, data, onSuccess) => <CompanyHistoryForm type={type} data={data} onSuccess={onSuccess} />,
    Position: (type, data, onSuccess, onCancel) => <PositionForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel}  />,
    Department: (type, data, onSuccess, onCancel) => <DepartmentForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    User: (type, data, onSuccess, onCancel) => <UserForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    Role: (type, data, onSuccess, onCancel) => <RoleForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    Leave: (type, data, onSuccess, onCancel) => <LeaveForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    LeaveType: (type, data, onSuccess, onCancel) => <LeaveTypeForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    Attendance: (type, data, onSuccess, onCancel) => <AttendanceForm type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
    Holiday: (type, data, onSuccess, onCancel) => <HolidayFrom type={type} data={data} onSuccess={onSuccess} onCancel={onCancel} />,
};

const FormModal = ({
    table,
    type,
    data,
    id,
    onSuccess,
}: {
    table:
        | "Company"
        | "Employee"
        | "CompanyHistory"
        | "Position"
        | "Department"
        | "User"
        | "Role"
        | "Leave"
        | "LeaveType"
        | "Attendance"
        | "Holiday"
    type: "create" | "update" | "delete" | "manageLeave";
    data?: any;
    id?: number;
    onSuccess?: (data?: any) => void;
    onCancel?: () => void;
}) => {
    const [loading, setLoading] = useState(false);
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const bgColor = type === "create" ? "bg-kungkeaYellow" : type === "update" ? "bg-kungkeaGreenishColor" : type === "delete" ? "bg-kungkeaRedColor" : "bg-kungkeaGreen";

    const [open, setOpen] = useState(false);

    const iconMap: Record<"create" | "update" | "delete" | "manageLeave", JSX.Element> = {
        create: <RiAddLine className="font-semibold" size={16} />,
        update: <RiEdit2Line className="font-semibold" size={16} />,
        delete: <RiDeleteBinLine className="font-semibold" size={16} />,
        manageLeave: <IoCheckmarkDoneOutline className="font-semibold" size={16} />,
    };

    const handleSuccess = (data?: any) => {
        setOpen(false);
        if (onSuccess) {
          onSuccess(data);
        }
    };

    const Form = () => {
        if (type === "create" || type === "update") {
            console.log(`[FormModal] Rendering form for table: "${table}"`);
            console.log("[FormModal] Data received:", data);
        }
        const handleDelete = async (e: React.FormEvent) => {
            e.preventDefault();

            if (!id) return;

            try {
                setLoading(true);
                if (table === "Employee") {
                    await deleteEmployee(id);
                } else if (table === "Position") {
                    await deletePosition(id);
                } else if (table === "Company") {
                    await deleteCompany(id);
                } else if (table === "Department"){
                    await deleteDepartment(id);
                } else if (table === "Role") {
                    await deleteRole(id);
                } else if (table === "Holiday") {
                    await deleteHoliday(id);
                } else if (table === "Attendance") {

                }
                
                toast.success(`${table} deleted successful!`);

                setOpen(false);

                handleSuccess();
            } catch (error) {
                toast.error("Something went wrong while deleting.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        return type === "delete" && id ? (
            <form onSubmit={handleDelete} className="p-4 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-md bg-red-50 text-red-600 flex items-center justify-center text-xl border">
                    <RiDeleteBinLine size={30} />
                </div>
                <h1 className="text-lg font-semibold">Confirm Delete</h1>
                <span className="text-center font-medium text-gray-500">
                    You want to delete all the marked items, this cant be undone once you delete.
                </span>
                <div>
                    {loading ? (
                        <Loading /> 
                    ) : (
                        <div>
                            <button 
                                type="button" 
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="ml-5 bg-[#E70D0D] text-white py-2 px-4 rounded-md border w-max self-center">
                                <span className="flex items-center gap-2">
                                    Yes, Delete
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </form>
        ) : type === "create" || type === "update" ? (
            forms[table](type, data, handleSuccess, () => setOpen(false))
        ) : type === "manageLeave" ? (
            <ApprovedForm
                type={type}
                data={data}
                onSuccess={handleSuccess}
                onCancel={() => setOpen(false)}
            />
        ) : (
            "Form not found!"
        );
    };

return (
    <>
        {type === 'create' ? (
            <button
                className={`${size} flex items-center justify-center rounded-full text-white ${bgColor}`}
                onClick={() => setOpen(true)}
            >
                {iconMap[type]}
            </button>
        ) : (
            <button
                className={`${size} flex items-center justify-center rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-200`}
                onClick={() => setOpen(true)}
            >
                {iconMap[type]}
            </button>
        )}

        {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
                <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white rounded-[24px] border shadow-lg transition-all duration-300 transform animate-modal-popin max-h-[90vh] overflow-y-auto">
                    <Form />
                </div>
            </div>
        )}
    </>);
};

export default FormModal;