"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Ant Design Components ---
import { Button, Card, Col, DatePicker, Form, Input, List, message, Modal, Radio, Row, Select, Space, Spin, Switch, Table, Tag, Upload } from "antd";
import type { TableProps, UploadFile } from 'antd';

// --- Icons (from react-icons) ---
import { MdKeyboardArrowRight, MdAdd, MdEdit, MdDelete, MdRemoveRedEye } from "react-icons/md";

// --- API & Data ---
import { fetchEmployees, fetchAllEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/lib/api/employee";
import { fetchAllPositions } from "@/lib/api/position";
import { fetchAllDepartments } from "@/lib/api/department";
import { fetchEmploymentTypes, fetchWorkStation } from "@/lib/api/status";
import {FaFileExcel, FaUpload} from "react-icons/fa";
import {FaFilePdf} from "react-icons/fa6";

// --- Type Definitions ---
type Position = { id: number; title: string };
type Department = { id: number; name: string };
type WorkStation = { id: number; name: string };
type EmploymentType = { id: number; status_name: string };
type Employee = { id: number; user_id: number; employee_code: string; name: string; first_name: string; last_name: string; username: string; email: string; phone: string; address: string; date_of_birth: string; hire_date: string; gender: 'Male' | 'Female' | 'Other'; image?: string; position?: Position; department?: Department; work_station?: WorkStation; employment_type?: EmploymentType; created_at: string;reporting_line1?: number | null; reporting_line2?: number | null; procurement_line?: number | null; };

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



// --- Reusable Form Component ---
const EmployeeForm = ({ form, onFinish, dropdownData, loading, isEditMode }: { form: any; onFinish: (values: any) => void; dropdownData: any; loading: boolean; isEditMode: boolean; }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
        <Spin spinning={loading} tip="Loading options...">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Employee Profile</h3>
            <Row gutter={16}>
                {/* Other fields remain the same */}
                <Col xs={24} md={8}><Form.Item name="first_name" label="First Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="employee_code" label="Employee ID" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="date_of_birth" label="Birthday" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="hire_date" label="Joining Date" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24}><Form.Item name="gender" label="Gender"><Radio.Group><Radio value="Male">Male</Radio><Radio value="Female">Female</Radio><Radio value="Other">Other</Radio></Radio.Group></Form.Item></Col>
                <Col xs={24}><Form.Item name="image" label="Profile Image" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}><Upload listType="picture" maxCount={1} beforeUpload={() => false}><Button icon={<FaUpload />}>Select Image</Button></Upload></Form.Item></Col>
            </Row>

            <h3 className="text-lg font-semibold border-b pb-2 my-4">Login Credentials</h3>
            <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
                {/* CORRECTED: Use isEditMode to control password requirement */}
                {!isEditMode && (
                    <>
                        <Col xs={24} md={12}><Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="confirm_password" label="Confirm Password" dependencies={['password']} hasFeedback rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('Passwords do not match!')); } })]}><Input.Password /></Form.Item></Col>
                    </>
                )}
            </Row>

            <h3 className="text-lg font-semibold border-b pb-2 my-4">Work & Role Information</h3>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="department_id" label="Department" rules={[{ required: true }]}>
                        <Select placeholder="Select department..." options={dropdownData.departments.map((d: Department) => ({ value: d.id, label: d.name }))} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="position_id" label="Designation" rules={[{ required: true }]}>
                        <Select placeholder="Select designation..." options={dropdownData.positions.map((p: Position) => ({ value: p.id, label: p.title }))} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="work_station_id" label="Work Station" rules={[{ required: true }]}>
                        <Select placeholder="Select work station..." options={dropdownData.workStations.map((ws: WorkStation) => ({ value: ws.id, label: ws.name }))} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="employment_type_id" label="Employment Status" rules={[{ required: true }]}>
                        <Select placeholder="Select status..." options={dropdownData.employmentTypes.map((et: EmploymentType) => ({ value: et.id, label: et.status_name }))} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item name="reporting_line1" label="Reporting Line 1">
                        <Select
                            showSearch
                            allowClear
                            placeholder="Select manager..."
                            options={dropdownData.employees.map((e: Employee) => ({ value: e.id, label: e.name }))}
                            filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item name="reporting_line2" label="Reporting Line 2">
                        <Select
                            showSearch
                            allowClear
                            placeholder="Select manager..."
                            options={dropdownData.employees.map((e: Employee) => ({ value: e.id, label: e.name }))}
                            // --- FIX APPLIED HERE ---
                            filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item name="procurement_line" label="Procurement Line">
                        <Select
                            showSearch
                            allowClear
                            placeholder="Select manager..."
                            options={dropdownData.employees.map((e: Employee) => ({ value: e.id, label: e.name }))}
                            filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        />
                    </Form.Item>
                </Col>
                {/* Address is usually not required, so we leave it as is */}
                <Col xs={24}>
                    <Form.Item name="address" label="Address">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Col>
            </Row>
        </Spin>
    </Form>
);


