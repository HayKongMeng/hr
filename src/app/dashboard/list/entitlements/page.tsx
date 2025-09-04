"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import dayjs from 'dayjs';

// --- Ant Design Components ---
import {
    Button,
    Card,
    Form,
    InputNumber,
    List,
    message,
    Modal,
    Select,
    Space,
    Spin,
    Table,
    DatePicker,
    Progress,
    Tag,
    Row,
    Col,
    Collapse,
    Tabs,
    Popconfirm
} from "antd";
import type { CollapseProps, TableProps } from 'antd';

// --- Icons (from react-icons) ---
import {MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete, MdRefresh} from "react-icons/md";

// --- API & Data ---
import {
    fetchEntitlements,
    createEntitlement,
    // updateEntitlement, 
    deleteEntitlement,
    fetchEmployeesEntitlements, generateEntitlementToEmployee, createAllEntitlement,
} from "@/lib/api/leave";
import { fetchEmployees, Employee } from "@/lib/api/employee";
import { fetchAllLeaveTypes, LeaveType } from "@/lib/api/leave";
import { useAuth } from "@/lib/AuthContext";

type LeaveEntitlement = {
    id: number;
    employee_id: number;
    leave_type_id: number;
    available_days: number; 
    used_days: number;
    remain_days: number;
    start_period: string;
    end_period: string;
    leave_type: { 
        id: number;
        type_name: string;
    };
};

type GroupedEntitlementFromApi = {
    employee_id: number;
    entitlements: LeaveEntitlement[];
};
type GroupedEntitlements = {
    [employeeId: string]: {
        employeeName: string;
        entitlements: LeaveEntitlement[];
    }
};
// --- Responsive Hook ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", handleResize); handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);
    return isMobile;
};

// --- Reusable Form Component (Updated) ---
const EntitlementForm = ({ form, onFinish, employees, leaveTypes }: { form: any; onFinish: (values: any) => void; employees: Employee[]; leaveTypes: LeaveType[] }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="employee_id" label="Employee" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select an employee" options={employees.map(e => ({ value: e.id, label: e.name }))} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
        </Form.Item>

    </Form>
);

