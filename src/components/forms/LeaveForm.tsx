"use client";

import { TbLibraryPlus } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { HiXMark } from "react-icons/hi2"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "../ui/Loading";
import { AxiosError } from "axios";
import { LeaveFormSchema, leaveSchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import SelectList from "../ui/SelectList";
import { createLeave, fetchAllLeaveTypes, updateLeave } from "@/lib/api/leave";
import { fetchAllEmployees } from "@/lib/api/employee";


const LeaveForm = ({
    type,
    data,
    onSuccess,
    onCancel,
}: {
    type: "create" | "update";
    data?: any;
    onSuccess?: (data?: any) => void;
    onCancel?: () => void;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LeaveFormSchema>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            start_date: data?.start_date || "",
            end_date: data?.end_date || "",
            reason: data?.reason || "",
        },
    });

    const [loadingEmployee, setLoadingEmployee] = useState(true);
    const [employeeList, setEmployeeList] = useState<{ id: number; name: string }[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);

    const [loadingLeaveType, setLoadingLeaveType] = useState(true);
    const [leaveTypeList, setLeaveTypeList] = useState<{ id: number; type_name: string }[]>([]);
    const [selectedLeaveType, setSelectedLeaveType] = useState<{ id: number; type_name: string } | null>(null);

    const [loading, setLoading] = useState(false);
    const [companyId, setCompanyId] = useState<number | null>(null);
    useEffect(() => {
        const storedCompanyId = localStorage.getItem('company_id');
        if (storedCompanyId) {
            setCompanyId(Number(storedCompanyId));
        }
    }, []);

    const handleDepartment = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newLeave = await createLeave({
                    employee_id: selectedEmployee?.id as number,
                    leave_type_id: selectedLeaveType?.id as number,
                    status_id: 1,
                    company_id: Number(companyId),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    reason: formData.reason || null,
                });

                toast.success("Leave created successfully");
        
                if (onSuccess) {
                    onSuccess(newLeave.result.data);
                }

                return;
            } else if (type === "update" && data) {
                
                const updatedLeave = await updateLeave({
                    id: data.id, 
                    employee_id: selectedEmployee?.id as number,
                    leave_type_id: selectedLeaveType?.id as number,
                    status_id: 1,
                    company_id: Number(companyId),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    reason: formData.reason || null,
                });
            
                toast.success("Leave updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedLeave.result.data);
                }
            }
        } catch (err) {
            setLoading(false);

            let message = "Failed to create leave.";

            const error = err as AxiosError<any>; // 👈 explicitly cast the error

            if (error.response?.data?.exception?.message) {
                message = error.response.data.exception.message;
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }

            toast.error(message);
            console.error("Error:", message);
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [employee, leaveTypes] = await Promise.all([
                    fetchAllEmployees(),
                    fetchAllLeaveTypes(),
                ]);
    
                setEmployeeList(employee);
                setLeaveTypeList(leaveTypes);
    
                if (employee.length > 0) {
                    if (type === "update" && data?.employee_id) {
                        const selected = employee.find(c => c.id === data.employee_id);
                        setSelectedEmployee(selected || employee[0]);
                    } else {
                        setSelectedEmployee(employee[0]);
                    }
                }

                if (leaveTypes.length > 0) {
                    if (type === "update" && data?.leave_type_id) {
                        const selected = leaveTypes.find(c => c.id === data.leave_type_id);
                        setSelectedLeaveType(selected || leaveTypes[0]);
                    } else {
                        setSelectedLeaveType(leaveTypes[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
            } finally {
                setLoadingEmployee(false);
                setLoadingLeaveType(false);
            }
        };
    
        loadData();
    }, [type, data]);
     

    return (
        <form onSubmit={handleDepartment} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {`${type === "create" ? "Add" : "Edit"} Leave`}
                </h1>
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onCancel}
                    className="p-0.5 rounded-full bg-gray-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    <HiXMark size={15} className="text-white" />
                </button>
            </div>
            <div className="pr-6 pl-6 pt-6 space-y-6">
                <div className="mt-2 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <SelectList
                            lists={employeeList.map((employee) => employee.name)}
                            selected={selectedEmployee ? selectedEmployee.name : ""}
                            setSelected={(employeeName) =>
                                setSelectedEmployee(
                                    employeeList.find((employee) => employee.name === employeeName) || null
                                )
                            }
                            label="Employee Name"
                            disabled={loadingEmployee} 
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <SelectList
                            lists={leaveTypeList.map((leaveType) => leaveType.type_name)}
                            selected={selectedLeaveType ? selectedLeaveType.type_name : ""}
                            setSelected={(type_name) =>
                                setSelectedLeaveType(
                                    leaveTypeList.find((leaveType) => leaveType.type_name === type_name) || null
                                )
                            }
                            label="Leave Type"
                            disabled={loadingLeaveType} 
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="date"
                            name="start_date"
                            label="From"
                            className="w-full rounded-full"
                            register={register("start_date")}
                            error={errors.start_date ? errors.start_date.message : ""}
                        />
                        <Textbox
                            type="date"
                            name="end_date"
                            label="To"
                            className="w-full rounded-full"
                            register={register("end_date")}
                            error={errors.end_date ? errors.end_date.message : ""}
                        />
                    </div>
                    <Textarea 
                        name="reason"
                        label="Reason"
                        className="w-full rounded-[14px]"
                        register={register("reason")}
                        error={errors.reason ? errors.reason.message : ""}
                    />
                </div>
            </div>
              {loading ? (
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 pr-6 pl-6 border-t">
                    <Loading />
                </div>
            ) : (
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 pr-6 pl-6 border-t">
                    <Button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full"
                        icon={<HiXMark size={18} />}
                        label="Cancel"
                    />
                    <Button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 bg-[#F26522] border border-[#F26522] text-sm font-semibold text-white hover:bg-[#d4541c] rounded-full"
                        icon={type === "create" ? <TbLibraryPlus size={18} /> : <FaRegEdit size={18} />}
                        label={type === "create" ? "Add Leave" : "Edit Leave"}
                    />
                </div>
            )}
        </form>
    );
};

export default LeaveForm;
