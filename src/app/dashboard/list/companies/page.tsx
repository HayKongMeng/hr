"use client";

import {useEffect, useState, useCallback, useRef} from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

// --- Ant Design Components ---
import {
    Button,
    Card, Col,
    DatePicker,
    Form,
    Input, InputNumber,
    List,
    message,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Table,
    Tabs,
    Tag,
    TimePicker
} from "antd";
import type { TableProps } from 'antd';

// --- Icons (from react-icons) ---
import {MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete, MdRemoveRedEye, MdPrint} from "react-icons/md";
import { FiEye } from "react-icons/fi";

// --- API & Data ---
import {fetchCompanies, createCompany, updateCompany, deleteCompany, getCompanyById} from "@/lib/api/company";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/lib/api/department";
import { Employee, fetchAllEmployees } from "@/lib/api/employee";
import dayjs from "dayjs";
import {createCompanyHistory, fetchCompanyHistories} from "@/lib/api/companyHistory";
import Link from "next/link";
import {useAuth} from "@/lib/AuthContext";
import FormModal from "@/components/FormModal";
import CompanyHistoryForm from "@/components/forms/CompanyHistoryForm";
import {FaCrosshairs, FaQrcode} from "react-icons/fa";
import {useReactToPrint} from "react-to-print";
import PrintableQrCode from "@/components/PrintableQrCode";
import jsPDF from "jspdf";
import QRCode from 'qrcode';
import html2canvas from "html2canvas";

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
    scan_code: string;
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

// --- Reusable Form for Company (EXPANDED) ---
const CompanyForm = ({ form, onFinish, isEditMode, employees }: { form: any; onFinish: (values: any) => void; isEditMode: boolean; employees: Employee[] }) => {
    const handleCaptureLocation = () => {
        if (navigator.geolocation) {
            message.loading({content: 'Fetching location...', key: 'geo'});
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    form.setFieldsValue({
                        latitude: latitude.toFixed(6), // Set form value for latitude
                        longitude: longitude.toFixed(6) // Set form value for longitude
                    });
                    message.success({content: 'Location captured!', key: 'geo', duration: 2});
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    message.error({
                        content: 'Could not get location. Please ensure you have given permission.',
                        key: 'geo',
                        duration: 4
                    });
                }
            );
        } else {
            message.error("Geolocation is not supported by your browser.");
        }
    };
    return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="name" label="Company Name" rules={[{required: true}]}>
                    <Input placeholder="e.g., DPD Data Center"/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="company_code" label="Company Code" rules={[{required: true}]}>
                    <Input placeholder="e.g., DPDC001"/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="scan_code" label="Scan Code (for QR)">
                    <Input placeholder="e.g., QLM-HR-001" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="work_time" label="Work Hours">
                    <TimePicker.RangePicker className="w-full" format="h:mm a" use12Hours />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{required: true, type: 'email'}]}>
                    <Input placeholder="e.g., contact@company.com"/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="phone" label="Phone Number">
                    <Input placeholder="e.g., +85512345678"/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="website" label="Website URL">
                    <Input placeholder="e.g., https://company.com"/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="account_url" label="Account URL" rules={[{required: true}]}>
                    <Input placeholder="e.g., company.account.com"/>
                </Form.Item>
            </Col>
        </Row>

        <h3 className="text-md font-semibold border-t pt-4 mt-2 mb-2">Location Details</h3>
        <Row gutter={16}>
            <Col span={24}>
                <Form.Item name="address" label="Address">
                    <Input.TextArea rows={2} placeholder="Enter full address"/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="city" label="City">
                    <Input placeholder="e.g., Phnom Penh"/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="province" label="Province / State">
                    <Input placeholder="e.g., Phnom Penh"/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="country" label="Country">
                    <Input placeholder="e.g., Cambodia"/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="zip_code" label="Zip / Postal Code">
                    <Input placeholder="e.g., 120100"/>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={16} align="bottom">
            <Col span={9}>
                <Form.Item name="latitude" label="Latitude">
                    <InputNumber style={{ width: '100%' }} placeholder="e.g., 11.556370" />
                </Form.Item>
            </Col>
            <Col span={9}>
                <Form.Item name="longitude" label="Longitude">
                    <InputNumber style={{ width: '100%' }} placeholder="e.g., 104.888535" />
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item>
                    <Button
                        icon={<FaCrosshairs />}
                        onClick={handleCaptureLocation}
                        className="w-full"
                    >
                        Capture
                    </Button>
                </Form.Item>
            </Col>
        </Row>

        <Form.Item name="status" label="Status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive"/>
        </Form.Item>
    </Form>
    );
};

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

