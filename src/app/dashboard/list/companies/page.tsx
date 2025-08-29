"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import { Button, Card, DatePicker, Form, Input, List, message, Modal, Select, Space, Spin, Switch, Table, Tabs, Tag } from "antd";
import type { TableProps } from 'antd';

// --- Icons (from react-icons) ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete, MdRemoveRedEye } from "react-icons/md";
import { FiEye } from "react-icons/fi";

// --- API & Data ---
import { fetchCompanies, createCompany, updateCompany, deleteCompany } from "@/lib/api/company";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/lib/api/department";
import { Employee, fetchAllEmployees } from "@/lib/api/employee";
import dayjs from "dayjs";
import { createCompanyHistory } from "@/lib/api/companyHistory";
import Link from "next/link";
import {useAuth} from "@/lib/AuthContext";

// --- Type Definitions ---
type Company = {
    id: number;
    name: string;
    company_code: string;
    type: string;
    email: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    zip_code: string;
    address: string;
    account_url: string;
    website: string;
    status: boolean;
    longitude: number;
    latitude: number;
    posted_by: number;
    created_at: string;
};

type Department = {
    id: number;
    name: string;
    code: string;
    description: string;
    company: { id: number; name: string; };
    created_at: string;
};

// --- Responsive Hook ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);
    return isMobile;
};

// --- Reusable Form for Company ---
const CompanyForm = ({ form, onFinish, isEditMode, employees }: { form: any; onFinish: (values: any) => void; isEditMode: boolean; employees: Employee[] }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="company_code" label="Company Code" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
        </Form.Item>
        <Form.Item name="account_url" label="Account URL" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
        </Form.Item>

        {/* --- CHANGE: Conditional fields for assigning an employee on create --- */}
        {!isEditMode && (
            <>
                <h3 className="text-md font-semibold border-t pt-4 mt-4 mb-2">Assign to Employee</h3>
                <Form.Item name="employee_id" label="Assign to Employee" rules={[{ required: true, message: "Please select an employee to manage this company." }]}>
                    <Select showSearch placeholder="Select an employee" options={employees.map(e => ({ value: e.id, label: e.name }))} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
                </Form.Item>
                <Form.Item name="start_date" label="Assignment Start Date" rules={[{ required: true, message: "Please set a start date." }]}>
                    <DatePicker className="w-full" />
                </Form.Item>
            </>
        )}
    </Form>
);

// --- Reusable Form for Department ---
const DepartmentForm = ({ form, onFinish }: { form: any; onFinish: (values: any) => void; }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="code" label="Department Code" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
        </Form.Item>
    </Form>
);

// --- View for Managing Companies ---
const CompaniesView = ({ isMobile }: { isMobile: boolean }) => {
    const [form] = Form.useForm();
    const [data, setData] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<Company | null>(null);

    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const [companyRes, employeeRes] = await Promise.all([
                fetchCompanies(page, pageSize), 
                fetchAllEmployees() 
            ]);
            
            setData(companyRes.data || []); 
            setPagination({ current: page, pageSize, total: companyRes.total_items });
            setEmployees(employeeRes || []);

        } catch (error) { 
            message.error("Failed to fetch company data."); 
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { 
        fetchData(pagination.current, pagination.pageSize); 
    }, [fetchData]);

    const handleModalOpen = (record: Company | null) => {
        setSelected(record);
        form.setFieldsValue(record ? { ...record } : { status: true });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelected(null);
    };

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            if (selected) {
                await updateCompany(selected.id, values); 
                message.success("Company updated successfully!");
            } else {
                const companyPayload = {
                    name: values.name,
                    company_code: values.company_code,
                    email: values.email,
                    account_url: values.account_url,
                    status: values.status,
                };

                const newCompanyResponse = await createCompany(companyPayload);
                const newCompanyId = newCompanyResponse.result?.data?.id;

                if (!newCompanyId) {
                    throw new Error("Failed to get ID of the new company.");
                }
                
                message.success("Company created! Now assigning to employee...");

                const historyPayload = {
                    company_id: newCompanyId,
                    employee_id: values.employee_id,
                    start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
                    end_date: "9999-12-31", 
                    notes: "Initial assignment on creation.",
                };
                await createCompanyHistory(historyPayload);
                message.success("Company successfully assigned to employee!");
            }
            handleModalCancel();
            fetchData();
        } catch (error: any) { message.error(error?.response?.data?.message || "Operation failed."); }
        finally { setIsSubmitting(false); }
    };
    
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Company?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteCompany(id);
                    message.success("Company deleted.");
                    fetchData();
                } catch (error) { message.error("Failed to delete company."); }
            },
        });
    };

    const columns: TableProps<Company>['columns'] = [
        { title: "Code", dataIndex: "company_code", key: "company_code" },
        { title: "Company Name", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Status", dataIndex: "status", key: "status", render: (status) => <Tag color={status ? 'green' : 'red'}>{status ? 'Active' : 'Inactive'}</Tag> },
        { title: "Created", dataIndex: "created_at", key: "created_at", render: (date) => moment(date).format("DD MMM YYYY") },
        { title: "Actions", key: "actions", render: (_, record) => (
            <Space>
                <Link href={`/dashboard/list/companies/${record.id}`}><Button icon={<MdRemoveRedEye />} /></Link>
                <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
            </Space>
        )}
    ];

    return (
        <Card title="All Companies" extra={<Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Company</Button>}>
            {isMobile ? (
                <List
                    loading={loading}
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                                <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                            ]}
                        >
                            <List.Item.Meta title={item.name} description={`Code: ${item.company_code} | Status: ${item.status ? 'Active' : 'Inactive'}`} />
                        </List.Item>
                    )}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(p) => fetchData(p.current, p.pageSize)}
                />
            )}
             <Modal title={selected ? "Edit Company" : "Add Company"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting} width={isMobile ? '100%' : 720} style={isMobile ? { top: 0, padding: 0, height: '100vh' } : {}} >
                <CompanyForm form={form} onFinish={handleFormSubmit} isEditMode={!!selected} employees={employees} />
             </Modal>
        </Card>
    );
};

