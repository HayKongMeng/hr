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
import { HolidayFormSchema, holidaySchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import SelectList from "../ui/SelectList";
import { createHoliday, updateHoliday } from "@/lib/api/holidays";

const HolidayFrom = ({
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
    } = useForm<HolidayFormSchema>({
        resolver: zodResolver(holidaySchema),
        defaultValues: {
            name: data?.name || "",
            start_date: data?.start_date || "",
            end_date: data?.end_date || "",
            description: data?.description || "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [isRecurring, setIsRecurring] = useState<boolean>(false);
    type HolidayType = 'Public' | 'Optional' | 'Company' | 'Regional';
    const [selectedTypes, setSelectedTypes] = useState<HolidayType>('Public');
    const typeOptions: HolidayType[] = ['Public', 'Optional', 'Company', 'Regional'];


    useEffect(() => {
        if (type === "update" && data?.type) {
            setSelectedTypes(data.type);
        }
        if (type === "update" && data.is_recurring === "boolean") {
            setIsRecurring(data.is_recurring);
        }
    }, [data, type]);

    const handleHoliday = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newPosition = await createHoliday({
                    name: formData.name,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    description: formData.description || null,
                    type: selectedTypes,
                    is_recurring: isRecurring
                });

                toast.success("Position created successfully");
        
                if (onSuccess) {
                    onSuccess(newPosition.result.data);
                }

                return;
            } else if (type === "update" && data) {
                
                const updatedPosition = await updateHoliday({
                    id: data.id, 
                    name: formData.name,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    description: formData.description || null,
                    type: selectedTypes,
                    is_recurring: isRecurring
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
        <form onSubmit={handleHoliday} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {`${type === "create" ? "Add" : "Edit"} Holiday`}
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
                            name="name"
                            label="Occasion"
                            className="w-full rounded-full"
                            register={register("name")}
                            error={errors.name ? errors.name.message : ""}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5">
                        <Textbox
                            type="date"
                            name="start_date"
                            label="Start Date"
                            className="w-full rounded-full"
                            register={register("start_date")}
                            error={errors.start_date ? errors.start_date.message : ""}
                        />
                        <Textbox
                            type="date"
                            name="end_date"
                            label="End Date"
                            className="w-full rounded-full"
                            register={register("end_date")}
                            error={errors.end_date ? errors.end_date.message : ""}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5">
                        <SelectList
                            lists={typeOptions}
                            selected={selectedTypes}
                            setSelected={setSelectedTypes}
                            label="Type"
                        />
                    </div>
                    <div className="flex flex-col gap-5">
                        <label className="inline-flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={() => setIsRecurring(!isRecurring)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700"> Recurring Holiday (repeats every year)</span>
                        </label>

                        <Textarea 
                            name="description"
                            label="Description"
                            className="w-full rounded-[16px]"
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
                        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full"
                        icon={<HiXMark size={18} />}
                        label="Cancel"
                    />
                    <Button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 bg-[#F26522] border border-[#F26522] text-sm font-semibold text-white hover:bg-[#d4541c] rounded-full"
                        icon={type === "create" ? <TbLibraryPlus size={18} /> : <FaRegEdit size={18} />}
                        label={type === "create" ? "Add Holiday" : "Edit Holiday"}
                    />
                </div>
            )}
        </form>
    );
};

export default HolidayFrom;
