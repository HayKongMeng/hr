'use client';
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Alert } from "antd";
import { updateEmployeeRegistration } from "@/lib/api/users";

// Define the shape of the form values for clarity
interface FormValues {
    password?: string;
    confirm_password?: string;
}

interface ChangePasswordModalProps {
    open: boolean;
    employee: { user_id: number; name: string; email: string; };
    onCancel: () => void;
    onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, employee, onCancel, onSuccess }) => {
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // This effect runs when the modal is opened to clear any previous form state
    useEffect(() => {
        if (open) {
            form.resetFields();
            setError(null);
        }
    }, [open, form]);

    const handleFinish = async (values: FormValues) => {
        setError(null);
        setLoading(true);

        const payload = {
            name: employee.name,
            email: employee.email,
            password: values.password,
        };

        try {
            await updateEmployeeRegistration(employee.user_id, payload);
            message.success("Password updated successfully!");
            onSuccess();
            onCancel(); // Close the modal on success
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to update password. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<span className="text-xl font-semibold text-text-primary">Change Password</span>}
            open={open}
            onCancel={onCancel}
            destroyOnClose
            centered
            // Custom footer buttons for better control and styling
            footer={[
                <Button key="back" onClick={onCancel} size="large">
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={() => form.submit()} // Trigger the form's onFinish
                    size="large"
                >
                    Save Changes
                </Button>,
            ]}
        >
            <p className="text-text-secondary mb-6">
                Enter a new password for {employee.name}. The password must be at least 8 characters long.
            </p>

            {/* Display API errors in a styled Alert component */}
            {error && <Alert message={error} type="error" showIcon className="mb-4" />}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Form.Item
                    name="password"
                    label="New Password"
                    rules={[
                        { required: true, message: 'Please enter a new password.' },
                        { min: 8, message: 'Password must be at least 8 characters.' }
                    ]}
                >
                    <Input.Password size="large" placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                    name="confirm_password"
                    label="Confirm New Password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Please confirm your new password.' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password size="large" placeholder="Confirm new password" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;