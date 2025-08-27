"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import moment from "moment"; // Useful for simple date formatting in the table

// --- Ant Design Components ---
import {
  DatePicker,
  Input,
  Select,
  Modal,
  Form,
  Checkbox,
  Button,
  Table,
  Space,
  Tag,
  Card,
  Row,
  Col,
  List,
  Spin,
  Pagination,
  message, // Added for user feedback
} from "antd";
import type { TableProps } from "antd";

// --- Icons ---
import { BsSortDown } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
import { BiCalendar } from "react-icons/bi";
import {IoIosClose, IoMdAdd} from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";

// --- API functions ---
import {
  fetchHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/lib/api/holidays";
import Cookies from "js-cookie";
import {useAuth} from "@/lib/AuthContext";
import OptionCard from "@/components/ui/OptionCard";

// --- Type Definitions ---
type HolidayType = "Public" | "Optional" | "Company" | "Regional";
type Holiday = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  description: string;
  type: HolidayType;
  is_recurring: boolean;
};

// --- Helper Hook for Screen Size ---
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
};

// --- Main Component ---
const HolidayPage = () => {
  const isMobile = useIsMobile();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // const [userRole, setUserRole] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const router = useRouter();

  // --- Data Fetching ---
  const getHolidays = useCallback(async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await fetchHolidays(page, pageSize);
      // It's safer to access res.result.data if your API is consistent
      const holidayData = res.data || []; 
      setHolidays(holidayData);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: res.total_items || 0,
      }));
    } catch (err: any) {
      message.error(err.message || "Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            getHolidays(pagination.current, pagination.pageSize);
        }
    }, [authLoading, isAuthenticated, pagination.current, pagination.pageSize, getHolidays]);

  // --- Handlers ---
  const refreshData = () => {
    getHolidays(pagination.current, pagination.pageSize);
  };

  const handleTableChange: TableProps<Holiday>['onChange'] = (newPagination) => {
    setPagination(prev => ({
        ...prev,
        current: newPagination.current || 1,
        pageSize: newPagination.pageSize || 10,
    }));
  };
  
  const handleOpenModal = (holiday: Holiday | null) => {
    setSelectedHoliday(holiday);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHoliday(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedHoliday) {
        await updateHoliday(selectedHoliday.id, values);
        message.success("Holiday updated successfully!");
      } else {
        await createHoliday(values);
        message.success("Holiday created successfully!");
      }
      handleCloseModal();
      refreshData();
    } catch (err) {
      console.error("Failed to save holiday:", err);
      message.error("Failed to save holiday.");
    }
  };

  const handleDelete = (holidayId: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this holiday?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteHoliday(holidayId);
          message.success("Holiday deleted.");
          refreshData();
        } catch (err) {
          console.error("Failed to delete holiday:", err);
          message.error("Failed to delete holiday.");
        }
      },
    });
  };

  const isAdmin = user?.roles.includes('Admin');
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

  return (
    <div className="p-4">
      {isMobile ? (
        <MobileView
          holidays={holidays}
          loading={loading}
          onAdd={() => handleOpenModal(null)}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          pagination={pagination}
          isAdmin={isAdmin}
          onPageChange={() => setPagination(prev => ({...prev}))}
        />
      ) : (
        <DesktopView
          holidays={holidays}
          loading={loading}
          onAdd={() => handleOpenModal(null)}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          router={router}
          pagination={pagination}
          isAdmin={isAdmin}
          onTableChange={handleTableChange}
        />
      )}

        {isAdmin && (
            <HolidayFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={selectedHoliday}
            />
        )}
    </div>
  );
};

