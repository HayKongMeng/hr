"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, Select, DatePicker, message } from "antd";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { PersonalInfoFormSchema, personalInfoSchema } from "@/lib/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchMaritalStatuses, fetchNationality } from "@/lib/api/status";
import { createPersonalInformation, getPersonalInformationById, updatePersonalInformation } from "@/lib/api/personalinformation";
import dayjs from "dayjs";

// Define types for dropdown data
type Nationality = { id: number; country_name: string };
type MaritalStatus = { id: number; status_name: string };

interface PersonalInfoFormProps {
    isOpen: boolean;
    onSaved: () => void;
    onClose: () => void;
    employeeId: number;
    personalInfoId?: number;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ isOpen, onSaved, onClose, employeeId, personalInfoId }) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm<PersonalInfoFormSchema>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {},
    });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [nationalityList, setNationalityList] = useState<Nationality[]>([]);
    const [maritalStatusList, setMaritalStatusList] = useState<MaritalStatus[]>([]);

    useEffect(() => {
        if (isOpen) {
            setInitialLoading(true);
            const loadData = async () => {
                try {
                    const [national, maritalStatus] = await Promise.all([
                        fetchNationality(),
                        fetchMaritalStatuses(),
                    ]);
                    setNationalityList(national);
                    setMaritalStatusList(maritalStatus);

                    if (personalInfoId) {
                        const response = await getPersonalInformationById(personalInfoId);
                        const data = response.data.result.data;
                        reset({
                            passport_no: data.passport_no || "",
                            passport_expiry_date: data.passport_expiry_date ? dayjs(data.passport_expiry_date) : null,
                            nationality_id: data.nationality_id,
                            marital_status_id: data.marital_status_id,
                            religion: data.religion || "",
                            employment_spouse: data.employment_spouse || "",
                            number_of_children: data.number_of_children,
                        });
                    } else {
                        reset();
                    }
                } catch (error) {
                    console.error("Failed to load form data:", error);
                    message.error("Failed to load required data.");
                } finally {
                    setInitialLoading(false);
                }
            };
            loadData();
        }
    }, [isOpen, personalInfoId, reset]);

    const handleFormSubmit = handleSubmit(async (formData) => {
        setSubmitLoading(true);
        try {
            const payload = {
                ...formData,
                passport_expiry_date: dayjs(formData.passport_expiry_date).format('YYYY-MM-DD'),
            };

            if (personalInfoId) {
                await updatePersonalInformation({ id: personalInfoId, employee_id: employeeId, ...payload });
                toast.success("Personal information updated successfully");
            } else {
                await createPersonalInformation({ employee_id: employeeId, ...payload });
                toast.success("Personal information created successfully");
            }
            onSaved();
            onClose();
        } catch (err) {
            const error = err as AxiosError<any>;
            const errorMessage = error.response?.data?.message || "Operation failed.";
            toast.error(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    });

    return (
        <Modal
            title={personalInfoId ? "Edit Personal Information" : "Add Personal Information"}
            open={isOpen}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="back" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={submitLoading} onClick={handleFormSubmit}>Save</Button>,
            ]}
        >
            <Spin spinning={initialLoading} tip="Loading...">
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="passport_no" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Passport No *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="Enter passport number" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="passport_expiry_date" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Passport Expiry Date *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="nationality_id" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Nationality *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Select {...field} loading={initialLoading} showSearch placeholder="Select nationality" options={nationalityList.map(n => ({ value: n.id, label: n.country_name }))} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="marital_status_id" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Marital Status *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Select {...field} loading={initialLoading} placeholder="Select marital status" options={maritalStatusList.map(m => ({ value: m.id, label: m.status_name }))} />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="religion" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Religion" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} value={field.value ?? ''} placeholder="e.g., Christianity" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="employment_spouse" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Spouse's Employment" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} value={field.value ?? ''} placeholder="e.g., Employed" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="number_of_children" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="No. of Children *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input type="number" {...field} value={field.value ?? ''} placeholder="e.g., 2" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default PersonalInfoForm;