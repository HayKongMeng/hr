"use client";

import React, { useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { LiaSave } from "react-icons/lia";
import Loading from "../ui/Loading";
import Button from "../ui/Button";
import Textbox from "../ui/Textbox";
import { toast } from "sonner";
import { EmergencyContactPayload, createEmergencyContacts } from "@/lib/api/employee";
import { EmergencyContactFormSchema, emergencyContactSchema } from "@/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface EmergencyContactFormProps {
    onClose: () => void;
    employeeId: number;
    onSaved: () => void;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({ onSaved, onClose, employeeId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmergencyContactFormSchema>({
        resolver: zodResolver(emergencyContactSchema),
        defaultValues: {},
    });

    const [loading, setLoading] = useState(false);

    const handleEmergencyContact = handleSubmit(async (formData) => {
        setLoading(true);
       
        try {
            emergencyContactSchema.parse(formData);
            const payload: EmergencyContactPayload[] = [
                {
                    ...formData.primaryContact,
                    employee_id: employeeId,
                    contact_type: "primary",
                },
                {
                    ...formData.secondaryContact,
                    employee_id: employeeId,
                    contact_type: "secondary",
                },
            ];
            await createEmergencyContacts(payload);
            toast.success("Emergency contacts saved.");
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
                <form onSubmit={handleEmergencyContact} className="bg-white rounded-[24px] shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b p-6">
                        <h1 className="text-lg font-bold text-gray-900">Emergency Contact Details</h1>
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
                        <p className="font-semibold">Primary Contact Details</p>
                        <div className="flex gap-4">
                            <Textbox
                                type="text"
                                label="Name *"
                                {...register("primaryContact.name")}
                                error={errors.primaryContact?.name?.message}
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                label="Relationship"
                                {...register("primaryContact.relationship")}
                                error={errors.primaryContact?.relationship?.message}
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Textbox
                                type="text"
                                label="Phone No 1 *"
                                {...register("primaryContact.phone1")}
                                error={errors.primaryContact?.phone1?.message}
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                label="Phone No 2"
                                {...register("primaryContact.phone2")}
                                error={errors.primaryContact?.phone2?.message}
                                className="w-full rounded-lg"
                            />
                        </div>
                    
                        <p className="font-semibold pt-4">Secondary Contact Details</p>
                        <div className="flex gap-4">
                            <Textbox
                                type="text"
                                label="Name *"
                                {...register("secondaryContact.name")}
                                error={errors.secondaryContact?.name?.message}
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                label="Relationship"
                                {...register("secondaryContact.relationship")}
                                error={errors.secondaryContact?.relationship?.message}
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Textbox
                                type="text"
                                label="Phone No 1 *"
                                {...register("secondaryContact.phone1")}
                                error={errors.secondaryContact?.phone1?.message}
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                label="Phone No 2"
                                {...register("secondaryContact.phone2")}
                                error={errors.secondaryContact?.phone2?.message}
                                className="w-full rounded-lg"
                            />
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

export default EmergencyContactForm;
