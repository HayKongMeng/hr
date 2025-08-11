"use client";

import { TbLibraryPlus } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loading from "../ui/Loading";
import { AxiosError } from "axios";
import { RoleFormSchema, roleSchema } from "@/lib/validationSchema";
import { HiXMark } from "react-icons/hi2"; 
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import { useEffect, useState } from "react";
import { createRole, fetchPermission, updateRole } from "@/lib/api/users";

const RoleForm = ({
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
    } = useForm<RoleFormSchema>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            role_name: data?.role_name,
            // description: data?.description,
        },
    });
    const [loading, setLoading] = useState(false);

    const [modules, setModules] = useState<string[]>([]);
    const [actions, setActions] = useState<string[]>([]);

    const [permissions, setPermissions] = useState<{ module: string; actions: string[] }[]>([]);

    const toggleModuleAction = (module: string, action: string) => {
        setPermissions((prev) => {
            const modIndex = prev.findIndex((p) => p.module === module);
            if (modIndex !== -1) {
                const updatedActions = [...prev[modIndex].actions];
                const actionIndex = updatedActions.indexOf(action);
            if (actionIndex > -1) {
                updatedActions.splice(actionIndex, 1);
            } else {
                updatedActions.push(action);
            }

            const updated = [...prev];
                updated[modIndex] = { module, actions: updatedActions };
                return updated;
            } else {
                return [...prev, { module, actions: [action] }];
            }
        });
    };

    const isChecked = (module: string, action: string) => {
        const mod = permissions.find((p) => p.module === module);
        return mod?.actions.includes(action) || false;
    };

    const isAllModulesSelected = modules.every((mod) =>
        actions.every((action) => isChecked(mod, action))
    );

    const toggleAllModulesAndPermissions = () => {
        if (isAllModulesSelected) {
            setPermissions([]);
        } else {
            const allPermissions = modules.map((module) => ({
                module,
                actions: [...actions],
            }));
            setPermissions(allPermissions);
        }
    };

    const toggleAllForModule = (module: string) => {
        const existing = permissions.find((p) => p.module === module);
        if (existing && existing.actions.length === actions.length) {
            // Deselect all for module
            setPermissions((prev) => prev.filter((p) => p.module !== module));
        } else {
            // Select all actions for module
            setPermissions((prev) => {
                const filtered = prev.filter((p) => p.module !== module);
                return [...filtered, { module, actions: [...actions] }];
            });
        }
    };
   
    const handleRole = handleSubmit(async (formData) => {
        setLoading(true);
        try {
            if (type === "create") {
                const newRole = await createRole({
                    role_name: formData.role_name,
                    status: true,
                    permissions: permissions,
                });

                toast.success("Role created successfully");
        
                if (onSuccess) {
                    onSuccess(newRole.result.data);
                }

                return;
            } else if (type === "update" && data) {
                const updatedRole = await updateRole({
                    id: data.id, 
                    role_name: formData.role_name,
                    status: true,
                    permissions: permissions,
                });
            
                toast.success("Role updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedRole.result.data);
                }
            }
        } catch (err) {
            setLoading(false);

            let message = "Failed to create role.";

            const error = err as AxiosError<any>; 

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
                const [permissionsData] = await Promise.all([fetchPermission()]);
                // Extract modules and actions from the server response
                const modulesFromServer = Object.keys(permissionsData);
                const actionsFromServer = Array.from(
                    new Set(Object.values(permissionsData).flat())
                );

                setModules(modulesFromServer);
                setActions(actionsFromServer);

                // Only handle permissions if this is an "update" and data exists
                if (type === "update" && data?.permissions?.length > 0) {
                
                    // Group permissions by module
                    const groupedPermissions: Record<string, string[]> = {};

                    data.permissions.forEach((p: { module: string; action: string }) => {
                        if (!groupedPermissions[p.module]) {
                            groupedPermissions[p.module] = [];
                        }
                        groupedPermissions[p.module].push(p.action);
                    });

                    // Convert grouped permissions into the format your form expects
                    const userPermissions = Object.entries(groupedPermissions).map(([module, actions]) => ({
                        module,
                        actions,
                    }));

                    setPermissions(userPermissions);
                } else {
                    setPermissions([]);
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
            }
        };

        loadData();
    }, []);
    useEffect(() => {
        console.log("Selected Permissions (updated):", permissions);
    }, [permissions]);

    return (
       <form onSubmit={handleRole} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold text-gray-900">
                    {`${type === "create" ? "Add" : "Edit"} Role`}
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
            <div>
                <div className="pr-6 pl-6 pt-6 space-y-6">               
                    <div className="flex flex-col sm:flex-row gap-5">
                        <Textbox
                            type="text"
                            name="role_name"
                            label="Role Name"
                            className="w-full rounded-lg"
                            register={register("role_name")}
                            error={errors.role_name?.message || ""}
                        />
                    </div>
                    <div className="space-y-6">
                        <div className="text-block text-sm font-medium">Assign Permission to Roles</div>
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ marginTop: '12px' }}>
                            <div className="card-body">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead className="bg-gray-100 text-gray-600">
                                            <tr>
                                                <th className="px-6 py-4">
                                                    <div className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={isAllModulesSelected}
                                                            onChange={toggleAllModulesAndPermissions}
                                                            className="form-check-input rounded-sm border-gray-300 text-orangeCustom focus:ring-orangeCustom"
                                                        />
                                                        <span onClick={toggleAllModulesAndPermissions}>Module Permissions</span>
                                                    </div>
                                                </th>
                                                {actions.map((action) => (
                                                    <th key={action} className="px-6 py-4 text-left font-semibold text-sm">
                                                        {action}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-700">
                                            {modules.map((mod) => (
                                                <tr key={mod} className="border-b hover:bg-gray-50 transition-colors duration-200">
                                                    <td onClick={() => toggleAllForModule(mod)} className="px-6 py-4">
                                                        <div className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={actions.every((action) => isChecked(mod, action))}
                                                                readOnly
                                                            />
                                                            <span>{mod}</span>
                                                        </div>
                                                    </td>
                                                    {actions.map((action) => (
                                                        <td key={`${mod}-${action}`} className="px-6 py-4">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input rounded-sm border-gray-300 text-orangeCustom focus:ring-orangeCustom"
                                                                    type="checkbox"
                                                                    checked={isChecked(mod, action)}
                                                                    onChange={() => toggleModuleAction(mod, action)}
                                                                />
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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
                            label={type === "create" ? "Add Role" : "Edit Role"}
                        />
                    </div>
                )}
            </div>
        </form>
    );
};

export default RoleForm;
