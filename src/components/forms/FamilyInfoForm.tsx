"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, DatePicker, message } from "antd";
import { FamilyInfoFormSchema, familyInfoSchema } from "@/lib/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFamilyInformation, getFamilyInformationById, updateFamilyInformation } from "@/lib/api/familyInformation";
import dayjs from 'dayjs';

interface FamilyInfoAntFormProps {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    onSaved: () => void;
    familyInfoId?: number; // For editing
}

const FamilyInfoForm: React.FC<FamilyInfoAntFormProps> = ({ open, onClose, employeeId, onSaved, familyInfoId }) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm<FamilyInfoFormSchema>({
        resolver: zodResolver(familyInfoSchema),
        defaultValues: {},
    });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    // Fetch existing family info for editing
    useEffect(() => {
        if (open && familyInfoId) {
            setInitialLoading(true);
            const loadFamilyInfo = async () => {
                try {
                    const response = await getFamilyInformationById(familyInfoId);
                    const data = response.data.result.data;
                    reset({
                        name: data.name || "",
                        relationship: data.relationship || "",
                        passport_expiry_date: data.passport_expiry_date ? dayjs(data.passport_expiry_date) : null,
                        phone: data.phone || "",
                    });
                } catch (error) {
                    console.error("Failed to load family info:", error);
                    message.error("Failed to load family information.");
                } finally {
                    setInitialLoading(false);
                }
            };
            loadFamilyInfo();
        } else if (open && !familyInfoId) {
            reset(); // Clear form for 'add new'
            setInitialLoading(false);
        }
    }, [open, familyInfoId, reset]);

    const handleFormSubmit = handleSubmit(async (formData) => {
        setSubmitLoading(true);
        try {
            const payload = {
                ...formData,
                // Format the date back to a string for the API
                passport_expiry_date: dayjs(formData.passport_expiry_date).format('YYYY-MM-DD'),
            };

            if (familyInfoId) {
                await updateFamilyInformation({ id: familyInfoId, employee_id: employeeId, ...payload });
                message.success("Family information updated successfully.");
            } else {
                await createFamilyInformation({ employee_id: employeeId, ...payload });
                message.success("Family information created successfully.");
            }
            onSaved();
            onClose();
        } catch (error) {
            console.error("Submit failed:", error);
            message.error("Failed to save family information.");
        } finally {
            setSubmitLoading(false);
        }
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            title={familyInfoId ? "Edit Family Information" : "Add Family Information"}
            open={open}
            onCancel={handleClose}
            width={700}
            footer={[
                <Button key="back" onClick={handleClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={submitLoading} onClick={handleFormSubmit}>Save</Button>,
            ]}
        >
            <Spin spinning={initialLoading} tip="Loading...">
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="name" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Name *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="e.g., Jane Doe" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="relationship" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Relationship" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} value={field.value ?? ''} placeholder="e.g., Spouse, Sibling" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="passport_expiry_date" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Date of Birth *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="phone" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Phone" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} value={field.value ?? ''} placeholder="Enter phone number" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default FamilyInfoForm;