"use client";

import { TbLibraryPlus } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiXMark } from "react-icons/hi2"; 
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "../ui/Loading";
import { AxiosError } from "axios";
import { CreateEmployeeFormSchema, createEmployeeSchema } from "@/lib/validationSchema";
import Textbox from "../ui/Textbox";
import Button from "../ui/Button";
import { createEmployee, updateEmployee } from "@/lib/api/employee";
import SelectList from "../ui/SelectList";
import { fetchEmploymentTypes, fetchWorkStation } from "@/lib/api/status";
import { fetchAllPositions } from "@/lib/api/position";
import { fetchAllDepartments } from "@/lib/api/department";
import ProfileImageUploader from '../ProfileImageUploader';
import Textarea from "../ui/Textarea";

const EmployeeForm = ({
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
    } = useForm<CreateEmployeeFormSchema>({
        resolver: zodResolver(createEmployeeSchema),
        defaultValues: type === "update" && data
            ? {
                name: data.name,
                email: data.email,
                employee_code: data.employee_code,
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone,
                address: data.address,
                date_of_birth: data.date_of_birth,
                hire_date: data.hire_date,
            }
            : {},
    });

    const genderOptions = ["Male", "Female", "Other"];
    const [selectedGender, setSelectedGender] = useState<string>(
        data?.gender && genderOptions.includes(data.gender) ? data.gender : genderOptions[0]
    );

    const [loadingPosition, setLoadingPosition] = useState(true);
    const [loadingDepartment, setLoadingDepartment] = useState(true);
    const [loadingWorkStation, setLoadingWorkStation] = useState(true);
    const [loadingEmploymentType, setLoadingEmploymentType] = useState(true);

    const [positionList, setPositionList] = useState<{ id: number; title: string }[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<{ id: number; title: string } | null>(null);

    const [departmentList, setDepartmentList] = useState<{ id: number; name: string }[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<{ id: number; name: string } | null>(null);

    const [workStationList, setWorkStationList] = useState<{ id: number; name: string }[]>([]);
    const [selectedWorkStation, setSelectedWorkStation] = useState<{ id: number; name: string } | null>(null);

    const [employmentTypeList, setEmploymentTypeList] = useState<{ id: number; status_name: string }[]>([]);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState<{ id: number; status_name: string } | null>(null);

    const [profileImage, setProfileImage] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
   
    const handleEmployee = handleSubmit(async (formData) => {
        setLoading(true);
    
        try {
            if (type === "create") {
                const newEmployee = await createEmployee({
                    username: formData.name,
                    email: formData.email,
                    password: formData.password,
                    employee_code: formData.employee_code,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    address: formData.address || null,
                    date_of_birth: formData.date_of_birth,
                    hire_date: formData.hire_date,
                    gender: selectedGender,
                    position_id: selectedPosition?.id as number,
                    department_id: selectedDepartment?.id as number,
                    work_station_id: selectedWorkStation?.id as number,
                    employment_type_id: selectedEmploymentType?.id as number,
                    image: profileImage,
                });
    
                toast.success("Employee created successfully");
    
                if (onSuccess) {
                    onSuccess(newEmployee.result.data);
                }
                return;
            } else if (type === "update" && data?.id && data.user_id) {
                const updatedEmployee = await updateEmployee(
                    data.id,
                    data.user_id,
                    {
                        username: formData.name,
                        email: formData.email,
                        password: formData.password,
                    },
                    {
                        employee_code: formData.employee_code,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        address: formData.address,
                        date_of_birth: formData.date_of_birth, 
                        hire_date: formData.hire_date,
                        gender: selectedGender,
                        position_id: selectedPosition?.id as number,
                        department_id: selectedDepartment?.id as number,
                        work_station_id: selectedWorkStation?.id as number,
                        employment_type_id: selectedEmploymentType?.id as number,
                        image: profileImage,
                    }
                );

                toast.success("Employee updated successfully");
            
                if (onSuccess) {
                    onSuccess(updatedEmployee.result.data);
                }
            }            
        } catch (err) {
            let message = "Failed to create employee.";
    
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
                const [positions, department, workStation, employmentTypes] = await Promise.all([
                    fetchAllPositions(),
                    fetchAllDepartments(),
                    fetchWorkStation(),
                    fetchEmploymentTypes(),
                ]);

                setPositionList(positions);
                setDepartmentList(department);
                setWorkStationList(workStation);
                setEmploymentTypeList(employmentTypes);

                if (positions.length > 0) {
                    if (type === "update" && data?.position_id) {
                        const selected = positions.find(p => p.id === data.position_id);
                        setSelectedPosition(selected || positions[0]);
                    } else {
                        setSelectedPosition(positions[0]);
                    }
                }
                if (department.length > 0) {
                    if (type === "update" && data?.department_id) {
                        const selected = department.find(p => p.id === data.department_id);
                        setSelectedDepartment(selected || department[0]);
                    } else {
                        setSelectedDepartment(department[0]);
                    }
                }
                if (workStation.length > 0) {
                    if (type === "update" && data?.work_station_id) {
                        const selected = workStation.find(p => p.id === data.work_station_id);
                        setSelectedWorkStation(selected || workStation[0]);
                    } else {
                        setSelectedWorkStation(workStation[0]);
                    }
                }
                if (employmentTypes.length > 0) {
                    if (type === "update" && data?.employment_type_id) {
                        const selected = employmentTypes.find(p => p.id === data.employment_type_id);
                        setSelectedEmploymentType(selected || employmentTypes[0]);
                    } else {
                        setSelectedEmploymentType(employmentTypes[0]);
                    }
                }
            } catch (error){
                console.error("Failed to fetch dropdown data:", error);
            } finally {
                setLoadingPosition(false);
                setLoadingDepartment(false);
                setLoadingWorkStation(false);
                setLoadingEmploymentType(false);
            }
        }

        loadData();
    }, []); 

    return (
        <form onSubmit={handleEmployee} className="bg-white rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b p-6">
                <h1 className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {`${type === "create" ? "Add" : "Edit"} Employee`}
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
                        <ProfileImageUploader 
                            initialFile={type === 'update' ? data?.profile_image_url : null}
                            onFileChange={(file: File | null) => setProfileImage(file)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="first_name"
                            label="First Name *"
                            className="w-full rounded-lg"
                            register={register("first_name")}
                            error={errors.first_name ? errors.first_name.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="last_name"
                            label="Last Name *"
                            className="w-full rounded-lg"
                            register={register("last_name")}
                            error={errors.last_name ? errors.last_name.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="employee_code"
                            label="Employee ID *"
                            className="w-full rounded-lg"
                            register={register("employee_code")}
                            error={errors.employee_code ? errors.employee_code.message : ""}
                        />
                        <Textbox
                            placeholder="Enter Birthday"
                            type="date"
                            name="date_of_birth"
                            label="Birthday *"
                            className="w-full rounded-lg"
                            register={register("date_of_birth")}
                            error={errors.date_of_birth ? errors.date_of_birth.message : ""}
                        />
                        <Textbox
                            placeholder="Enter Birthday"
                            type="date"
                            name="hire_date"
                            label="Joining Date *"
                            className="w-full rounded-lg"
                            register={register("hire_date")}
                            error={errors.hire_date ? errors.hire_date.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="name"
                            label="Username *"
                            className="w-full rounded-lg"
                            register={register("name")}
                            error={errors.name ? errors.name.message : ""}
                        />
                        <Textbox
                            type="text"
                            name="email"
                            label="Email *"
                            className="w-full rounded-lg"
                            register={register("email")}
                            error={errors.email ? errors.email.message : ""}
                        />
                      
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="password"
                            name="password"
                            label="Password *"
                            className="w-full rounded-lg"
                            register={register("password")}
                            error={errors.password ? errors.password.message : ""}
                        />
                        <Textbox
                            type="password"
                            name="confirm_password"
                            label="Confirm Password *"
                            className="w-full rounded-lg"
                            register={register("confirm_password")}
                            error={errors.confirm_password ? errors.confirm_password.message : ""}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Textbox
                            type="text"
                            name="phone"
                            label="Phone Number *"
                            className="w-full rounded-lg"
                            register={register("phone")}
                            error={errors.phone ? errors.phone.message : ""}
                        />
                        <SelectList
                            lists={genderOptions}
                            selected={selectedGender}
                            setSelected={setSelectedGender}
                            label="Select Gender"
                            className="w-full rounded-lg"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <SelectList
                            lists={workStationList.map((workStation) => workStation.name)} // Extract the name if you only want the name
                            selected={selectedWorkStation ? selectedWorkStation.name : ""}
                            setSelected={(work_station_name) =>
                                setSelectedWorkStation(
                                    workStationList.find((workStation) => workStation.name === work_station_name) || null
                                )
                            }
                            label="Select Work Station"
                            disabled={loadingWorkStation} 
                            className="w-full rounded-lg"
                        />
                        <SelectList
                            lists={employmentTypeList.map((EmploymentTypes) => EmploymentTypes.status_name)} // Extract the name if you only want the name
                            selected={selectedEmploymentType ? selectedEmploymentType.status_name : ""}
                            setSelected={(emp_type_status_name) =>
                                setSelectedEmploymentType(
                                    employmentTypeList.find((EmploymentTypes) => EmploymentTypes.status_name === emp_type_status_name) || null
                                )
                            }
                            label="Employment Status"
                            disabled={loadingEmploymentType} 
                            className="w-full rounded-lg"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <SelectList
                            lists={departmentList.map((department) => department.name)} // Extract the name if you only want the name
                            selected={selectedDepartment ? selectedDepartment.name : ""}
                            setSelected={(departmentName) =>
                                setSelectedDepartment(
                                    departmentList.find((department) => department.name === departmentName) || null
                                )
                            }
                            label="Select Department"
                            disabled={loadingDepartment} 
                            className="w-full rounded-lg"
                        />
                        <SelectList
                            lists={positionList.map((position) => position.title)} // Extract the title if you only want the title
                            selected={selectedPosition ? selectedPosition.title : ""}
                            setSelected={(positionTitle) =>
                                setSelectedPosition(
                                    positionList.find((position) => position.title === positionTitle) || null
                                )
                            }
                            label="Select Designation"
                            className="w-full rounded-lg"
                            disabled={loadingPosition}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5">
                        <Textarea 
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
                        label={type === "create" ? "Add Employee" : "Edit Employee"}
                    />
                </div>
            )}
        </form>
    );
};

export default EmployeeForm;