type CompanyHistory = {
    id: number;
    employee: { name: string; };
    company: { name: string; };
    start_date: string;
    notes: string;
};

const CompanyHistoryView = () => {
    const [form] = Form.useForm();
    const [histories, setHistories] = useState<CompanyHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for dropdowns
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [dropdownLoading, setDropdownLoading] = useState(false);

    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await fetchCompanyHistories(page, pageSize);
            setHistories(res.data || []);
            setPagination({ current: page, pageSize, total: res.total_items });
        } catch (error) {
            message.error("Failed to fetch company history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
    }, [fetchData, pagination.current, pagination.pageSize]);

    const fetchDropdowns = async () => {
        // Only fetch if data is not already loaded
        if (employees.length === 0 || companies.length === 0) {
            setDropdownLoading(true);
            try {
                const [empRes, compRes] = await Promise.all([
                    fetchAllEmployees(),
                    fetchCompanies(1, 1000)
                ]);
                setEmployees(empRes || []);
                setCompanies(compRes.data || []);
            } catch (error) {
                message.error("Failed to load data for the form.");
            } finally {
                setDropdownLoading(false);
            }
        }
    };

    const handleModalOpen = () => {
        fetchDropdowns();
        form.resetFields();
        form.setFieldsValue({
            start_date: dayjs()
        });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };



    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...values,
                start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
                end_date: "9999-12-31",
            };
            await createCompanyHistory(payload);
            message.success("Employee assigned to company successfully!");
            handleModalCancel();
            fetchData();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Operation failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: TableProps<CompanyHistory>['columns'] = [
        { title: "Employee", dataIndex: ['employee', 'name'], key: "employee" },
        { title: "Company", dataIndex: ['company', 'name'], key: "company" },
        { title: "Start Date", dataIndex: "start_date", key: "start_date", render: (date) => moment(date).format("DD MMM YYYY") },
        { title: "Notes", dataIndex: "notes", key: "notes", ellipsis: true },
    ];

    return (
        <>
            <Card
                title="Company Assignment History"
                extra={<Button type="primary" icon={<MdAdd />} onClick={handleModalOpen}>Assign Employee</Button>}
            >
                <Table
                    columns={columns}
                    dataSource={histories}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(p) => fetchData(p.current, p.pageSize)}
                />
            </Card>

            {/* --- THE FIX IS HERE: Form is now directly inside the Modal --- */}
            <Modal
                title="Assign Employee to Company"
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
                width={700}
            >
                <Spin spinning={dropdownLoading} tip="Loading options...">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFormSubmit}
                        initialValues={{ notes: '' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="employee_id"
                                    label="Employee"
                                    rules={[{ required: true, message: "Please select an employee." }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select an employee"
                                        options={employees.map(e => ({ value: e.id, label: e.name }))}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="company_id"
                                    label="Assign to Company"
                                    rules={[{ required: true, message: "Please select a company." }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select a company"
                                        options={companies.map(c => ({ value: c.id, label: c.name }))}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="start_date"
                                    label="Assignment Start Date"
                                    rules={[{ required: true, message: "Please set a start date." }]}
                                >
                                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="notes"
                                    label="Notes (Optional)"
                                >
                                    <Input.TextArea rows={3} placeholder="e.g., Initial assignment, promotion, etc." />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

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

                    type: values.type,
                    phone: values.phone,
                    country: values.country,
                    province: values.province,
                    city: values.city,
                    zip_code: values.zip_code,
                    address: values.address,
                    website: values.website,
                    // longitude and latitude are typically set via a map picker,
                    // so we'll omit them for a manual text form for now.
                };

                const newCompanyResponse = await createCompany(companyPayload);
                const newCompanyId = newCompanyResponse.result?.data?.id;

                if (!newCompanyId) {
                    throw new Error("Failed to get ID of the new company.");
                }

                message.success("Company created! Now assigning to employee...");
            }
            handleModalCancel();
            fetchData();
        } catch (error: any) {
            message.error(error?.response?.data?.exception?.message || "Operation failed.");
        } finally {
            setIsSubmitting(false);
        }
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
const DepartmentsView = ({ isMobile,canManage  }: { isMobile: boolean , canManage: boolean}) => {
    const [form] = Form.useForm();
    const [data, setData] = useState<Department[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<Department | null>(null);

    const { user, employee } = useAuth();
    const companyId = employee?.data?.company_id;

    const fetchData = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const deptRes = await fetchDepartments(page, pageSize);
            setData(deptRes.data || []);
            setPagination({ current: page, pageSize, total: deptRes.total_items });
        } catch (error) {
            message.error("Failed to fetch departments.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
    }, [fetchData, pagination.current, pagination.pageSize]);

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
    ];

    if (canManage) {
        columns.push({
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)}>Edit</Button>
                    <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            )
        });
    }

    return (
        <Card title="All Departments" extra={canManage && <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Department</Button>}>
             {isMobile ? (
                <List
                    loading={loading}
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item
                            actions={canManage ? [
                                <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />,
                                <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} />,
                            ]: []}
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
            {canManage && (
                 <Modal title={selected ? "Edit Department" : "Add Department"} open={isModalOpen} onCancel={handleModalCancel} onOk={form.submit} confirmLoading={isSubmitting} width={isMobile ? '100%' : 520} style={isMobile ? { top: 0, padding: 0, height: '100vh' } : {}}>
                    <DepartmentForm form={form} onFinish={handleFormSubmit} />
                 </Modal>
            )}
        </Card>
    );
};

