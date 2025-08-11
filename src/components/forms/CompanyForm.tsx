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
import { companyFormSchema, companySchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import { createCompany, updateCompany } from "@/lib/api/company";
import SelectList from "../ui/SelectList";

const CompanyForm = ({
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
    } = useForm<companyFormSchema>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            company_code: data?.company_code || "",
            name: data?.name || "",
            type: data?.type || "",
            email: data?.email || "",
            phone: data?.phone || "",
            country: data?.country || "",
            province: data?.province || "",
            city: data?.city || "",
            zip_code: data?.zip_code || "",
            address: data?.address || "",
            account_url: data?.account_url || "",
            website: data?.website || "",
            longitude: data?.longitude || "",
            latitude: data?.latitude || "",
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

    const handleCompany = handleSubmit(async (formData) => {
        console.log(formData);
        setLoading(true);
        try {
            if (type === "create") {
                const newCompany = await createCompany({
                    company_code: formData.company_code,
                    name: formData.name,
                    type: formData.type,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    province: formData.province,
                    city: formData.city,
                    zip_code: formData.zip_code,
                    address: formData.address,
                    account_url: formData.account_url,
                    website: formData.website,
                    status: isActive,
                    longitude: formData.longitude,
                    latitude: formData.latitude,
                });
                
                toast.success("Company created successfully");
        
                if (onSuccess) {
                    onSuccess(newCompany.result.data);
                }

                return;
            } else if (type === "update" && data) {
                
                const updatedCompany = await updateCompany({
                    id: data.id, 
                    company_code: formData.company_code,
                    name: formData.name,
                    type: formData.type,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    province: formData.province,
                    city: formData.city,
                    zip_code: formData.zip_code,
                    address: formData.address,
                    account_url: formData.account_url,
                    website: formData.website,
                    status: isActive,
                    longitude: formData.longitude,
                    latitude: formData.latitude,
                });
               
                toast.success("Company updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedCompany.result.data);
                }
            }
        } catch (err) {
            setLoading(false);

            let message = "Failed to create company.";

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
        <form onSubmit={handleCompany} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {`${type === "create" ? "Add" : "Edit"} Company`}
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
                            name="company_code"
                            label="Code"
                            className="w-full rounded-lg"
                            register={register("company_code")}
                            error={errors.company_code ? errors.company_code.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="name"
                            label="Company Name"
                            className="w-full rounded-lg"
                            register={register("name")}
                            error={errors.name ? errors.name.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="account_url"
                            label="Account URL"
                            className="w-full rounded-lg"
                            register={register("account_url")}
                            error={errors.account_url ? errors.account_url.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="name"
                            label="Website"
                            className="w-full rounded-lg"
                            register={register("website")}
                            error={errors.website ? errors.website.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="email"
                            label="Email Address"
                            className="w-full rounded-lg"
                            register={register("email")}
                            error={errors.email ? errors.email.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="phone"
                            label="Phone Number"
                            className="w-full rounded-lg"
                            register={register("phone")}
                            error={errors.phone ? errors.phone.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="type"
                            label="Type"
                            className="w-full rounded-lg"
                            register={register("type")}
                            error={errors.type ? errors.type.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="country"
                            label="Country"
                            className="w-full rounded-lg"
                            register={register("country")}
                            error={errors.country ? errors.country.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="province"
                            label="Province"
                            className="w-full rounded-lg"
                            register={register("province")}
                            error={errors.province ? errors.province.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="city"
                            label="City"
                            className="w-full rounded-lg"
                            register={register("city")}
                            error={errors.city ? errors.city.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="zip_code"
                            label="Zip Code"
                            className="w-full rounded-lg"
                            register={register("zip_code")}
                            error={errors.zip_code ? errors.zip_code.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <SelectList
                            lists={statusOptions}
                            selected={selectedStatus}
                            setSelected={setSelectedStatus}
                            className="w-full rounded-lg"
                            label="Status"
                        />
                       
                        <Textbox
                            type="text"
                            name="longitude"
                            label="Longitude"
                            className="w-full rounded-lg"
                            register={register("longitude")}
                            error={errors.longitude ? errors.longitude.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="latitude"
                            label="Latitude"
                            className="w-full rounded-lg"
                            register={register("latitude")}
                            error={errors.latitude ? errors.latitude.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="address"
                            label="Address"
                            className="w-full rounded-lg"
                            register={register("address")}
                            error={errors.address ? errors.address.message : ""}
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
                        label={type === "create" ? "Add Company" : "Edit Company"}
                    />
                </div>
            )}
        </form>
    );
};

export default CompanyForm;
