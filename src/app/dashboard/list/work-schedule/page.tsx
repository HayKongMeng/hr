"use client"

import React, {useEffect, useState, useCallback} from 'react';
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
    Table,
    Space,
    Row,
    Col,
    Spin, Descriptions, Divider,
} from 'antd';
import type {TabsProps, TableProps} from 'antd';
import dayjs from 'dayjs';
import {
    assignShift,
    createWorkSchedule,
    deleteScheduleDay,
    deleteShiftAssign,
    fetchScheduleDay,
    fetchShiftAssign,
    ShiftAssignmentPayload,
    updateShiftAssign,
    updateWorkSchedule,
    WorkSchedulePayload,
    // --- Added Attendance API Functions ---
    createAttendanceSetting,
    deleteAttendanceSetting,
    fetchAttendanceSetting,
    AttendanceSettingPayload, WorkScheduleDayPayload, addDayToWorkSchedule, getScheduleDayById, WorkScheduleDay,
    WorkScheduleDetail
} from "@/lib/api/company"; // Assuming API functions are in this path
import {Employee, fetchAllEmployees} from "@/lib/api/employee";
import {MdAdd, MdDelete, MdEdit, MdRemoveRedEye} from "react-icons/md";
import {FaCalendarPlus} from "react-icons/fa";

const { Title } = Typography;
const { Option } = Select;

// --- Enhanced Type Definitions for the View Layer ---
type WorkSchedule = WorkSchedulePayload & { id: number };
type ShiftAssignment = ShiftAssignmentPayload & { id: number; employee?: { name: string }, work_schedule?: { name: string } };
type AttendanceSetting = AttendanceSettingPayload & { id: number }; // Added type for Attendance Setting state

