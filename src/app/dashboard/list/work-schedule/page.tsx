"use client"

import React, {useEffect, useState} from 'react';
import {
    Tabs,
    Card,
    Typography,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    TimePicker,
    Checkbox,
    Select,
    DatePicker,
    message,
} from 'antd';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import {assignShift, createWorkSchedule, ShiftAssignmentPayload, WorkSchedulePayload} from "@/lib/api/company";
import {Employee, fetchAllEmployees} from "@/lib/api/employee";

const { Title } = Typography;
const { Option } = Select;

const initialWorkScheduleValues = {
    name: 'Standard Schedule',
    work_start_time: dayjs('09:00', 'HH:mm'),
    work_end_time: dayjs('18:00', 'HH:mm'),
    grace_minutes: 10,
    work_hours_per_day: 8,
    overtime_allowed: true,
};



const WorkScheduleTabContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setIsLoading(true);
        const payload: WorkSchedulePayload = {
            ...values,
            work_start_time: values.work_start_time.format('HH:mm'),
            work_end_time: values.work_end_time.format('HH:mm'),
        };
        try {
            await createWorkSchedule(payload);
            message.success('Work Schedule created successfully!');
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to create work schedule.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Create New Work Schedule</Button>
            <Modal title="Create New Work Schedule" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialWorkScheduleValues} style={{ marginTop: '24px' }}>
                    {/* Form Items */}
                    <Form.Item name="name" label="Schedule Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="work_start_time" label="Work Start Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="work_end_time" label="Work End Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="work_hours_per_day" label="Work Hours per Day" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="grace_minutes" label="Grace Period (minutes)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="overtime_allowed" valuePropName="checked"><Checkbox>Overtime Allowed</Checkbox></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={isLoading}>Create Schedule</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


const mockEmployees = [
    { id: 5, name: 'John Doe' },
    { id: 12, name: 'Jane Smith' },
    { id: 23, name: 'Peter Jones' },
];

const ShiftAssignmentTabContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeesLoading, setEmployeesLoading] = useState(true);
    const [employeesError, setEmployeesError] = useState<string | null>(null);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                setEmployeesLoading(true);
                const data = await fetchAllEmployees();
                setEmployees(data);
                setEmployeesError(null);
            } catch (err) {
                setEmployeesError('Could not fetch the employee list. Please try refreshing the page.');
                message.error('Failed to load employees.');
            } finally {
                setEmployeesLoading(false);
            }
        };
        loadEmployees();
    }, []);

    const onFinish = async (values: any) => {
        setIsLoading(true);
        const payload: ShiftAssignmentPayload = {
            ...values,
            work_date: values.work_date.format('YYYY-MM-DD'),
            work_start_time: values.work_start_time.format('HH:mm'),
            work_end_time: values.work_end_time.format('HH:mm'),
        };
        try {
            await assignShift(payload);
            message.success('Shift assigned successfully!');
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to assign shift.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Assign New Shift</Button>
            <Modal title="Assign New Shift" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: '24px' }}>
                    {/* Form Items */}
                    <Form.Item name="employee_id" label="Employee" rules={[{ required: true }]}>
                        <Select placeholder="Select an employee">
                            {employees.map(emp => (
                                <Option key={emp.id} value={emp.id}>{emp.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="work_date" label="Work Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="work_start_time" label="Work Start Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="work_end_time" label="Work End Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="work_hours" label="Total Work Hours" rules={[{ required: true }]}><InputNumber min={0} max={24} style={{ width: '100%' }} /></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={isLoading}>Assign Shift</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


// ==============================================================================
// 4. MAIN PAGE COMPONENT (DEFAULT EXPORT)
// ==============================================================================
const ScheduleManagementPage = () => {
    // Define the items for the Tabs component
    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: `Work Schedules`,
            children: <WorkScheduleTabContent />,
        },
        {
            key: '2',
            label: `Shift Assignment`,
            children: <ShiftAssignmentTabContent />,
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={2}>Schedule and Shift Management</Title>
            <Card>
                <Tabs defaultActiveKey="1" items={tabItems} />
            </Card>
        </div>
    );
};

export default ScheduleManagementPage;