// --- Desktop View ---
const DesktopView = ({ holidays, loading, onAdd, onEdit, onDelete, router, pagination, onTableChange, isAdmin }: any) => {
    const baseColumns: TableProps<Holiday>['columns'] = [
        { title: "Occasion", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: "Start Date", dataIndex: "start_date", key: "start_date", render: (date) => moment(date).format("DD MMM YYYY") },
        { title: "End Date", dataIndex: "end_date", key: "end_date", render: (date) => moment(date).format("DD MMM YYYY") },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type: HolidayType) => {
                let color = 'default';
                if (type === 'Public') color = 'blue';
                if (type === 'Company') color = 'purple';
                if (type === 'Optional') color = 'gold';
                if (type === 'Regional') color = 'magenta';
                return <Tag color={color}>{type}</Tag>;
            },
        },
        {
            title: "Recurring",
            dataIndex: "is_recurring",
            key: "is_recurring",
            render: (isRecurring) => isRecurring ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
        },
    ];

    // 2. Create a variable for the final columns array
    let columns = [...baseColumns];

    // 3. Conditionally add the "Actions" column ONLY if the user is an admin.
    if (isAdmin) {
        columns.push({
            title: "Actions",
            key: "action",
            align: 'right',
            render: (_, record: Holiday) => (
                <Space>
                    <Button icon={<FaEdit />} onClick={() => onEdit(record)}>Edit</Button>
                    <Button icon={<FaTrash />} danger onClick={() => onDelete(record.id)}>Delete</Button>
                </Space>
            ),
        });
    }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">Manage Holidays</h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span onClick={() => router.push("/dashboard/list/dashboard/admin")} className="hover:underline cursor-pointer text-blue-600">Home</span>
            <MdKeyboardArrowRight /><span >Holidays List</span>
          </div>
        </div>
          <Space size="middle">
              <Button icon={<BsSortDown />} className="text-text-secondary">Sort</Button>
              <Button icon={<BiCalendar />} onClick={() => router.push("/dashboard/list/holidays/calendar")}>Calendar View</Button>
              {isAdmin && (
                  <Button type="primary" icon={<IoMdAdd />} onClick={onAdd} size="large">
                      Add Holiday
                  </Button>
              )}
          </Space>
      </div>
      <Card>
        <Row justify="end" className="mb-4">
            <Col><Input.Search placeholder="Search holidays..." style={{width: 280}}/></Col>
        </Row>
        <Table
          columns={columns}
          dataSource={holidays}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={onTableChange}
        />
      </Card>
    </>
  );
};

// --- Mobile View ---
const MobileView = ({ holidays, loading, onAdd, onEdit, onDelete, pagination, onPageChange, isAdmin }: any) => (
    <Card title="Holidays">
        <Space direction="vertical" style={{width: '100%'}}>
            <Input.Search placeholder="Search holidays..." />
            {isAdmin && (
                <Button type="primary" icon={<IoMdAdd />} onClick={onAdd} block>Add Holiday</Button>
            )}
        </Space>
        <List
            className="mt-4"
            loading={loading}
            dataSource={holidays}
            renderItem={(item: Holiday) => (
                <List.Item
                    actions={isAdmin ? [
                        <Button key="edit" type="text" shape="circle" icon={<FaEdit />} onClick={() => onEdit(item)} />,
                        <Button key="delete" type="text" shape="circle" danger icon={<FaTrash />} onClick={() => onDelete(item.id)} />
                    ] : []}
                >
                    <List.Item.Meta
                        title={item.name}
                        description={`${moment(item.start_date).format("MMM DD")} - ${moment(item.end_date).format("MMM DD, YYYY")}`}
                    />
                </List.Item>
            )}
        />
        <Pagination
            className="mt-4 text-center"
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={onPageChange}
            simple
        />
    </Card>
);

