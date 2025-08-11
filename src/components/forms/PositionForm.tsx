"use client";

import { TbLibraryPlus } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { HiXMark } from "react-icons/hi2"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { createPosition, updatePosition } from "@/lib/api/position";
import { toast } from "sonner";
import Loading from "../ui/Loading";
import { AxiosError } from "axios";
import { PositionFormSchema, positionSchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import SelectList from "../ui/SelectList";

const PositionForm = ({
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
    } = useForm<PositionFormSchema>({
        resolver: zodResolver(positionSchema),
        defaultValues: {
            code: data?.code || "",
            title: data?.title || "",
            description: data?.description || "",
        },
    });

    const [loading, setLoading] = useState(false);
    const statusOptions = ["Active", "Inactive"];
    
    const [selectedStatus, setSelectedStatus] = useState("Active");
    const isActive = selectedStatus === "Active";

    useEffect(() => {
        if (type === "update" && data) {
            setSelectedStatus(data.status ? "Active" : "Inactive");
        }
    }, [data, type]);

    const handlePosition = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newPosition = await createPosition({
                    code: formData.code,
                    title: formData.title,
                    description: formData.description || null,
                    status: isActive,
                });

                toast.success("Position created successfully");
        
                if (onSuccess) {
                    onSuccess(newPosition.result.data);
                }

                return;
            } else if (type === "update" && data) {
                
                const updatedPosition = await updatePosition({
                    id: data.id, 
                    code: formData.code,
                    title: formData.title,
                    description: formData.description,
                    status: isActive,
                });
        
                toast.success("Position updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedPosition.result.data);
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
                    {`${type === "create" ? "Add" : "Edit"} Designation`}
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
                            name="code"
                            label="Code"
                            className="w-full rounded-lg"
                            register={register("code")}
                            error={errors.code ? errors.code.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="title"
                            label="Designation Name"
                            className="w-full rounded-lg"
                            register={register("title")}
                            error={errors.title ? errors.title.message : ""}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5">
                        <SelectList
                            lists={statusOptions}
                            selected={selectedStatus}
                            setSelected={setSelectedStatus}
                            label="Status"
                            className="w-full rounded-lg"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5">
                        <Textarea 
                            name="description"
                            label="Description"
                            className="w-full rounded-lg"
                            register={register("description")}
                            error={errors.description ? errors.description.message : ""}
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
                        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        icon={<HiXMark size={18} />}
                        label="Cancel"
                    />
                    <Button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 bg-[#F26522] border border-[#F26522] text-sm font-semibold text-white hover:bg-[#d4541c] rounded-lg"
                        icon={type === "create" ? <TbLibraryPlus size={18} /> : <FaRegEdit size={18} />}
                        label={type === "create" ? "Add Designation" : "Edit Designation"}
                    />
                </div>
            )}
        </form>
    );
};

export default PositionForm;