// --- Main Page Component ---
const EmployeeManagementPage = () => {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [dropdownLoading, setDropdownLoading] = useState(false);

    const [dropdownData, setDropdownData] = useState<{ 
        positions: any[], 
        departments: any[], 
        workStations: any[], 
        employmentTypes: any[],
        employees: Employee[] 
    }>({ positions: [], departments: [], workStations: [], employmentTypes: [], employees: [] });

    const fetchData = useCallback(async (page: number, pageSize: number) => {
        setLoading(true);
        try {
            const res = await fetchEmployees(page, pageSize);
            setEmployees(res.data || []);
            setPagination({ current: page, pageSize, total: res.total_items });
        } catch (error) { message.error("Failed to fetch employees."); }
        finally { setLoading(false); }
    }, []);

    const fetchDropdowns = useCallback(async () => {
        if (dropdownData.positions.length > 0) return; 
        setDropdownLoading(true);
        try {
            const [posRes, depRes, wsRes, etRes, empRes] = await Promise.all([ 
                fetchAllPositions(), 
                fetchAllDepartments(), 
                fetchWorkStation(), 
                fetchEmploymentTypes(),
                fetchAllEmployees() 
            ]);
            setDropdownData({ 
                positions: posRes || [], 
                departments: depRes || [], 
                workStations: wsRes || [], 
                employmentTypes: etRes || [],
                employees: empRes || []
            });
        } catch(error) { 
            console.error("Failed to load dropdown data:", error);
            message.error("Failed to load required data for the form."); }
        finally { setDropdownLoading(false); }
    }, [dropdownData.positions.length]);

    useEffect(() => { setIsClient(true); }, []);
    
    useEffect(() => {
        if (isClient) {
            const debounce = setTimeout(() => fetchData(pagination.current, pagination.pageSize), 300);
            return () => clearTimeout(debounce);
        }
    }, [isClient, pagination.current, pagination.pageSize, fetchData]);

    // --- 4. THE CONDITIONAL RETURN NOW COMES AFTER ALL HOOKS ---
    if (!isClient) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }
    const handleExportExcel = (data: Employee[]) => {
        const headers = ["Employee ID", "Name", "Email", "Department", "Designation", "Joining Date"];

        const body = data.map(employee => [
            employee.employee_code,
            employee.name,
            employee.email,
            employee.department?.name || 'N/A',
            employee.position?.title || 'N/A',
            dayjs(employee.hire_date).format("DD MMM YYYY")
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

        XLSX.writeFile(workbook, "Employee_List.xlsx");
        message.success("Exported to Excel successfully!");
    };

    const handleExportPdf = (data: Employee[]) => {
        const doc = new jsPDF();

        const tableHead = [["Employee ID", "Name", "Email", "Department", "Designation", "Joining Date"]];
        const tableBody = data.map(employee => [
            employee.employee_code,
            employee.name,
            employee.email,
            employee.department?.name || 'N/A',
            employee.position?.title || 'N/A',
            dayjs(employee.hire_date).format("DD MMM YYYY")
        ]);

        doc.text("Employee List", 14, 15);

        autoTable(doc, {
            head: tableHead,
            body: tableBody,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] }
        });

        doc.save('Employee_List.pdf');
        message.success("Exported to PDF successfully!");
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        message.loading({ content: `Exporting all employees to ${format.toUpperCase()}...`, key: 'export' });
        try {
            const allEmployees = await fetchAllEmployees();
            if (!allEmployees || allEmployees.length === 0) {
                message.warning({ content: "No employee data to export.", key: 'export' });
                return;
            }

            if (format === 'excel') {
                handleExportExcel(allEmployees);
            } else if (format === 'pdf') {
                handleExportPdf(allEmployees);
            }

            // Clear the loading message on success
            message.destroy('export');

        } catch (error) {
            console.error(`Failed to export to ${format}:`, error);
            message.error({ content: `Failed to export to ${format.toUpperCase()}.`, key: 'export' });
        }
    };

    const handleModalOpen = (record: Employee | null) => {
        setSelectedEmployee(record);
        fetchDropdowns();
        if (record) {
            const imageFileList: UploadFile[] = record.image ? [{ uid: '-1', name: 'profile.png', status: 'done', url: record.image }] : [];
            form.setFieldsValue({
                ...record,
                date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
                hire_date: record.hire_date ? dayjs(record.hire_date) : null,
                position_id: record.position?.id,
                department_id: record.department?.id,
                work_station_id: record.work_station?.id,
                employment_type_id: record.employment_type?.id,
                image: imageFileList,
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => { setIsModalOpen(false); form.resetFields(); setSelectedEmployee(null); };

    const handleFormSubmit = async (values: any) => {
        setIsSubmitting(true);
        const key = "employee_submission";
        message.loading({ content: "Saving employee...", key });

        try {
            const imageFile = values.image?.[0]?.originFileObj;

            const payload = {
                ...values,
                date_of_birth: dayjs(values.date_of_birth).format('YYYY-MM-DD'),
                hire_date: dayjs(values.hire_date).format('YYYY-MM-DD'),
                image: imageFile,
            };
            delete payload.confirm_password;

            if (selectedEmployee) {
                const authPayload = {
                    username: payload.username,
                    email: payload.email,
                    password: payload.password,
                };
                delete payload.username;
                delete payload.email;
                delete payload.password;
                
                if (!imageFile) {
                    delete payload.image;
                }
                
                await updateEmployee(
                    selectedEmployee.id,
                    selectedEmployee.user_id,
                    authPayload,
                    payload
                );
                message.success({ content: "Employee updated successfully!", key, duration: 2 });
            } else {
                const test = await createEmployee(payload);
                console.log("Created Employee:", test);
                message.success({ content: "Employee created successfully!", key, duration: 2 });
            }

            handleModalCancel();
            fetchData(pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Failed to save employee:", error);
            const errorMessage = error?.response?.data?.exception?.message || error?.response?.data?.message || "Operation failed.";
            message.error({ content: errorMessage, key, duration: 5 });
        } finally {
            setIsSubmitting(false);
        }
    };  
    
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Employee?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteEmployee(id);
                    message.success("Employee deleted.");
                    fetchData(pagination.current, pagination.pageSize);
                } catch { message.error("Failed to delete employee."); }
            },
        });
    };
    
    const handleTableChange: TableProps<Employee>['onChange'] = (p) => {
        setPagination(prev => ({ ...prev, current: p.current!, pageSize: p.pageSize! }));
    };

    const columns: TableProps<Employee>['columns'] = [
        { title: 'Employee ID', dataIndex: 'employee_code', key: 'code', render: (text, record) => <Link href={`/dashboard/list/employees/${record.id}`}>{text}</Link> },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Department', dataIndex: ['department', 'name'], key: 'department' },
        { title: 'Designation', dataIndex: ['position', 'title'], key: 'position' },
        { title: 'Joining Date', dataIndex: 'hire_date', key: 'hire_date', render: (date) => dayjs(date).format("DD MMM YYYY") },
        { title: 'Actions', key: 'actions', align: 'right', render: (_, record) => (
            <Space>
                <Link href={`/dashboard/list/employees/${record.id}`}><Button icon={<MdRemoveRedEye />} /></Link>
                <Button icon={<MdEdit />} onClick={() => handleModalOpen(record)} />
                <Button danger icon={<MdDelete />} onClick={() => handleDelete(record.id)} />
            </Space>
        )}
    ];

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Manage Employees</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
                        <MdKeyboardArrowRight /><span>Employees</span>
                    </div>
                </div>
                <Space>
                    {/* --- NEW: Export Buttons --- */}
                    <Button icon={<FaFileExcel />} onClick={() => handleExport('excel')}>Export Excel</Button>
                    <Button icon={<FaFilePdf />} onClick={() => handleExport('pdf')}>Export PDF</Button>
                    <Button type="primary" icon={<MdAdd />} onClick={() => handleModalOpen(null)}>Add Employee</Button>
                </Space>
            </div>

            <Card>
                <div className="flex justify-end mb-4"><Input.Search placeholder="Search employees..." onSearch={(value) => setSearchQuery(value)} style={{ width: 250 }} /></div>
                {isMobile ? (
                    <List
                        loading={loading}
                        dataSource={employees}
                        renderItem={(item) => (
                            <List.Item actions={[ <Button type="text" shape="circle" icon={<MdEdit />} onClick={() => handleModalOpen(item)} />, <Button type="text" shape="circle" danger icon={<MdDelete />} onClick={() => handleDelete(item.id)} /> ]}>
                                <List.Item.Meta title={<Link href={`/dashboard/list/employees/${item.id}`}>{item.name}</Link>} description={`${item.position?.title || 'N/A'} | ${item.email}`} />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Table columns={columns} dataSource={employees} rowKey="id" loading={loading} pagination={pagination} onChange={handleTableChange} />
                )}
            </Card>

            <Modal
                title={selectedEmployee ? "Edit Employee" : "Add New Employee"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={form.submit}
                confirmLoading={isSubmitting}
                width={isMobile ? '100%' : 900}
                style={isMobile ? { top: 0, padding: 0, height: '100vh', maxWidth: '100vw' } : {}}
                styles={isMobile ? { body: { overflowY: 'auto', height: 'calc(100vh - 108px)' } } : {}}
            >
                <div className={isMobile ? 'p-4' : ''}>
                    <EmployeeForm form={form} onFinish={handleFormSubmit} dropdownData={dropdownData} loading={dropdownLoading} isEditMode={!!selectedEmployee}/>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeManagementPage;