"use client";

import React, {useEffect} from 'react';
import { Modal, Form, Select, Input, Button, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

interface ManualAttendanceFormProps {
    open: boolean;
    onCancel: () => void;
    onSave: (values: any) => void;
    initialData: {
        employeeName: string;
        date: dayjs.Dayjs | null;
        status: string;
        // Add other fields you want to edit
        reason?: string;
    } | null;
    loading: boolean;
}

const ManualAttendanceForm: React.FC<ManualAttendanceFormProps> = ({ open, onCancel, onSave, initialData, loading }) => {
    const [form] = Form.useForm();

    // Set form values when the modal opens or initialData changes
    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                date: initialData.date ? dayjs(initialData.date) : null,
            });
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    return (
        <Modal
            title="Manual Attendance Entry"
            open={open}
            onCancel={onCancel}
            destroyOnClose
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                    Save Changes
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={onSave}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Employee">
                            <Input value={initialData?.employeeName} disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="date" label="Date">
                            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status!' }]}>
                    <Select placeholder="Select a status">
                        <Option value="P">Present (P)</Option>
                        <Option value="L">Late (L)</Option>
                        <Option value="A">Absent (A)</Option>
                        {/* Add other statuses you support, like Leave, Half-Day, etc. */}
                        <Option value="LV">Leave (LV)</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="reason" label="Reason (Optional)">
                    <Input.TextArea rows={3} placeholder="Enter a reason for the manual change" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ManualAttendanceForm;