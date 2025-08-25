"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, message } from "antd";
import { BankInfoFormSchema, bankInfoSchema } from "@/lib/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBankInformation, getBackInformationById, updateBankInformation } from "@/lib/api/bankInformation";

interface BankInfoAntFormProps {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    onSaved: () => void;
    bankInfoId?: number; // For editing
}

const BankInfoForm: React.FC<BankInfoAntFormProps> = ({ open, onClose, employeeId, onSaved, bankInfoId }) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm<BankInfoFormSchema>({
        resolver: zodResolver(bankInfoSchema),
        defaultValues: {},
    });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    // Fetch existing bank info for editing
    useEffect(() => {
        if (open && bankInfoId) {
            setInitialLoading(true);
            const loadBankInfo = async () => {
                try {
                    const response = await getBackInformationById(bankInfoId);
                    const data = response.data.result.data;
                    reset({
                        bank_details: data.bank_details || "",
                        bank_account_no: data.bank_account_no || "",
                        ifsc_code: data.ifsc_code || "",
                        branch_address: data.branch_address || "",
                    });
                } catch (error) {
                    console.error("Failed to load bank info:", error);
                    message.error("Failed to load bank information.");
                } finally {
                    setInitialLoading(false);
                }
            };
            loadBankInfo();
        } else if (open && !bankInfoId) {
            reset(); // Clear form for 'add new'
            setInitialLoading(false);
        }
    }, [open, bankInfoId, reset]);

    const handleFormSubmit = handleSubmit(async (formData) => {
        setSubmitLoading(true);
        try {
            if (bankInfoId) {
                await updateBankInformation({ id: bankInfoId, employee_id: employeeId, ...formData });
                message.success("Bank information updated successfully.");
            } else {
                await createBankInformation({ employee_id: employeeId, ...formData });
                message.success("Bank information created successfully.");
            }
            onSaved();
            onClose();
        } catch (error) {
            console.error("Submit failed:", error);
            message.error("Failed to save bank information.");
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
            title={bankInfoId ? "Edit Bank Details" : "Add Bank Details"}
            open={open}
            onCancel={handleClose}
            width={700}
            footer={[
                <Button key="back" onClick={handleClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={submitLoading} onClick={handleFormSubmit}>Save</Button>,
            ]}
        >
            <Spin spinning={initialLoading} tip="Loading details...">
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="bank_details" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Bank Name *" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} placeholder="e.g., State Bank of India" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="bank_account_no" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Bank Account No" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} value={field.value ?? ''} placeholder="Enter account number" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Controller name="ifsc_code" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="IFSC Code" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} value={field.value ?? ''} placeholder="Enter IFSC code" />
                                </Form.Item>
                            )} />
                        </Col>
                        <Col span={12}>
                            <Controller name="branch_address" control={control} render={({ field, fieldState: { error } }) => (
                                <Form.Item label="Branch Address" validateStatus={error ? 'error' : ''} help={error?.message}>
                                    <Input {...field} value={field.value ?? ''} placeholder="Enter branch address" />
                                </Form.Item>
                            )} />
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default BankInfoForm;