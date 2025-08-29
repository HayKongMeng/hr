"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Spin, Row, Col, Select as AntSelect, DatePicker, Radio, Upload, message, Divider } from "antd";
import { CreateEmployeeFormSchema, createEmployeeSchema } from "@/lib/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmployee, updateEmployee } from "@/lib/api/employee";
import { fetchEmploymentTypes, fetchWorkStation } from "@/lib/api/status";
import { fetchAllPositions } from "@/lib/api/position";
import { fetchAllDepartments } from "@/lib/api/department";
import dayjs from 'dayjs';
import { toast } from "sonner";
import { AxiosError } from "axios";
import ProfileImageUploader from '../ProfileImageUploader';
import { HiXMark } from "react-icons/hi2";


// Define types for dropdown data
type Position = { id: number; title: string };
type Department = { id: number; name: string };
type WorkStation = { id: number; name: string };
type EmploymentType = { id: number; status_name: string };

interface EmployeeFormProps {
    type: "create" | "update";
    data?: any;
    onSuccess?: (data?: any) => void;
    onCancel?: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ type, data, onSuccess, onCancel }) => {
    const {
        register,
        handleSubmit,
        control, // Needed for DatePicker
        formState: { errors },
        reset,
    } = useForm<CreateEmployeeFormSchema>({
        resolver: zodResolver(createEmployeeSchema),
        defaultValues: {},
    });

    const [loading, setLoading] = useState(false);
    const [dropdownLoading, setDropdownLoading] = useState(true);

    // --- YOUR EXISTING STATE MANAGEMENT FOR DROPDOWNS - UNCHANGED ---
    const [selectedGender, setSelectedGender] = useState<string>("Male");
    const [positionList, setPositionList] = useState<Position[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [departmentList, setDepartmentList] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [workStationList, setWorkStationList] = useState<WorkStation[]>([]);
    const [selectedWorkStation, setSelectedWorkStation] = useState<WorkStation | null>(null);
    const [employmentTypeList, setEmploymentTypeList] = useState<EmploymentType[]>([]);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState<EmploymentType | null>(null);
    const [profileImage, setProfileImage] = useState<File | null>(null);

    // --- YOUR EXISTING DATA LOADING LOGIC - UNCHANGED (with dayjs conversion for reset) ---
    useEffect(() => {
        setDropdownLoading(true);
        const loadData = async () => {
            try {
                const [positions, department, workStation, employmentTypes] = await Promise.all([
                    fetchAllPositions(), fetchAllDepartments(), fetchWorkStation(), fetchEmploymentTypes(),
                ]);
                setPositionList(positions);
                setDepartmentList(department);
                setWorkStationList(workStation);
                setEmploymentTypeList(employmentTypes);

                if (type === "update" && data) {
                    reset({
                        ...data,
                        name: data.username,
                        date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : undefined,
                        hire_date: data.hire_date ? dayjs(data.hire_date) : undefined,
                    });
                    setSelectedGender(data.gender || "Male");
                    setSelectedPosition(positions.find(p => p.id === data.position_id) || null);
                    setSelectedDepartment(department.find(d => d.id === data.department_id) || null);
                    setSelectedWorkStation(workStation.find(w => w.id === data.work_station_id) || null);
                    setSelectedEmploymentType(employmentTypes.find(e => e.id === data.employment_type_id) || null);
                } else {
                    reset();
                }
            } catch (error){
                console.error("Failed to fetch dropdown data:", error);
            } finally {
                setDropdownLoading(false);
            }
        }
        loadData();
    }, [type, data, reset]);

    // --- YOUR SUBMISSION LOGIC - UNCHANGED (with date formatting) ---
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
                    image: profileImage});
                toast.success("Employee created successfully");
                if (onSuccess) onSuccess(newEmployee.result.data);
            } else if (type === "update" && data?.id && data.user_id) {
                const updatedEmployee = await updateEmployee(
                    data.id, data.user_id,
                    { username: formData.name, email: formData.email, password: formData.password },
                    {
                        employee_code: formData.employee_code,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        address: formData.address,
                        date_of_birth: dayjs(formData.date_of_birth).format('YYYY-MM-DD'),
                        hire_date: dayjs(formData.hire_date).format('YYYY-MM-DD'),
                        gender: selectedGender,
                        position_id: selectedPosition!.id,
                        department_id: selectedDepartment!.id,
                        work_station_id: selectedWorkStation!.id,
                        employment_type_id: selectedEmploymentType!.id,
                        image: profileImage,
                    }
                );
                toast.success("Employee updated successfully");
                if (onSuccess) onSuccess(updatedEmployee.result.data);
            }
        } catch (err) {
            const error = err as AxiosError<any>;
            const errorMessage = error.response?.data?.message || "Operation failed.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Spin spinning={dropdownLoading} tip="Loading options...">
            <Form layout="vertical" onFinish={handleEmployee}>
                <div className="flex items-center justify-between pb-4 border-b p-6">
                    <h1 className="text-lg font-bold leading-6 text-gray-900">
                        {`${type === "create" ? "Add New" : "Edit"} Employee`}
                    </h1>
                    <button type="button" aria-label="Close" onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <HiXMark size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6 max-h-[65vh] overflow-y-auto">
                    <Divider orientation="left">Personal Information</Divider>
                    <Row gutter={16}>
                        <Col span={24} className="mb-4"><ProfileImageUploader onFileChange={setProfileImage} initialFile={type === 'update' ? data?.image : null} /></Col>
                        <Col span={12}><Form.Item label="First Name *" help={errors.first_name?.message} validateStatus={errors.first_name ? 'error' : ''}><Input {...register("first_name")} /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Last Name *" help={errors.last_name?.message} validateStatus={errors.last_name ? 'error' : ''}><Input {...register("last_name")} /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Employee ID *" help={errors.employee_code?.message} validateStatus={errors.employee_code ? 'error' : ''}><Input {...register("employee_code")} /></Form.Item></Col>
                        <Col span={8}><Controller name="date_of_birth" control={control} render={({ field, fieldState: { error } }) => (<Form.Item label="Date of Birth *" help={error?.message} validateStatus={error ? 'error' : ''}><DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item>)}/></Col>
                        <Col span={8}><Controller name="hire_date" control={control} render={({ field, fieldState: { error } }) => (<Form.Item label="Joining Date *" help={error?.message} validateStatus={error ? 'error' : ''}><DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item>)}/></Col>
                        <Col span={12}><Form.Item label="Phone *" help={errors.phone?.message} validateStatus={errors.phone ? 'error' : ''}><Input {...register("phone")} /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Gender *"><Radio.Group value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}><Radio value="Male">Male</Radio><Radio value="Female">Female</Radio><Radio value="Other">Other</Radio></Radio.Group></Form.Item></Col>
                    </Row>

                    <Divider orientation="left">Login Credentials</Divider>
                    <Row gutter={16}>
                        <Col span={12}><Controller name="name" control={control} render={({ field, fieldState: { error } }) => (
                            <Form.Item label="Username *" help={error?.message} validateStatus={error ? 'error' : ''}><Input {...field} /></Form.Item>
                        )} /></Col>
                        <Col span={12}><Form.Item label="Email *" help={errors.email?.message} validateStatus={errors.email ? 'error' : ''}><Input {...register("email")} /></Form.Item></Col>
                        {type === 'create' && (
                            <>
                                <Col span={12}><Form.Item label="Password *" help={errors.password?.message} validateStatus={errors.password ? 'error' : ''}><Input.Password {...register("password")} /></Form.Item></Col>
                                <Col span={12}><Form.Item label="Confirm Password *" help={errors.confirm_password?.message} validateStatus={errors.confirm_password ? 'error' : ''}><Input.Password {...register("confirm_password")} /></Form.Item></Col>
                            </>
                        )}
                    </Row>

                    <Divider orientation="left">Work & Role Information</Divider>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item label="Department *">
                            <AntSelect loading={dropdownLoading} value={selectedDepartment?.id} onChange={val => setSelectedDepartment(departmentList.find(d => d.id === val) || null)} options={departmentList.map(d => ({ value: d.id, label: d.name }))} />
                        </Form.Item></Col>
                        <Col span={12}><Form.Item label="Designation *">
                            <AntSelect loading={dropdownLoading} value={selectedPosition?.id} onChange={val => setSelectedPosition(positionList.find(p => p.id === val) || null)} options={positionList.map(p => ({ value: p.id, label: p.title }))} />
                        </Form.Item></Col>
                        <Col span={12}><Form.Item label="Work Station *">
                            <AntSelect loading={dropdownLoading} value={selectedWorkStation?.id} onChange={val => setSelectedWorkStation(workStationList.find(w => w.id === val) || null)} options={workStationList.map(w => ({ value: w.id, label: w.name }))} />
                        </Form.Item></Col>
                        <Col span={12}><Form.Item label="Employment Status *">
                            <AntSelect loading={dropdownLoading} value={selectedEmploymentType?.id} onChange={val => setSelectedEmploymentType(employmentTypeList.find(e => e.id === val) || null)} options={employmentTypeList.map(e => ({ value: e.id, label: e.status_name }))} />
                        </Form.Item></Col>
                        <Col span={24}><Form.Item label="Address" help={errors.address?.message} validateStatus={errors.address ? 'error' : ''}><Input.TextArea {...register("address")} rows={3} /></Form.Item></Col>
                    </Row>
                </div>
                <div className="flex justify-end gap-3 pt-4 px-6 border-t pb-4">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {type === "create" ? "Add Employee" : "Save Changes"}
                    </Button>
                </div>
            </Form>
        </Spin>
    );
};

export default EmployeeForm;