// ==============================================================================
// 1. Work Schedule Tab (Unchanged)
// ==============================================================================
const WorkScheduleTabContent = () => {
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
    const [form] = Form.useForm();

    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [isDaySubmitting, setIsDaySubmitting] = useState(false);
    const [dayForm] = Form.useForm();
    const [selectedScheduleForDay, setSelectedScheduleForDay] = useState<WorkSchedule | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingScheduleDetails, setViewingScheduleDetails] = useState<WorkScheduleDetail | null>(null);
    const [isViewLoading, setIsViewLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchScheduleDay();
            setSchedules(data);
        } catch (error) {
            message.error('Failed to fetch work schedules.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleModalOpen = (schedule: WorkSchedule | null) => {
        setEditingSchedule(schedule);
        if (schedule) {
            form.setFieldsValue({
                ...schedule,
                overtime_allowed: !!schedule.overtime_allowed,
                work_start_time: dayjs(schedule.work_start_time, 'HH:mm:ss'),
                work_end_time: dayjs(schedule.work_end_time, 'HH:mm:ss'),
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleDayModalOpen = (schedule: WorkSchedule) => {
        setSelectedScheduleForDay(schedule);
        dayForm.resetFields();
        setIsDayModalOpen(true);
    };

    const handleDayModalCancel = () => {
        setIsDayModalOpen(false);
        setSelectedScheduleForDay(null);
        dayForm.resetFields();
    };

    const handleViewModalOpen = async (schedule: WorkSchedule) => {
        setIsViewModalOpen(true);
        setIsViewLoading(true);
        try {
            const data = await getScheduleDayById(schedule.id);
            setViewingScheduleDetails(data);
        } catch (error) {
            message.error(`Failed to fetch details for ${schedule.name}.`);
            setIsViewModalOpen(false); // Close modal on error
        } finally {
            setIsViewLoading(false);
        }
    };

    const handleViewModalCancel = () => { setIsViewModalOpen(false); setViewingScheduleDetails(null); };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);
        form.resetFields();
    };

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const payload: WorkSchedulePayload = {
            ...values,
            work_start_time: dayjs(values.work_start_time).format('HH:mm'),
            work_end_time: dayjs(values.work_end_time).format('HH:mm'),
        };

        try {
            if (editingSchedule) {
                await updateWorkSchedule(editingSchedule.id, payload);
                message.success('Work Schedule updated successfully!');
            } else {
                await createWorkSchedule(payload);
                message.success('Work Schedule created successfully!');
            }
            handleModalCancel();
            fetchData();
        } catch (error) {
            message.error(`Failed to ${editingSchedule ? 'update' : 'create'} work schedule.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFinishDay = async (values: any) => {
        if (!selectedScheduleForDay) return;

        setIsDaySubmitting(true);
        const payload: WorkScheduleDayPayload = {
            ...values,
            work_start_time: dayjs(values.work_start_time).format('HH:mm'),
            work_end_time: dayjs(values.work_end_time).format('HH:mm'),
        };

        try {
            await addDayToWorkSchedule(selectedScheduleForDay.id, payload);
            message.success(`Day added to schedule '${selectedScheduleForDay.name}' successfully!`);
            handleDayModalCancel();
        } catch (error) {
            message.error(`Failed to add day to schedule.`);
        } finally {
            setIsDaySubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this schedule?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteScheduleDay(id);
                    message.success('Schedule deleted successfully.');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete schedule.');
                }
            },
        });
    };

    const columns: TableProps<WorkSchedule>['columns'] = [
        { title: 'Schedule Name', dataIndex: 'name', key: 'name' },
        { title: 'Start Time', dataIndex: 'work_start_time', key: 'start_time' },
        { title: 'End Time', dataIndex: 'work_end_time', key: 'end_time' },
        { title: 'Work Hours', dataIndex: 'work_hours_per_day', key: 'work_hours', align: 'center' },
        { title: 'Grace (mins)', dataIndex: 'grace_minutes', key: 'grace_minutes', align: 'center' },
        { title: 'Overtime', dataIndex: 'overtime_allowed', key: 'overtime', render: (allowed) => (allowed ? 'Yes' : 'No'), align: 'center' },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<MdRemoveRedEye />} onClick={() => handleViewModalOpen(record)}>View</Button>
                    <Button icon={<FaCalendarPlus />} onClick={() => handleDayModalOpen(record)}>Add Days</Button>
                    <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button icon={<MdDelete />} danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    const dayColumns: TableProps<WorkScheduleDay>['columns'] = [
        { title: 'Day', dataIndex: 'day_of_week', key: 'day' },
        { title: 'Start Time', dataIndex: 'work_start_time', key: 'start' },
        { title: 'End Time', dataIndex: 'work_end_time', key: 'end' },
        { title: 'Hours', dataIndex: 'work_hours', key: 'hours', align: 'center' },
    ];

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>
                    Create Work Schedule
                </Button>
            </div>
            <Table columns={columns} dataSource={schedules} loading={isLoading} rowKey="id" scroll={{ x: 'max-content' }} />
            <Modal title={editingSchedule ? "Edit Work Schedule" : "Create New Work Schedule"} open={isModalOpen} onCancel={handleModalCancel} destroyOnClose footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: '24px' }}>
                    <Form.Item name="name" label="Schedule Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Row gutter={16}><Col xs={24} sm={12}><Form.Item name="work_start_time" label="Work Start Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="work_end_time" label="Work End Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col></Row>
                    <Row gutter={16}><Col xs={24} sm={12}><Form.Item name="work_hours_per_day" label="Work Hours/Day" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="grace_minutes" label="Grace (mins)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col></Row>
                    <Form.Item name="overtime_allowed" valuePropName="checked"><Checkbox>Overtime Allowed</Checkbox></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}><Button onClick={handleModalCancel} style={{ marginRight: 8 }}>Cancel</Button><Button type="primary" htmlType="submit" loading={isSubmitting}>{editingSchedule ? 'Save Changes' : 'Create Schedule'}</Button></Form.Item>
                </Form>
            </Modal>
            <Modal
                title={`Add Day to "${selectedScheduleForDay?.name}"`}
                open={isDayModalOpen}
                onCancel={handleDayModalCancel}
                destroyOnClose
                footer={null}
            >
                <Form form={dayForm} layout="vertical" onFinish={onFinishDay} style={{ marginTop: '24px' }}>
                    <Form.Item name="day_of_week" label="Day of the Week" rules={[{ required: true }]}>
                        <Select placeholder="Select a day">
                            {weekDays.map(day => <Option key={day} value={day}>{day}</Option>)}
                        </Select>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="work_start_time" label="Work Start Time" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="work_end_time" label="Work End Time" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="work_hours" label="Total Work Hours" rules={[{ required: true }]}>
                        <InputNumber min={0} max={24} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Button onClick={handleDayModalCancel} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={isDaySubmitting}>Add Day</Button>
                    </Form.Item>
                </Form>
            </Modal>
            {/* --- "View Details" Modal --- */}
            <Modal title={`Details for "${viewingScheduleDetails?.name}"`} open={isViewModalOpen} onCancel={handleViewModalCancel} footer={<Button onClick={handleViewModalCancel}>Close</Button>} width={600}>
                <Spin spinning={isViewLoading} tip="Loading details...">
                    {viewingScheduleDetails && (
                        <>
                            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                                <Descriptions.Item label="Schedule Name">{viewingScheduleDetails.name}</Descriptions.Item>
                                <Descriptions.Item label="Default Start Time">{viewingScheduleDetails.work_start_time}</Descriptions.Item>
                                <Descriptions.Item label="Default End Time">{viewingScheduleDetails.work_end_time}</Descriptions.Item>
                                <Descriptions.Item label="Default Work Hours">{viewingScheduleDetails.work_hours_per_day}</Descriptions.Item>
                                <Descriptions.Item label="Grace Period">{viewingScheduleDetails.grace_minutes} minutes</Descriptions.Item>
                                <Descriptions.Item label="Overtime Allowed">{viewingScheduleDetails.overtime_allowed ? 'Yes' : 'No'}</Descriptions.Item>
                            </Descriptions>

                            <Divider>Assigned Days</Divider>

                            <Table
                                columns={dayColumns}
                                dataSource={viewingScheduleDetails.work_schedule_days}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            />
                        </>
                    )}
                </Spin>
            </Modal>
        </div>
    );
};


// ==============================================================================
// 2. Shift Assignment Tab (Unchanged)
// ==============================================================================
const ShiftAssignmentTabContent = () => {
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);
    const [form] = Form.useForm();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [assignmentsData, employeesData, schedulesData] = await Promise.all([ fetchShiftAssign(), fetchAllEmployees(), fetchScheduleDay() ]);
            setAssignments(assignmentsData);
            setEmployees(employeesData);
            setSchedules(schedulesData);
        } catch (error) {
            message.error('Failed to fetch necessary data for shift assignments.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleModalOpen = (assignment: ShiftAssignment | null) => {
        setEditingAssignment(assignment);
        if (assignment) {
            form.setFieldsValue({
                ...assignment,
                work_date: dayjs(assignment.work_date, 'YYYY-MM-DD'),
                work_start_time: dayjs(assignment.work_start_time, 'HH:mm:ss'),
                work_end_time: dayjs(assignment.work_end_time, 'HH:mm:ss'),
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingAssignment(null);
        form.resetFields();
    };

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const payload: ShiftAssignmentPayload = {
            ...values,
            work_date: dayjs(values.work_date).format('YYYY-MM-DD'),
            work_start_time: dayjs(values.work_start_time).format('HH:mm'),
            work_end_time: dayjs(values.work_end_time).format('HH:mm'),
        };

        try {
            if (editingAssignment) {
                await updateShiftAssign(editingAssignment.id, payload);
                message.success('Shift updated successfully!');
            } else {
                await assignShift(payload);
                message.success('Shift assigned successfully!');
            }
            handleModalCancel();
            fetchData();
        } catch (error) {
            message.error(`Failed to ${editingAssignment ? 'update' : 'assign'} shift.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this shift assignment?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteShiftAssign(id);
                    message.success('Shift assignment deleted successfully.');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete shift assignment.');
                }
            },
        });
    };

    const columns: TableProps<ShiftAssignment>['columns'] = [
        { title: 'Employee', dataIndex: ['employee', 'name'], key: 'employee' },
        { title: 'Work Date', dataIndex: 'work_date', key: 'date', render: (date) => dayjs(date).format('DD MMM YYYY') },
        { title: 'Schedule', dataIndex: ['work_schedule', 'name'], key: 'schedule' },
        { title: 'Shift Time', key: 'shift_time', render: (_, record) => `${record.work_start_time} - ${record.work_end_time}` },
        { title: 'Work Hours', dataIndex: 'work_hours', key: 'work_hours', align: 'center' },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button icon={<MdDelete />} danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>
                    Assign New Shift
                </Button>
            </div>
            <Table columns={columns} dataSource={assignments} loading={isLoading} rowKey="id" scroll={{ x: 'max-content' }} />
            <Modal title={editingAssignment ? "Edit Shift Assignment" : "Assign New Shift"} open={isModalOpen} onCancel={handleModalCancel} destroyOnClose footer={null}>
                <Spin spinning={isLoading} tip="Loading data...">
                    <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: '24px' }}>
                        <Form.Item name="employee_id" label="Employee" rules={[{ required: true }]}><Select showSearch placeholder="Select an employee" filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>{employees.map(emp => <Option key={emp.id} value={emp.id}>{emp.name}</Option>)}</Select></Form.Item>
                        <Form.Item name="work_schedule_id" label="Work Schedule" rules={[{ required: true }]}><Select placeholder="Select a work schedule">{schedules.map(sch => <Option key={sch.id} value={sch.id}>{sch.name}</Option>)}</Select></Form.Item>
                        <Form.Item name="work_date" label="Work Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
                        <Row gutter={16}><Col xs={24} sm={12}><Form.Item name="work_start_time" label="Work Start Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="work_end_time" label="Work End Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col></Row>
                        <Form.Item name="work_hours" label="Total Work Hours" rules={[{ required: true }]}><InputNumber min={0} max={24} style={{ width: '100%' }} /></Form.Item>
                        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}><Button onClick={handleModalCancel} style={{ marginRight: 8 }}>Cancel</Button><Button type="primary" htmlType="submit" loading={isSubmitting}>{editingAssignment ? 'Save Changes' : 'Assign Shift'}</Button></Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </div>
    );
};


