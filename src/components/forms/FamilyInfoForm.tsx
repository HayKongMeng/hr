"use client";

import React, { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { LiaSave } from "react-icons/lia";
import Loading from "../ui/Loading";
import Button from "../ui/Button";
import Textbox from "../ui/Textbox";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { FamilyInfoFormSchema, familyInfoSchema } from "@/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFamilyInformation, getFamilyInformationById, updateFamilyInformation } from "@/lib/api/familyInformation";


interface FamilyInfoFormProps { 
    onSaved: () => void; 
    onClose: () => void; 
    employeeId: number;
    familyInfoId?: number;
}

const FamilyInfoForm: React.FC<FamilyInfoFormProps> = ({ onSaved, onClose, employeeId, familyInfoId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FamilyInfoFormSchema>({
        resolver: zodResolver(familyInfoSchema),
        defaultValues: {},
    });

    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleFamily = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (familyInfoId) {
                await updateFamilyInformation({
                    id: familyInfoId, // include the ID here
                    employee_id: employeeId,
                    name: formData.name,
                    relationship: formData.relationship,
                    passport_expiry_date: formData.passport_expiry_date,
                    phone: formData.phone,
                });
                toast.success("Family information updated successfully");
            } else {
                await createFamilyInformation({
                    employee_id: employeeId,
                    name: formData.name,
                    relationship: formData.relationship || null,
                    passport_expiry_date: formData.passport_expiry_date,
                    phone: formData.phone || null,
                });
                toast.success("Family information created successfully");
            }
            onSaved(); 
            onClose();
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
        if (!familyInfoId) {
            setIsLoading(false);
            return;
        }
        const loadFmailyInfo = async () => {
            setIsLoading(true);
            try {
                const response = await getFamilyInformationById(familyInfoId);
                const data = response.data.result.data;
                reset({
                    name: data.name || "",
                    relationship: data.relationship || "",
                    passport_expiry_date: data.passport_expiry_date || "",
                    phone: data.phone || "",
                });
            } catch (error) {
                console.error("Failed to load family info:", error);
                toast.error("Failed to load family information.");
            } finally {
                setIsLoading(false);
            }
        };

        loadFmailyInfo();
    }, [familyInfoId, reset]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
            <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white rounded-[24px] border shadow-lg transition-all duration-300 transform animate-modal-popin max-h-[90vh] overflow-y-auto">
                {isLoading ? (
                    <h1 className="p-2">Loading...</h1>
                ) : (  
                    <form onSubmit={handleFamily} className="bg-white rounded-[24px] shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b p-6">
                            <h1 className="text-lg font-bold text-gray-900">{familyInfoId ? "Edit Family Information" : "Add Family Information"}</h1>
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
                                    label="Name *"
                                    register={register("name")}
                                    error={errors.name ? errors.name.message : ""}
                                    className="w-full rounded-lg"
                                />
                                <Textbox
                                    type="text"
                                    label="Relationship"
                                    register={register("relationship")}
                                    error={errors.relationship ? errors.relationship.message : ""}
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Textbox
                                    type="date"
                                    label="Passport Expiry Date *"
                                    register={register("passport_expiry_date")}
                                    error={errors.passport_expiry_date ? errors.passport_expiry_date.message : ""}
                                    className="w-full rounded-lg"
                                />
                                <Textbox
                                    type="text"
                                    label="Phone"
                                    register={register("phone")}
                                    error={errors.phone ? errors.phone.message : ""}
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
                )}
            </div>
        </div>
    );
};

export default FamilyInfoForm;
