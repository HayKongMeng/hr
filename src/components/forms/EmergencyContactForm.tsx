"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, Divider, message } from "antd";
import {
    EmergencyContactPayload,
    createEmergencyContacts,
    getEmergencyContactsByEmployeeId,
    updateEmergencyContacts
} from "@/lib/api/employee"; // Assuming you have a get function
import { EmergencyContactFormSchema, emergencyContactSchema } from "@/lib/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface EmergencyContactAntFormProps {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    onSaved: () => void;
}

const EmergencyContactForm: React.FC<EmergencyContactAntFormProps> = ({ open, onClose, employeeId, onSaved }) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm<EmergencyContactFormSchema>({
        resolver: zodResolver(emergencyContactSchema),
        defaultValues: {
            primaryContact: { name: "", relationship: "", phone1: "", phone2: "" },
            secondaryContact: { name: "", relationship: "", phone1: "", phone2: "" },
        },
    });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [existingContactIds, setExistingContactIds] = useState<{ primary?: number; secondary?: number }>({});

    // Fetch existing contacts when the modal opens
    useEffect(() => {
        if (open) {
            setInitialLoading(true);
            const loadContacts = async () => {
                try {
                    const response = await getEmergencyContactsByEmployeeId(employeeId);
                    const contacts = response.data.result.data || [];
                    const sortedContacts = [...contacts].sort((a, b) => b.id - a.id);

                    const primary = sortedContacts.find((c: any) => c.contact_type === 'primary');
                    const secondary = sortedContacts.find((c: any) => c.contact_type === 'secondary');

                    setExistingContactIds({
                        primary: primary?.id,
                        secondary: secondary?.id,
                    });

                    reset({
                        primaryContact: {
                            name: primary?.name || "",
                            relationship: primary?.relationship || "",
                            phone1: primary?.phone1 || "",
                            phone2: primary?.phone2 || "",
                        },
                        secondaryContact: {
                            name: secondary?.name || "",
                            relationship: secondary?.relationship || "",
                            phone1: secondary?.phone1 || "",
                            phone2: secondary?.phone2 || "",
                        },
                    });
                } catch (error) {
                    console.error("Failed to load emergency contacts", error);
                    // No need to toast here, as it's just for pre-filling
                } finally {
                    setInitialLoading(false);
                }
            };
            loadContacts();
        } else {
            reset(); // Reset form when modal is closed
            setExistingContactIds({});
        }
    }, [open, employeeId, reset]);

    // Inside EmergencyContactForm.tsx

    const handleFormSubmit = async (formData: EmergencyContactFormSchema) => {
        setSubmitLoading(true);

        const { primaryContact, secondaryContact } = formData;
        const { primary: primaryId, secondary: secondaryId } = existingContactIds;

        const contactsToUpdate: EmergencyContactPayload[] = [];
        const contactsToCreate: EmergencyContactPayload[] = [];

        // Process Primary Contact
        if (primaryContact.name && primaryContact.phone1) {
            const payload = { ...primaryContact, employee_id: employeeId, contact_type: "primary" as const };
            if (primaryId) {
                contactsToUpdate.push({ ...payload, id: primaryId });
            } else {
                contactsToCreate.push(payload);
            }
        }

        // Process Secondary Contact
        if (secondaryContact.name && secondaryContact.phone1) {
            const payload = { ...secondaryContact, employee_id: employeeId, contact_type: "secondary" as const };
            if (secondaryId) {
                contactsToUpdate.push({ ...payload, id: secondaryId });
            } else {
                contactsToCreate.push(payload);
            }
        }

        try {
            const promises = [];

            if (contactsToUpdate.length > 0) {
                promises.push(updateEmergencyContacts(contactsToUpdate));
            }

            if (contactsToCreate.length > 0) {
                promises.push(createEmergencyContacts(contactsToCreate));
            }

            await Promise.all(promises);

            message.success("Emergency contacts saved successfully.");
            onSaved();
            onClose();
        } catch (error) {
            console.error("Submit failed", error);
            message.error("Failed to save contacts.");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Emergency Contact Details"
            open={open}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="back" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={submitLoading} onClick={handleSubmit(handleFormSubmit)}>Save Changes</Button>,
            ]}
        >
            <Spin spinning={initialLoading} tip="Loading contacts...">
                <Form layout="vertical">
                    <Divider orientation="left" orientationMargin="0">Primary Contact</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="primaryContact.name" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Name *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="e.g., Jane Doe" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="primaryContact.relationship" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Relationship" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="e.g., Spouse" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="primaryContact.phone1" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Phone No 1 *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="Primary contact number" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="primaryContact.phone2" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Phone No 2 (Optional)" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="Secondary contact number" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>

                    <Divider orientation="left" orientationMargin="0">Secondary Contact</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="secondaryContact.name" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Name *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="e.g., John Smith" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="secondaryContact.relationship" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Relationship" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="e.g., Sibling" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="secondaryContact.phone1" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Phone No 1 *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="Primary contact number" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="secondaryContact.phone2" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Phone No 2 (Optional)" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="Secondary contact number" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default EmergencyContactForm;