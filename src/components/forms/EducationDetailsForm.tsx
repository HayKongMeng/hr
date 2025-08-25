"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, DatePicker, message } from "antd";
import { EducationFormSchema, educationSchema } from "@/lib/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEducationDetail } from "@/lib/api/educationdetail";
import dayjs from 'dayjs';

interface EducationDetailsAntFormProps {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    onSaved: () => void;
}

const EducationDetailsForm: React.FC<EducationDetailsAntFormProps> = ({ open, onSaved, onClose, employeeId }) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm<EducationFormSchema>({
        resolver: zodResolver(educationSchema),
        defaultValues: {},
    });

    const [loading, setLoading] = useState(false);

    const handleFormSubmit = handleSubmit(async (formData) => {
        setLoading(true);

        try {
            // Format dates into strings before sending to the API
            await createEducationDetail({
                employee_id: employeeId,
                institution_name: formData.institution_name,
                course: formData.course,
                start_date: dayjs(formData.start_date).format('YYYY-MM-DD'),
                end_date: dayjs(formData.end_date).format('YYYY-MM-DD'),
            });
            message.success("Education details saved successfully.");
            onSaved();
            onClose();
            reset(); // Clear the form for the next entry
        } catch (error) {
            console.error("Submit failed", error);
            message.error("Failed to save education details.");
        } finally {
            setLoading(false);
        }
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            title="Add Education Details"
            open={open}
            onCancel={handleClose}
            width={700}
            footer={[
                <Button key="back" onClick={handleClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleFormSubmit}>Save</Button>,
            ]}
        >
            <Form layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Controller name="institution_name" control={control} render={({ field, fieldState: { error } }) => (
                            <Form.Item label="Institution Name *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                <Input {...field} placeholder="e.g., University of Cambridge" />
                            </Form.Item>
                        )} />
                    </Col>
                    <Col span={12}>
                        <Controller name="course" control={control} render={({ field, fieldState: { error } }) => (
                            <Form.Item label="Course / Degree *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                <Input {...field} placeholder="e.g., B.Sc. in Computer Science" />
                            </Form.Item>
                        )} />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Controller name="start_date" control={control} render={({ field, fieldState: { error } }) => (
                            <Form.Item label="Start Date *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                <DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" picker="month" />
                            </Form.Item>
                        )} />
                    </Col>
                    <Col span={12}>
                        <Controller name="end_date" control={control} render={({ field, fieldState: { error } }) => (
                            <Form.Item label="End Date *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                <DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" picker="month" />
                            </Form.Item>
                        )} />
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EducationDetailsForm;