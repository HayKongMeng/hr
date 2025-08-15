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
import { LeaveTypeFormSchema, leaveTypeSchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import { createLeaveType, updateLeaveType } from "@/lib/api/leave";

const LeaveTypeForm = ({
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
    } = useForm<LeaveTypeFormSchema>({
        resolver: zodResolver(leaveTypeSchema),
        defaultValues: {
            prefix: data?.prefix || "",
            type_name: data?.type_name || "",
            max_days: data?.max_days || "",
        },
    });

    const [loading, setLoading] = useState(false);

    const handlePosition = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newLeaveType = await createLeaveType({
                    prefix: formData.prefix,
                    type_name: formData.type_name,
                    max_days: formData.max_days,
                });

                toast.success("Position created successfully");
        
                if (onSuccess) {
                    onSuccess(newLeaveType.result.data);
                }

                return;
            } else if (type === "update" && data) {
                const updatedLeaveType = await updateLeaveType(data.id, {
                    prefix: formData.prefix,
                    type_name: formData.type_name,
                    max_days: formData.max_days,
                });
        
                toast.success("Position updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedLeaveType.result.data);
                }
            }
        } catch (err) {
            setLoading(false);

            let message = "Failed to create position.";

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

    return (
        <form onSubmit={handlePosition} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {`${type === "create" ? "Add" : "Edit"} Leave Type`}
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
                        <Textbox
                            type="text"
                            name="prefix"
                            label="Prefix"
                            className="w-full rounded-full"
                            register={register("prefix")}
                            error={errors.prefix ? errors.prefix.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="type_name"
                            label="Leave Type Name"
                            className="w-full rounded-full"
                            register={register("type_name")}
                            error={errors.type_name ? errors.type_name.message : ""}
                        />
                    </div>
                        
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="number"
                            name="max_days"
                            label="Days Per Year"
                            className="w-full rounded-full"
                            register={register("max_days", { valueAsNumber: true })}
                            error={errors.max_days ? errors.max_days.message : ""}
                        />
                    </div>
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
                        label={type === "create" ? "Add Leave Type" : "Edit Leave Type"}
                    />
                </div>
            )}
        </form>
    );
};

export default LeaveTypeForm;
