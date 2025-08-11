"use client";

import React, { useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { LiaSave } from "react-icons/lia";
import Loading from "../ui/Loading";
import Button from "../ui/Button";
import Textbox from "../ui/Textbox";
import { toast } from "sonner";
import { ExperienceFormSchema, experienceSchema } from "@/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExperience } from "@/lib/api/experience";

interface ExperienceFormProps {
    onClose: () => void;
    employeeId: number;
    onSaved: () => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ onSaved, onClose, employeeId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ExperienceFormSchema>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {},
    });

    const [loading, setLoading] = useState(false);

    const handleEducation = handleSubmit(async (formData) => {
        setLoading(true);
       
        try {
            await createExperience({
                employee_id: employeeId,
                previous_company_name: formData.previous_company_name,
                designation: formData.designation,
                start_date: formData.start_date,
                end_date: formData.end_date,
                is_current: formData.is_current
            });
            toast.success("Experience saved.");
            onSaved(); 
            onClose();
        } catch (error) {
            console.error("Submit failed", error);
            toast.error("Failed to save contacts.");
        } finally {
            setLoading(false);
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
            <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white rounded-[24px] border shadow-lg transition-all duration-300 transform animate-modal-popin max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleEducation} className="bg-white rounded-[24px] shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b p-6">
                        <h1 className="text-lg font-bold text-gray-900">Company Information</h1>
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={onClose}
                            className="p-0.5 rounded-full bg-gray-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <HiXMark size={15} className="text-white" />
                        </button>
                    </div>

                    <div className="px-6 pt-6 space-y-6 text-sm text-gray-700">
                        <div className="flex gap-4">
                            <Textbox
                                type="text"
                                label="Previous Company Name *"
                                register={register("previous_company_name")}
                                error={errors.previous_company_name ? errors.previous_company_name.message : ""}
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                label="Designation *"
                                register={register("designation")}
                                error={errors.designation ? errors.designation.message : ""}
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Textbox
                                type="date"
                                label="Start Date *"
                                register={register("start_date")}
                                error={errors.start_date ? errors.start_date.message : ""}
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="date"
                                label="End Date *"
                                register={register("end_date")}
                                error={errors.end_date ? errors.end_date.message : ""}
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_current"
                                    {...register("is_current")}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_current" className="text-sm text-gray-700">
                                    Check if you working present
                                </label>
                            </div>

                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 px-6 border-t">
                        {loading ? (
                            <Loading />
                        ) : (
                        <>
                            <Button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                                icon={<HiXMark size={18} />}
                                label="Cancel"
                            />
                            <Button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 bg-[#6fd943] border border-[#6fd943] text-sm font-semibold text-white hover:bg-[#48a522] rounded-lg"
                                icon={<LiaSave size={18} />}
                                label="Save"
                            />
                        </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExperienceForm;