// ==============================================================================
// 3. NEW Attendance Settings Tab
// ==============================================================================
const AttendanceSettingTabContent = () => {
    const [settings, setSettings] = useState<AttendanceSetting[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSetting, setEditingSetting] = useState<AttendanceSetting | null>(null);
    const [form] = Form.useForm();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAttendanceSetting();
            setSettings(data ? [data] : []);
        } catch (error) {
            message.error('Failed to fetch attendance settings.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleModalOpen = (setting: AttendanceSetting | null) => {
        setEditingSetting(setting);
        if (setting) {
            form.setFieldsValue({
                ...setting,
                work_start_time: dayjs(setting.work_start_time, 'HH:mm:ss'),
                work_end_time: dayjs(setting.work_end_time, 'HH:mm:ss'),
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingSetting(null);
        form.resetFields();
    };

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const payload: AttendanceSettingPayload = {
            ...values,
            work_start_time: dayjs(values.work_start_time).format('HH:mm'),
            work_end_time: dayjs(values.work_end_time).format('HH:mm'),
        };

        try {
            if (editingSetting) {
                message.success('Attendance Setting updated successfully!');
            } else {
                await createAttendanceSetting(payload);
                message.success('Attendance Setting created successfully!');
            }
            handleModalCancel();
            fetchData();
        } catch (error) {
            message.error(`Failed to ${editingSetting ? 'update' : 'create'} attendance setting.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this setting?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteAttendanceSetting(id);
                    message.success('Setting deleted successfully.');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete setting.');
                }
            },
        });
    };

    const columns: TableProps<AttendanceSetting>['columns'] = [
        { title: 'Start Time', dataIndex: 'work_start_time', key: 'start_time' },
        { title: 'End Time', dataIndex: 'work_end_time', key: 'end_time' },
        { title: 'Work Hours', dataIndex: 'work_hours_per_day', key: 'work_hours', align: 'center' },
        { title: 'Grace (mins)', dataIndex: 'grace_minutes', key: 'grace_minutes', align: 'center' },
        { title: 'Overtime', dataIndex: 'overtime_allowed', key: 'overtime', render: (allowed) => (allowed ? 'Yes' : 'No'), align: 'center' },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<MdDelete />} danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>
                    Create Attendance Setting
                </Button>
            </div>
            <Table columns={columns} dataSource={settings} loading={isLoading} rowKey="id" scroll={{ x: 'max-content' }} />
            <Modal title={editingSetting ? "Edit Attendance Setting" : "Create New Attendance Setting"} open={isModalOpen} onCancel={handleModalCancel} destroyOnClose footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: '24px' }}>
                    <Row gutter={16}><Col xs={24} sm={12}><Form.Item name="work_start_time" label="Work Start Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="work_end_time" label="Work End Time" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col></Row>
                    <Row gutter={16}><Col xs={24} sm={12}><Form.Item name="work_hours_per_day" label="Work Hours/Day" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="grace_minutes" label="Grace (mins)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col></Row>
                    <Form.Item name="overtime_allowed" valuePropName="checked"><Checkbox>Overtime Allowed</Checkbox></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}><Button onClick={handleModalCancel} style={{ marginRight: 8 }}>Cancel</Button><Button type="primary" htmlType="submit" loading={isSubmitting}>{editingSetting ? 'Save Changes' : 'Create Setting'}</Button></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


// ==============================================================================
// 4. MAIN PAGE COMPONENT (DEFAULT EXPORT)
// ==============================================================================
const ScheduleManagementPage = () => {
    const tabItems: TabsProps['items'] = [
        { key: '1', label: `Work Schedules`, children: <WorkScheduleTabContent /> },
        { key: '2', label: `Shift Assignment`, children: <ShiftAssignmentTabContent /> },
        { key: '3', label: `Attendance Settings`, children: <AttendanceSettingTabContent /> }, // Added new tab
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>Schedule and Shift Management</Title>
                </Col>
            </Row>
            <Card>
                <Tabs defaultActiveKey="1" items={tabItems} />
            </Card>
        </div>
    );
};

export default ScheduleManagementPage;