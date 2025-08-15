"use client";

import { TbLibraryPlus } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { HiXMark } from "react-icons/hi2"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { createDepartment, updateDepartment } from "@/lib/api/department";
import { toast } from "sonner";
import Loading from "../ui/Loading";
import { AxiosError } from "axios";
import { DepartmentFormSchema, departmentSchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import SelectList from "../ui/SelectList";
import { fetchAllCompanies } from "@/lib/api/company";


const DepartmentForm = ({
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
    } = useForm<DepartmentFormSchema>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            code: data?.code || "",
            name: data?.name || "",
            description: data?.description || "",
        },
    });

    const [loadingCompany, setLoadingCompany] = useState(true);
    const [companyList, setCompanyList] = useState<{ id: number; name: string }[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<{ id: number; name: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const statusOptions = ["Active", "Inactive"];
    
    const [selectedStatus, setSelectedStatus] = useState("Active");
    const isActive = selectedStatus === "Active";

    useEffect(() => {
        if (type === "update" && data) {
            setSelectedStatus(data.status ? "Active" : "Inactive");
        }
    }, [data, type]);

    const handleDepartment = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newDepartment = await createDepartment({
                    company_id: selectedCompany?.id as number,
                    code: formData.code,
                    name: formData.name,
                    description: formData.description || null,
                    status: isActive,
                });

                toast.success("Department created successfully");
        
                if (onSuccess) {
                    onSuccess(newDepartment.result.data);
                }

                return;
            } else if (type === "update" && data) {
                
                const updatedDepartment = await updateDepartment(data.id, {
                    company_id: selectedCompany?.id as number,
                    code: formData.code,
                    name: formData.name,
                    description: formData.description || null,
                    status: isActive,
                });
            
                toast.success("Department updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedDepartment.result.data);
                }
            }
        } catch (err) {
            setLoading(false);

            let message = "Failed to create department.";

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
                const [company] = await Promise.all([
                    fetchAllCompanies(),
                ]);
    
                setCompanyList(company);
    
                if (company.length > 0) {
                    if (type === "update" && data?.company_id) {
                        const selected = company.find(c => c.id === data.company_id);
                        setSelectedCompany(selected || company[0]);
                    } else {
                        setSelectedCompany(company[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
            } finally {
                setLoadingCompany(false);
            }
        };
    
        loadData();
    }, [type, data]);
     

    return (
        <form onSubmit={handleDepartment} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {`${type === "create" ? "Add" : "Edit"} Department`}
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
                            label="Department"
                            className="w-full rounded-lg"
                            register={register("name")}
                            error={errors.name ? errors.name.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <SelectList
                            lists={companyList.map((company) => company.name)}
                            selected={selectedCompany ? selectedCompany.name : ""}
                            setSelected={(companyName) =>
                                setSelectedCompany(
                                    companyList.find((company) => company.name === companyName) || null
                                )
                            }
                            label="Select Company"
                            disabled={loadingCompany}
                            className="w-full rounded-lg" 
                        />
                        <SelectList
                            lists={statusOptions}
                            selected={selectedStatus}
                            setSelected={setSelectedStatus}
                            label="Status"
                             className="w-full rounded-lg"
                        />
                    </div>
                   
                    <Textarea 
                        name="description"
                        label="Description"
                        className="w-full rounded-lg"
                        register={register("description")}
                        error={errors.description ? errors.description.message : ""}
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
                        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        icon={<HiXMark size={18} />}
                        label="Cancel"
                    />
                    <Button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 bg-[#F26522] border border-[#F26522] text-sm font-semibold text-white hover:bg-[#d4541c] rounded-lg"
                        icon={type === "create" ? <TbLibraryPlus size={18} /> : <FaRegEdit size={18} />}
                        label={type === "create" ? "Add Department" : "Edit Department"}
                    />
                </div>
            )}
        </form>
    );
};

export default DepartmentForm;
