"use client";

import React, { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { LiaSave } from "react-icons/lia";
import Loading from "../ui/Loading";
import Button from "../ui/Button";
import Textbox from "../ui/Textbox";
import { AxiosError } from "axios";
import { toast } from "sonner";
import SelectList from "../ui/SelectList";
import { PersonalInfoFormSchema, personalInfoSchema } from "@/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchMaritalStatuses, fetchNationality } from "@/lib/api/status";
import { createPersonalInformation, getPersonalInformationById, updatePersonalInformation } from "@/lib/api/personalinformation";
import { nullable, number } from "zod";


interface PersoalInfoFormProps { 
    onSaved: () => void; 
    onClose: () => void; 
    employeeId: number;
    personalInfoId?: number;
}

const PersonalInfoForm: React.FC<PersoalInfoFormProps> = ({ onSaved, onClose, employeeId, personalInfoId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PersonalInfoFormSchema>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {},
    });

    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [loadingNationality, setLoadingNationality] = useState(true);
    const [loadingMaritalStatus, setLoadingMaritalStatus] = useState(true);
    const [nationalityList, setNationalityList] = useState<{ id: number; country_name: string }[]>([]);
    const [selectedNationality, setSelectedNationality] = useState<{ id: number; country_name: string } | null>(null);
    const [maritalStatusList, setMaritalStatusList] = useState<{ id: number; status_name: string }[]>([]);
    const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<{ id: number; status_name: string } | null>(null);

    const handlePersonal = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (personalInfoId) {
                await updatePersonalInformation({
                    id: personalInfoId, // include the ID here
                    employee_id: employeeId,
                    passport_no: formData.passport_no,
                    passport_expiry_date: formData.passport_expiry_date,
                    nationality_id: selectedNationality?.id as number,
                    marital_status_id: selectedMaritalStatus?.id as number,
                    religion: formData.religion,
                    employment_spouse: formData.employment_spouse,
                    number_of_children: formData.number_of_children,
                });
                toast.success("Personal information updated successfully");
            } else {
                await createPersonalInformation({
                    employee_id: employeeId,
                    passport_no: formData.passport_no,
                    passport_expiry_date: formData.passport_expiry_date,
                    nationality_id: selectedNationality?.id as number,
                    marital_status_id: selectedMaritalStatus?.id as number,
                    religion: formData.religion,
                    employment_spouse: formData.employment_spouse,
                    number_of_children: formData.number_of_children,
                });
                toast.success("Personal information created successfully");
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
        const loadData = async () => {
            try {
                const [national, maritalStatus] = await Promise.all([
                    fetchNationality(),
                    fetchMaritalStatuses(),
                ]);
                setNationalityList(national);
                setMaritalStatusList(maritalStatus);
                setSelectedNationality(national[0]);
                setSelectedMaritalStatus(maritalStatus[0]);
            } catch (error){
                console.error("Failed to fetch dropdown data:", error);
            } finally {
                setLoadingNationality(false);
                setLoadingMaritalStatus(false);
            }
        }
        loadData();
    }, []); 
    useEffect(() => {
        if (!personalInfoId) {
            setIsLoading(false);
            return;
        }
        const loadPersonalInfo = async () => {
            if (loadingNationality || loadingMaritalStatus) return;

            setIsLoading(true);
            try {
                const response = await getPersonalInformationById(personalInfoId);
                const data = response.data.result.data;
                reset({
                    passport_no: data.passport_no || "",
                    passport_expiry_date: data.passport_expiry_date || "",
                    religion: data.religion || "",
                    employment_spouse: data.employment_spouse || "",
                    number_of_children: data.number_of_children || "",
                });

                // ⬇️ Set nationality
                if (data.nationality_id) {
                    const nationality = nationalityList.find(n => n.id === data.nationality_id);
                    setSelectedNationality(nationality || null);
                }

                // ⬇️ Set marital status
                if (data.marital_status_id) {
                    const marital = maritalStatusList.find(m => m.id === data.marital_status_id);
                    setSelectedMaritalStatus(marital || null);
                }
            } catch (error) {
                console.error("Failed to load personal info:", error);
                toast.error("Failed to load personal information.");
            } finally {
                setIsLoading(false);
            }
        };

        loadPersonalInfo();
    }, [personalInfoId, nationalityList, maritalStatusList, loadingNationality, loadingMaritalStatus, reset]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
            <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white rounded-[24px] border shadow-lg transition-all duration-300 transform animate-modal-popin max-h-[90vh] overflow-y-auto">
                {isLoading ? (
                    <h1 className="p-2">Loading...</h1>
                ) : (  
                    <form onSubmit={handlePersonal} className="bg-white rounded-[24px] shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b p-6">
                            <h1 className="text-lg font-bold text-gray-900">{personalInfoId ? "Edit Personal Info" : "Add Personal Info"}</h1>
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
                                    label="Passport No *"
                                    register={register("passport_no")}
                                    error={errors.passport_no ? errors.passport_no.message : ""}
                                    className="w-full rounded-lg"
                                />
                                <Textbox
                                    type="date"
                                    label="Passport Expiry Date *"
                                    register={register("passport_expiry_date")}
                                    error={errors.passport_expiry_date ? errors.passport_expiry_date.message : ""}
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <div className="flex gap-4">
                                <SelectList
                                    lists={nationalityList.map((countryName) => countryName.country_name)} // Extract the name if you only want the name
                                    selected={selectedNationality ? selectedNationality.country_name : ""}
                                    setSelected={(country_name) =>
                                        setSelectedNationality(
                                            nationalityList.find((countryName) => countryName.country_name === country_name) || null
                                        )
                                    }
                                    label="Select Nationality"
                                    disabled={loadingNationality} 
                                    className="w-full rounded-lg"
                                />
                                <SelectList
                                    lists={maritalStatusList.map((marital_status) => marital_status.status_name)} // Extract the name if you only want the name
                                    selected={selectedMaritalStatus ? selectedMaritalStatus.status_name : ""}
                                    setSelected={(marital_status_name) =>
                                        setSelectedMaritalStatus(
                                            maritalStatusList.find((marital_status) => marital_status.status_name === marital_status_name) || null
                                        )
                                    }
                                    label="Select Marital Status"
                                    disabled={loadingMaritalStatus}
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Textbox
                                    type="text"
                                    label="Religion"
                                    register={register("religion")}
                                    error={errors.religion ? errors.religion.message : ""}
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Textbox
                                    type="text"
                                    label="Employment spouse"
                                    register={register("employment_spouse")}
                                    error={errors.employment_spouse ? errors.employment_spouse.message : ""}
                                    className="w-full rounded-lg"
                                />
                                <Textbox
                                    type="text"
                                    label="No. of children"
                                    register={register("number_of_children")}
                                    error={errors.number_of_children ? errors.number_of_children.message : ""}
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

export default PersonalInfoForm;
