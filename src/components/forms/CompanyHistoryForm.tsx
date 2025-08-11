"use client";

import { TbLibraryPlus } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { createDepartment, updateDepartment } from "@/lib/api/department";
import { toast } from "sonner";
import Loading from "../ui/Loading";
import { AxiosError } from "axios";
import { companyHistoryFormSchema, companyHistorySchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import SelectList from "../ui/SelectList";
import { fetchAllCompanies } from "@/lib/api/company";
import { createCompanyHistory, updateCompanyHistory } from "@/lib/api/companyHistory";
import { fetchAllEmployees } from "@/lib/api/employee";


const DepartmentForm = ({
    type,
    data,
    onSuccess,
}: {
    type: "create" | "update";
    data?: any;
    onSuccess?: (data?: any) => void;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<companyHistoryFormSchema>({
        resolver: zodResolver(companyHistorySchema),
        defaultValues: {
            start_date: data?.start_date || "",
            end_date: data?.end_date || "",
            notes: data?.notes || "",
        },
    });

    const [loadingCompany, setLoadingCompany] = useState(true);
    const [companyList, setCompanyList] = useState<{ id: number; name: string }[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<{ id: number; name: string } | null>(null);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [EmployeesList, setEmployeesList] = useState<{ id: number; name: string }[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<{ id: number; name: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCompanyHistory = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newDepartment = await createCompanyHistory({
                    company_id: selectedCompany?.id as number,
                    employee_id: selectedEmployees?.id as number,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    notes: formData.notes || null,
                });

                toast.success("Company history created successfully!");
        
                if (onSuccess) {
                    onSuccess(newDepartment.result.data);
                }

                return;
            } else if (type === "update" && data) {
                
                const updatedDepartment = await updateCompanyHistory({
                    id: data.id, 
                    company_id: selectedCompany?.id as number,
                    employee_id: selectedEmployees?.id as number,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    notes: formData.notes || null,
                });
            
                toast.success("Company history updated successfully!");
            
                if (onSuccess) {
                    onSuccess(updatedDepartment.result.data);
                }
            }
        } catch (err) {
            setLoading(false);

            let message = "Failed to create company history.";

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
                const [company, employee] = await Promise.all([
                    fetchAllCompanies(),
                    fetchAllEmployees(),
                ]);
    
                setCompanyList(company);
                setEmployeesList(employee);
    
                if (company.length > 0) {
                    // 🔽 Automatically select correct company in update mode
                    if (type === "update" && data?.company_id) {
                        const selected = company.find(c => c.id === data.company_id);
                        setSelectedCompany(selected || company[0]);
                    } else {
                        setSelectedCompany(company[0]);
                    }
                }

                if (employee.length > 0) {
                    // 🔽 Automatically select correct company in update mode
                    if (type === "update" && data?.employee_id) {
                        const selected = employee.find(c => c.id === data.employee_id);
                        setSelectedEmployees(selected || employee[0]);
                    } else {
                        setSelectedEmployees(employee[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
            } finally {
                setLoadingCompany(false);
                setLoadingEmployees(false);
            }
        };
    
        loadData();
    }, [type, data]);
     

    return (
        <form className="" onSubmit={handleCompanyHistory}>
            <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                {`${type === "create" ? "Assign a new" : "Update assign"} employee to company`}
            </h1>
            <div className="mt-2 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <SelectList
                        lists={companyList.map((company) => company.name)} // Extract the name if you only want the name
                        selected={selectedCompany ? selectedCompany.name : ""}
                        setSelected={(companyName) =>
                            setSelectedCompany(
                                companyList.find((company) => company.name === companyName) || null
                            )
                        }
                        label="Select Company"
                        disabled={loadingCompany} 
                    />
                     <SelectList
                        lists={EmployeesList.map((employee) => employee.name)} // Extract the name if you only want the name
                        selected={selectedEmployees ? selectedEmployees.name : ""}
                        setSelected={(employeeName) =>
                            setSelectedEmployees(
                                EmployeesList.find((employee) => employee.name === employeeName) || null
                            )
                        }
                        label="Select Employee"
                        disabled={loadingEmployees} 
                    />
                   
                </div>
                <div className="flex items-center gap-4">
                    <Textbox
                        placeholder="Enter Start Date"
                        type="date"
                        name="start_date"
                        label="Start Date"
                        className="w-full rounded"
                        register={register("start_date")}
                        error={errors.start_date ? errors.start_date.message : ""}
                    />
                    <Textbox
                        placeholder="Enter End Date"
                        type="date"
                        name="end_date"
                        label="End Date"
                        className="w-full rounded"
                        register={register("end_date")}
                        error={errors.end_date ? errors.end_date.message : ""}
                    />
                </div>
                <Textarea 
                    placeholder="Enter Notes"
                    name="notes"
                    label="Notes"
                    className="w-full rounded"
                    register={register("notes")}
                    error={errors.notes ? errors.notes.message : ""}
                />
            </div>
            {loading ? (
                <div className="mt-8">
                    <Loading />
                </div>
            ) : (
                <div className="py-3 mt-4 flex sm:flex-row-reverse gap-4">
                    <Button
                        type="submit"
                        className="bg-blue-400 text-sm font-semibold text-white hover:bg-blue-500 sm:ml-3 rounded sm:w-auto"
                        label={type === "create" ? "Add New" : "Update"}
                        icon={type === "create" ? <TbLibraryPlus size={18} /> : <FaRegEdit size={18} />}
                    />
                </div>
            )}
        </form>
    );
};

export default DepartmentForm;