// --- Shared Form Modal ---
const HolidayFormModal = ({ isOpen, onClose, onSubmit, initialData }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    initialData: Holiday | null;
}) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // NEW state to manage the selected holiday type card
    const [selectedType, setSelectedType] = useState<HolidayType | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.setFieldsValue({
                    ...initialData,
                    date_range: [dayjs(initialData.start_date), dayjs(initialData.end_date)],
                });
                setSelectedType(initialData.type); // Set the selected card
            } else {
                form.resetFields();
                setSelectedType(null); // Reset the selected card
            }
        }
    }, [initialData, form, isOpen]);

    const handleOk = async () => {
        try {
            setIsSubmitting(true);
            const values = await form.validateFields();
            const payload = {
                ...values,
                type: selectedType, // Use the state for the type
                is_recurring: values.is_recurring || false,
                start_date: values.date_range[0].format('YYYY-MM-DD'),
                end_date: values.date_range[1].format('YYYY-MM-DD'),
            };
            if (!payload.type) {
                message.error("Please select a holiday type.");
                setIsSubmitting(false);
                return;
            }
            delete payload.date_range;
            await onSubmit(payload);
        } catch (info) {
            console.log('Validation Failed:', info);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            // --- Style Customizations ---
            open={isOpen}
            onCancel={onClose}
            footer={null} // We will create a custom footer
            title={null} // We will create a custom header
            width={640} // A wider modal
            closable={false} // Hide default close button
            destroyOnClose
            centered // Vertically center the modal
        >
            <div className="p-2">
                {/* Custom Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">
                            {initialData ? "Edit Holiday" : "Add Holiday"}
                        </h2>
                        <p className="text-text-secondary">
                            Set the details for the company holiday.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-light-bg">
                        <IoIosClose size={24} className="text-text-secondary" />
                    </button>
                </div>

                {/* Main Form Content */}
                <Form form={form} layout="vertical" name="holiday_form">
                    <Form.Item name="name" label="Occasion" rules={[{ required: true, message: "Please enter the occasion name." }]}>
                        <Input placeholder="e.g., New Year's Day" size="large" />
                    </Form.Item>
                    <Form.Item name="date_range" label="Date Range" rules={[{ required: true, message: "Please select a date range." }]}>
                        <DatePicker.RangePicker className="w-full" size="large" />
                    </Form.Item>

                    {/* --- NEW: Option Card Grid --- */}
                    <div className="mb-6">
                        <label className="ant-form-item-label">Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <OptionCard
                                title="Public Holiday"
                                description="Official national or public holiday."
                                isSelected={selectedType === 'Public'}
                                onClick={() => setSelectedType('Public')}
                            />
                            <OptionCard
                                title="Company Holiday"
                                description="A specific holiday for the company."
                                isSelected={selectedType === 'Company'}
                                onClick={() => setSelectedType('Company')}
                            />
                            <OptionCard
                                title="Optional Holiday"
                                description="Employees can choose to take this day off."
                                isSelected={selectedType === 'Optional'}
                                onClick={() => setSelectedType('Optional')}
                            />
                            <OptionCard
                                title="Regional Holiday"
                                description="Specific to a certain region or location."
                                isSelected={selectedType === 'Regional'}
                                onClick={() => setSelectedType('Regional')}
                            />
                        </div>
                    </div>

                    <Form.Item name="description" label="Description (Optional)">
                        <Input.TextArea rows={2} showCount maxLength={150} />
                    </Form.Item>
                    <Form.Item name="is_recurring" valuePropName="checked">
                        <Checkbox>This is a recurring holiday (yearly)</Checkbox>
                    </Form.Item>
                </Form>

                {/* Custom Footer */}
                <div className="flex justify-between items-center border-t border-light-border pt-4 mt-6">
                    <a href="#" className="text-sm text-blue-600 hover:underline">Need help?</a>
                    <Space>
                        <Button size="large" onClick={onClose}>Cancel</Button>
                        <Button type="primary" size="large" onClick={handleOk} loading={isSubmitting}>
                            {initialData ? "Save Changes" : "Create Holiday"}
                        </Button>
                    </Space>
                </div>
            </div>
        </Modal>
    );
};

export default HolidayPage;