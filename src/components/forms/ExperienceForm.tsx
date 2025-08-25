"use client";

import React, {useEffect, useState} from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, Checkbox, DatePicker, message } from "antd";
import { ExperienceFormSchema, experienceSchema } from "@/lib/validationSchema";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExperience } from "@/lib/api/experience";
import dayjs from 'dayjs';

interface ExperienceAntFormProps {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    onSaved: () => void;
}

const ExperienceForm: React.FC<ExperienceAntFormProps> = ({ open, onSaved, onClose, employeeId }) => {
    const {
        control, // Use control for Controller
        handleSubmit,
        setValue, // We'll use this to clear the end date
        reset,
    } = useForm<ExperienceFormSchema>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {
            is_current: false,
        },
    });

    // Watch the 'is_current' checkbox to disable the end date picker
    const isCurrent = useWatch({ control, name: "is_current" });

    const [loading, setLoading] = useState(false);

    // Effect to clear end_date when 'is_current' is checked
    useEffect(() => {
        if (isCurrent) {
            setValue("end_date", "");
        }
    }, [isCurrent, setValue]);

    const handleEducation = handleSubmit(async (formData) => {
        setLoading(true);

        try {
            await createExperience({
                employee_id: employeeId,
                previous_company_name: formData.previous_company_name,
                designation: formData.designation,
                start_date: dayjs(formData.start_date).format('YYYY-MM-DD'),
                end_date: formData.is_current ? null : dayjs(formData.end_date).format('YYYY-MM-DD'),
                is_current: formData.is_current
            });
            message.success("Experience saved.");
            onSaved();
            onClose();
            reset();
        } catch (error) {
            console.error("Submit failed", error);
            message.error("Failed to save experience.");
        } finally {
            setLoading(false);
        }
    });

    const handleClose = () => {
        reset();
        onClose();
    }

    return (
        <Modal
            title="Add Experience"
            open={open}
            onCancel={handleClose}
            width={700}
            footer={[
                <Button key="back" onClick={handleClose}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleEducation}
                >
                    Save
                </Button>,
            ]}
        >
            <Form layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Controller
                            name="previous_company_name"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <Form.Item
                                    label="Company Name *"
                                    validateStatus={error ? 'error' : ''}
                                    help={error?.message}
                                >
                                    <Input {...field} placeholder="e.g., Google Inc." />
                                </Form.Item>
                            )}
                        />
                    </Col>
                    <Col span={12}>
                        <Controller
                            name="designation"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <Form.Item
                                    label="Designation *"
                                    validateStatus={error ? 'error' : ''}
                                    help={error?.message}
                                >
                                    <Input {...field} placeholder="e.g., Senior Software Engineer" />
                                </Form.Item>
                            )}
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Controller
                            name="start_date"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <Form.Item
                                    label="Start Date *"
                                    validateStatus={error ? 'error' : ''}
                                    help={error?.message}
                                >
                                    <DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" />
                                </Form.Item>
                            )}
                        />
                    </Col>
                    <Col span={12}>
                        <Controller
                            name="end_date"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <Form.Item
                                    label={isCurrent ? "End Date" : "End Date *"}
                                    validateStatus={error ? 'error' : ''}
                                    help={error?.message}
                                    required={!isCurrent} // Make the asterisk conditional
                                >
                                    <DatePicker {...field} style={{ width: '100%' }} format="YYYY-MM-DD" disabled={isCurrent} />
                                </Form.Item>
                            )}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Controller
                            name="is_current"
                            control={control}
                            render={({ field }) => (
                                <Form.Item>
                                    <Checkbox {...field} checked={field.value}>
                                        I am currently working here
                                    </Checkbox>
                                </Form.Item>
                            )}
                        />
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ExperienceForm;