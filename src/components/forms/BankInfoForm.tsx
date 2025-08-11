"use client";

import React, { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { LiaSave } from "react-icons/lia";
import Loading from "../ui/Loading";
import Button from "../ui/Button";
import Textbox from "../ui/Textbox";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { BankInfoFormSchema, bankInfoSchema } from "@/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBankInformation, getBackInformationById, updateBankInformation } from "@/lib/api/bankInformation";


interface BankInfoFormProps { 
    onSaved: () => void; 
    onClose: () => void; 
    employeeId: number;
    bankInfoId?: number;
}

const BankInfoForm: React.FC<BankInfoFormProps> = ({ onSaved, onClose, employeeId, bankInfoId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<BankInfoFormSchema>({
        resolver: zodResolver(bankInfoSchema),
        defaultValues: {},
    });

    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleBank = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (bankInfoId) {
                await updateBankInformation({
                    id: bankInfoId, // include the ID here
                    employee_id: employeeId,
                    bank_details: formData.bank_details,
                    bank_account_no: formData.bank_account_no,
                    ifsc_code: formData.ifsc_code,
                    branch_address: formData.branch_address,
                });
                toast.success("Bank information updated successfully");
            } else {
                await createBankInformation({
                    employee_id: employeeId,
                    bank_details: formData.bank_details,
                    bank_account_no: formData.bank_account_no || null,
                    ifsc_code: formData.ifsc_code || null,
                    branch_address: formData.branch_address || null,
                });
                toast.success("Bank information created successfully");
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
        if (!bankInfoId) {
            setIsLoading(false);
            return;
        }
        const loadBankInfo = async () => {
            setIsLoading(true);
            try {
                const response = await getBackInformationById(bankInfoId);
                const data = response.data.result.data;
                reset({
                    bank_details: data.bank_details || "",
                    bank_account_no: data.bank_account_no || "",
                    ifsc_code: data.ifsc_code || "",
                    branch_address: data.branch_address || "",
                });
            } catch (error) {
                console.error("Failed to load personal info:", error);
                toast.error("Failed to load personal information.");
            } finally {
                setIsLoading(false);
            }
        };

        loadBankInfo();
    }, [bankInfoId, reset]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
            <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white rounded-[24px] border shadow-lg transition-all duration-300 transform animate-modal-popin max-h-[90vh] overflow-y-auto">
                {isLoading ? (
                    <h1 className="p-2">Loading...</h1>
                ) : (  
                    <form onSubmit={handleBank} className="bg-white rounded-[24px] shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b p-6">
                            <h1 className="text-lg font-bold text-gray-900">{bankInfoId ? "Edit Bank Details" : "Add Bank Details"}</h1>
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
                                    label="Bank Details *"
                                    register={register("bank_details")}
                                    error={errors.bank_details ? errors.bank_details.message : ""}
                                    className="w-full rounded-lg"
                                />
                                <Textbox
                                    type="text"
                                    label="Bank account No"
                                    register={register("bank_account_no")}
                                    error={errors.bank_account_no ? errors.bank_account_no.message : ""}
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Textbox
                                    type="text"
                                    label="IFSC Code"
                                    register={register("ifsc_code")}
                                    error={errors.ifsc_code ? errors.ifsc_code.message : ""}
                                    className="w-full rounded-lg"
                                />
                                <Textbox
                                    type="text"
                                    label="Branch Address"
                                    register={register("branch_address")}
                                    error={errors.branch_address ? errors.branch_address.message : ""}
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

export default BankInfoForm;
