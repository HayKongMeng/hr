"use client";

import { TbLibraryPlus } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "../ui/Loading";
import { HiXMark } from "react-icons/hi2"; 
import { AxiosError } from "axios";
import { UserFormSchema, userSchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import SelectList from "../ui/SelectList";
import { createUser, fetchRoles, updateUser } from "@/lib/api/users";

const UserForm = ({
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
    } = useForm<UserFormSchema>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: data?.name,
            email: data?.email,
            password: data?.password,
            first_name: data?.first_name,
            last_name: data?.last_name,
            phone: data?.phone,
        },
    });
   
    const [loading, setLoading] = useState(false);

    const [loadingRoles, setLoadingRoles] = useState(true);
    const [rolesList, setRolesList] = useState<{ id: number; role_name: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<{ id: number; role_name: string } | null>(null);

    const handleUser = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newUser = await createUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    role_id: selectedRoles?.id as number,
                });

                toast.success("User created successfully");
        
                if (onSuccess) {
                    onSuccess(newUser.result.data);
                }

                return;
            } else if (type === "update" && data) {
                
                const updatedUser = await updateUser(data.id,{
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    role_id: selectedRoles?.id as number,
                });
            
                toast.success("User updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedUser.result.data);
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

    useEffect(() => {
        const loadData = async () => {
            try {
                const [role] = await Promise.all([
                    fetchRoles(),
                ]);
    
                setRolesList(role);
    
                if (role.length > 0) {
                    if (type === "update" && data?.role_id) {
                        const selected = role.find(r => r.id === data.role_id);
                        setSelectedRoles(selected || role[0]);
                    } else {
                        setSelectedRoles(role[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
            } finally {
                setLoadingRoles(false);
            }
        };
    
        loadData();
    }, [type, data]);


    return (
        <form onSubmit={handleUser} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {`${type === "create" ? "Add" : "Edit"} User`}
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
                <div className="flex items-center gap-5">
                    <Textbox
                        type="text"
                        name="first_name"
                        label="First Name"
                        className="w-full rounded-lg"
                        register={register("first_name")}
                        error={errors.first_name ? errors.first_name.message : ""}
                    />
                    <Textbox
                        type="text"
                        name="last_name"
                        label="Last Name"
                        className="w-full rounded-lg"
                        register={register("last_name")}
                        error={errors.last_name ? errors.last_name.message : ""}
                    />
                </div>
                <div className="flex items-center gap-5">
                    <Textbox
                        type="text"
                        name="name"
                        label="User Name"
                        className="w-full rounded-lg"
                        register={register("name")}
                        error={errors.name ? errors.name.message : ""}
                    />
                    <Textbox
                        type="email"
                        name="email"
                        label="Email"
                        className="w-full rounded-lg"
                        register={register("email")}
                        error={errors.email ? errors.email.message : ""}
                    />
                </div>
                <div className="flex items-center gap-5">
                    <Textbox
                        type="password"
                        name="password"
                        label="Password"
                        className="w-full rounded-lg"
                        register={register("password")}
                        error={errors.password ? errors.password.message : ""}
                    />
                    <Textbox
                        type="password"
                        name="confirm_password"
                        label="Confirm Password"
                        className="w-full rounded-lg"
                        register={register("confirm_password")}
                        error={errors.confirm_password ? errors.confirm_password.message : ""}
                    />
                </div>
                <div className="flex items-center gap-5">
                    <Textbox
                        type="text"
                        name="phone"
                        label="Phone"
                        className="w-full rounded-lg"
                        register={register("phone")}
                        error={errors.phone ? errors.phone.message : ""}
                    />
                    <SelectList
                        lists={rolesList.map((roles) => roles.role_name)} // Extract the name if you only want the name
                        selected={selectedRoles ? selectedRoles.role_name : ""}
                        setSelected={(RoleName) =>
                            setSelectedRoles(
                                rolesList.find((roles) => roles.role_name === RoleName) || null
                            )
                        }
                        label="Select Role"
                        className="w-full rounded-lg"
                        disabled={loadingRoles} 
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
                        label={type === "create" ? "Add User" : "Edit User"}
                    />
                </div>
            )}
        </form>
    );
};

export default UserForm;