// --- Main Page Component ---
const OrganizationSetupPage = () => {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const { user, employee, isAuthenticated, loading: authLoading } = useAuth();

    const employeePrintRef = useRef<HTMLDivElement>(null);
    const [employeeToPrint, setEmployeeToPrint] = useState<{name: string; scan_code: string} | null>(null);
    const [isExporting, setIsExporting] = useState(false);


    const handleExportQrToPdf = useCallback(async () => {
        const scanCode = employee?.data?.scan_code;

        if (!scanCode) {
            message.error("No scan code is available to export.");
            return;
        }

        setIsExporting(true);
        message.loading({ content: 'Generating PDF...', key: 'pdf_export' });

        try {
            const qrCodeDataURL = await QRCode.toDataURL(scanCode, {
                errorCorrectionLevel: 'H', // High error correction
                width: 200, // Width in pixels
                margin: 2,
            });

            const doc = new jsPDF('portrait', 'mm', 'a4');

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageCenter = pageWidth / 2;

            doc.setFontSize(16);

            const qrCodeSize = 80;
            const qrCodeX = pageCenter - (qrCodeSize / 2);
            const qrCodeY = 50;
            doc.addImage(qrCodeDataURL, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

            doc.setFontSize(12);
            doc.setFont('courier');
            doc.text(scanCode, pageCenter, qrCodeY + qrCodeSize + 10, { align: 'center' });

            doc.save(`qrcode-${scanCode}.pdf`);

            message.success({ content: 'PDF exported successfully!', key: 'pdf_export' });

        } catch (error) {
            console.error("Error creating PDF:", error);
            message.error({ content: 'Failed to create PDF.', key: 'pdf_export' });
        } finally {
            setIsExporting(false);
        }

    }, [employee]);



    useEffect(() => { setIsClient(true); }, []);
    const userRole = user?.roles?.[0];

    const getTabItems = () => {
        const items = [];

        if (userRole === 'Super Admin') {
            items.push(
                {
                    key: 'companies',
                    label: 'Companies',
                    children: <CompaniesView isMobile={isMobile} />
                },
                {
                    key: 'history',
                    label: 'Company History',
                    children: <CompanyHistoryView />
                }
            );
        }
        else if (userRole === 'Admin') {
            items.push(
                {
                    key: 'departments',
                    label: 'Departments',
                    children: <DepartmentsView isMobile={isMobile} canManage={true} />
                }
            );
        }
        else {
            items.push({
                key: 'departments',
                label: 'Departments',
                children: <DepartmentsView isMobile={isMobile} canManage={false} />
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
                {(employee?.data?.scan_code) && (
                    <Button
                        type="primary"
                        icon={<FaQrcode />}
                        onClick={handleExportQrToPdf}
                        loading={isExporting}
                    >
                        Print My QR Code
                    </Button>
                )}
            </div>
            <Tabs 
                key={userRole}
                defaultActiveKey={userRole === 'Super Admin' ? 'companies' : 'departments'}
                items={getTabItems()} 
            />


                {employeeToPrint && (
                    <PrintableQrCode
                        ref={employeePrintRef}
                        companyName={employeeToPrint.name} // Display employee name
                        scanCode={employeeToPrint.scan_code}
                    />
                )}
        </div>
    );
};

export default OrganizationSetupPage;