// --- View for Managing Departments ---
const DepartmentsView = ({ isMobile }: { isMobile: boolean }) => {
    const [form] = Form.useForm();
    const [data, setData] = useState<Department[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<Department | null>(null);
    const [companyId, setCompanyId] = useState<number | null>(null);

    useEffect(() => {
        const storedCompanyId = localStorage.getItem('company_id');
        if (storedCompanyId) {
            setCompanyId(Number(storedCompanyId));
        }
    }, []);

    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const [deptRes, compRes] = await Promise.all([
                fetchDepartments(page, pageSize),
                fetchCompanies(1, 500) // Fetch all companies for the select dropdown
            ]);
            setData(deptRes.data || []);
            setPagination({ current: page, pageSize, total: deptRes.total_items });
            setCompanies(compRes.data || []);
        } catch (error) { message.error("Failed to fetch data."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleModalOpen = (record: Department | null) => {
        setSelected(record);
        form.setFieldsValue(record ? { ...record, company_id: record.company.id } : {});
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelected(null);
    };

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            if (!companyId) {
                message.error("Company ID not found. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            const payload = { ...values, company_id: Number(companyId) };

            if (selected) {
                await updateDepartment( selected.id, payload );
                message.success("Department updated successfully!");
            } else {
                await createDepartment(payload);
                message.success("Department created successfully!");
            }
            handleModalCancel();
            fetchData();
        } catch (error: any) { message.error(error?.response?.data?.message || "Operation failed."); }
        finally { setIsSubmitting(false); }
    };
    
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Department?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteDepartment(id);
                    message.success("Department deleted.");
                    fetchData();
                } catch (error) { message.error("Failed to delete department."); }
            },
        });
    };

    const columns: TableProps<Department>['columns'] = [
        { title: "Department Name", dataIndex: "name", key: "name" },
        { title: "Code", dataIndex: "code", key: "code" },
        { title: "Company", dataIndex: ['company', 'name'], key: "company" },
        { title: "Created", dataIndex: "created_at", key: "created_at", render: (date) => moment(date).format("DD MMM YYYY") },
        { title: "Actions", key: "actions", render: (_, record) => (
            <Space>
                <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
            </Space>
        )}
    ];

    return (
        <Card title="All Departments" extra={<Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Department</Button>}>
             {isMobile ? (
                <List
                    loading={loading}
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                                <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                            ]}
                        >
                            <List.Item.Meta title={item.name} description={`Company: ${item.company.name}`} />
                        </List.Item>
                    )}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(p) => fetchData(p.current, p.pageSize)}
                />
            )}
             <Modal title={selected ? "Edit Department" : "Add Department"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting} width={isMobile ? '100%' : 520} style={isMobile ? { top: 0, padding: 0, height: '100vh' } : {}}>
                <DepartmentForm form={form} onFinish={handleFormSubmit} />
             </Modal>
        </Card>
    );
};

// --- Main Page Component ---
const OrganizationSetupPage = () => {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => { setIsClient(true); }, []);
    const userRole = user?.roles?.[0];

    const getTabItems = () => {

        const items = [
            { 
                key: 'departments', 
                label: 'Departments', 
                children: <DepartmentsView isMobile={isMobile} /> 
            },
        ];

        if (userRole === 'Super Admin') {
            items.unshift({ 
                key: 'companies', 
                label: 'Companies', 
                children: <CompaniesView isMobile={isMobile} /> 
            });
        }
        
        return items;
    };

    if (!isClient || authLoading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }


    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Organization Setup</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight />
                        <span>Organization</span>
                    </div>
                </div>
            </div>
            <Tabs 
                key={userRole}
                defaultActiveKey={userRole === 'Super Admin' ? 'companies' : 'departments'}
                items={getTabItems()} 
            />
        </div>
    );
};

export default OrganizationSetupPage;