// --- Main Page Component ---
const LeaveEntitlementPage = () => {
    const isMobile = useIsMobile();
    const [form] = Form.useForm();
    const router = useRouter();

    const { user, employee, loading: authLoading, isAuthenticated } = useAuth();

    const [isRenewing, setIsRenewing] = useState(false);

    // State for data
    const [myEntitlements, setMyEntitlements] = useState<LeaveEntitlement[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [groupedEntitlements, setGroupedEntitlements] = useState<{ [employeeId: string]: { employeeName: string; entitlements: LeaveEntitlement[] } }>({});

    // State for UI
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEntitlement, setSelectedEntitlement] = useState<LeaveEntitlement | null>(null);

    // --- DERIVED VALUES from context ---
    const isEmployee = user?.roles.includes('Employee');
    const isAdmin = user?.roles.includes('Admin');
    const currentEmployeeId = employee?.data?.id;


    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !user) return; // Guard clause
        setLoading(true);
        try {
            // --- REFACTORED ADMIN & EMPLOYEE LOGIC ---

            // Employees ONLY fetch their own entitlements and the leave types
            if (isEmployee && !isAdmin) {
                if (currentEmployeeId) {
                    const [myEntitlementsRes, leaveTypesRes] = await Promise.all([
                        fetchEmployeesEntitlements(currentEmployeeId),
                        fetchAllLeaveTypes()
                    ]);
                    setMyEntitlements(myEntitlementsRes.result.data || []);
                    setLeaveTypes(leaveTypesRes || []);
                }
            } else { // Admins and Managers fetch everything
                // 1. Fetch all necessary data in one go.
                const [empRes, ltRes, allEntitlementsRes] = await Promise.all([
                    fetchEmployees(1, 1000),
                    fetchAllLeaveTypes(),
                    fetchEntitlements()
                ]);

                const employeeList = empRes.data || [];
                setEmployees(employeeList);
                setLeaveTypes(ltRes || []);

                // 2. Process the "All Employees" data for the main tab
                const groupedDataFromApi: GroupedEntitlementFromApi[] = allEntitlementsRes.result.data || [];
                setPagination(prev => ({ ...prev, total: allEntitlementsRes.result.total_items || groupedDataFromApi.length }));

                const uiReadyGroupedData = groupedDataFromApi.reduce((
                    acc: GroupedEntitlements,
                    group: GroupedEntitlementFromApi
                ) => {
                    const empId = group.employee_id.toString();
                    const empName = employeeList.find((e: Employee) => e.id === group.employee_id)?.name || `Employee ID: ${empId}`;
                    acc[empId] = { employeeName: empName, entitlements: group.entitlements };
                    return acc;
                }, {} as GroupedEntitlements);
                setGroupedEntitlements(uiReadyGroupedData);

                // 3. Find the Admin's own entitlements from the full list
                if (currentEmployeeId) {
                    const adminEntitlementGroup = groupedDataFromApi.find(
                        (group: GroupedEntitlementFromApi) => group.employee_id === currentEmployeeId
                    );

                    if (adminEntitlementGroup) {
                        setMyEntitlements(adminEntitlementGroup.entitlements);
                    } else {
                        setMyEntitlements([]);
                    }
                }
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to fetch entitlement data.");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, isEmployee, isAdmin, currentEmployeeId]);

    useEffect(() => {
        // Fetch data only after authentication is resolved
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    // --- Show a loading spinner while AuthContext is initializing ---
    if (authLoading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    const handleModalOpen = (record: LeaveEntitlement | null) => {
        setSelectedEntitlement(record);
        if (record) {
            form.setFieldsValue({
                employee_id: record.employee_id,
                leave_type_id: record.leave_type_id,
                total_days: record.available_days, 
                used_days: record.used_days,
                period: [dayjs(record.start_period), dayjs(record.end_period)],
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => { setIsModalOpen(false); form.resetFields(); };

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            if (selectedEntitlement) {
                // An updateEntitlement function is needed for this logic
                message.info("Update functionality is not yet implemented.");
            } else {
                await generateEntitlementToEmployee(values.employee_id);
                message.success("Entitlement assigned successfully!");
            }
            handleModalCancel();
            fetchData();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Operation failed.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = (record: LeaveEntitlement) => {
        Modal.confirm({
            title: 'Delete Entitlement?',
            content: 'This will permanently remove the leave balance for this employee and type.',
            okText: 'Delete', okType: 'danger',
            onOk: async () => {
                try {
                    await deleteEntitlement(record.employee_id, record.leave_type_id);
                    message.success("Entitlement deleted.");
                    fetchData();
                } catch { message.error("Failed to delete entitlement."); }
            },
        });
    };

    const handleRenewAll = async () => {
        setIsRenewing(true);
        message.loading({ content: 'Renewing entitlements for all employees...', key: 'renew' });
        try {
            await createAllEntitlement();
            message.success({ content: 'Successfully renewed all entitlements!', key: 'renew', duration: 3 });

            fetchData();
        } catch (error: any) {
            message.error({
                content: error?.response?.data?.message || "Failed to renew entitlements.",
                key: 'renew',
                duration: 5
            });
        } finally {
            setIsRenewing(false);
        }
    };

    // This function will now decide whether to render tabs or a single view
    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-10"><Spin /></div>;
        }

        if (isEmployee && !isAdmin){
            return <EmployeeEntitlementView entitlements={myEntitlements} isMobile={isMobile} />;
        }

        const tabItems = [
            {
                key: 'all',
                label: 'All Employees',
                children: <AdminEntitlementView groupedData={groupedEntitlements} onEdit={handleModalOpen} onDelete={handleDelete} isMobile={isMobile} />,
            },
            {
                key: 'my',
                label: 'My Entitlements',
                children: <EmployeeEntitlementView entitlements={myEntitlements} isMobile={isMobile} />,
            },
        ];

        return <Tabs defaultActiveKey="all" items={tabItems} />;
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Leave Entitlements</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        {/* ... (breadcrumbs) ... */}
                    </div>
                </div>
                {isAdmin && (
                    <Space>
                        <Popconfirm
                            title="Renew All Entitlements?"
                            description="This will generate new leave balances for all employees for the current period. Are you sure?"
                            onConfirm={handleRenewAll}
                            okText="Yes, Renew All"
                            cancelText="Cancel"
                        >
                            <Button
                                icon={<MdRefresh />}
                                loading={isRenewing}
                            >
                                Renew All
                            </Button>
                        </Popconfirm>

                        <Button
                            type="primary"
                            icon={<MdAdd />}
                            onClick={() => handleModalOpen(null)}
                        >
                            Assign to Employee
                        </Button>
                    </Space>
                )}
            </div>
            <Card>
                {renderContent()}
            </Card>
            {isAdmin && (
                <Modal
                    title="Assign New Entitlement to Employee"
                    open={isModalOpen}
                    onCancel={handleModalCancel}
                    onOk={form.submit}
                    confirmLoading={isSubmitting}
                >
                    <EntitlementForm
                        form={form}
                        onFinish={handleFormSubmit}
                        employees={employees}
                        leaveTypes={leaveTypes}
                    />
                </Modal>
            )}
        </div>
    );
};

const AdminEntitlementView = ({ groupedData, onEdit, onDelete, isMobile }: { 
    groupedData: { [key: string]: { employeeName: string; entitlements: LeaveEntitlement[] } };
    onEdit: (record: LeaveEntitlement) => void;
    onDelete: (record: LeaveEntitlement) => void;
    isMobile: boolean;
}) => {
    
    // Convert the groupedData object into an array for easier mapping
    const employeeDataArray = Object.keys(groupedData).map(employeeId => ({
        id: employeeId,
        ...groupedData[employeeId]
    }));

    if (isMobile) {
        return (
            <List
                dataSource={employeeDataArray}
                renderItem={(employeeData) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<strong>{employeeData.employeeName}</strong>}
                            description={
                                <Collapse ghost size="small">
                                    <Collapse.Panel header={`${employeeData.entitlements.length} Entitlement Types`} key={employeeData.id}>
                                        <List
                                            size="small"
                                            dataSource={employeeData.entitlements}
                                            renderItem={(entitlement) => (
                                                 <List.Item>
                                                    <List.Item.Meta 
                                                        title={entitlement.leave_type.type_name}
                                                        description={`Remaining: ${entitlement.remain_days} / ${entitlement.available_days}`}
                                                    />
                                                 </List.Item>
                                            )}
                                        />
                                    </Collapse.Panel>
                                </Collapse>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    }

    // Desktop view with Collapse and nested Table
    const detailColumns: TableProps<LeaveEntitlement>['columns'] = [
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Total', dataIndex: 'available_days', key: 'total', align: 'center' },
        { title: 'Used', dataIndex: 'used_days', key: 'used', align: 'center' },
        { title: 'Remaining', dataIndex: 'remain_days', key: 'remain', align: 'center', render: (days) => <Tag color={days > 0 ? 'green' : 'red'}>{days}</Tag> },
        { title: 'Period', key: 'period', render: (_, r) => `${moment(r.start_period).format("DD MMM YY")} - ${moment(r.end_period).format("DD MMM YY")}` },
        { 
            title: 'Actions', 
            key: 'actions', 
            align: 'right', 
            render: (_, record: LeaveEntitlement) => (
                <Space>
                    <Button size="small" icon={<MdEdit />} onClick={() => onEdit(record)}>Edit</Button>
                    <Button size="small" danger icon={<MdDelete />} onClick={() => onDelete(record)}>Delete</Button>
                </Space>
            )
        }
    ];

    const items: CollapseProps['items'] = employeeDataArray.map(employeeData => ({
        key: employeeData.id,
        label: <strong>{employeeData.employeeName}</strong>,
        children: <Table columns={detailColumns} dataSource={employeeData.entitlements} rowKey="id" pagination={false} size="small" />
    }));

    return <Collapse items={items} accordion />;
};

// --- NEW: Employee-specific View ---
const EmployeeEntitlementView = ({ entitlements, isMobile }: { entitlements: LeaveEntitlement[], isMobile: boolean }) => {
    if (isMobile) {
        return (
            <List
                dataSource={entitlements}
                renderItem={(item: LeaveEntitlement) => (
                    <List.Item>
                        <List.Item.Meta
                            title={item.leave_type.type_name}
                            description={
                                <div className="flex items-center gap-2 mt-1">
                                    <Progress percent={item.available_days > 0 ? Math.round((item.used_days / item.available_days) * 100) : 0} size="small" showInfo={false} />
                                    <span>{item.remain_days} / {item.available_days} days left</span>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    }

    const columns: TableProps<LeaveEntitlement>['columns'] = [
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Total Days', dataIndex: 'available_days', key: 'total', align: 'center' },
        { title: 'Days Used', dataIndex: 'used_days', key: 'used', align: 'center' },
        { title: 'Days Remaining', dataIndex: 'remain_days', key: 'remain', align: 'center', render: (days) => <Tag color={days > 0 ? 'green' : 'red'}>{days}</Tag> },
        { title: 'Current Period', key: 'period', render: (_, r) => `${moment(r.start_period).format("DD MMM, YYYY")} - ${moment(r.end_period).format("DD MMM, YYYY")}` },
    ];
    
    return <Table columns={columns} dataSource={entitlements} rowKey="id" pagination={false} />;
};

export default LeaveEntitlementPage;