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
import { IoMdAdd } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";

// --- API functions ---
import {
  fetchHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/lib/api/holidays";

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
    getHolidays(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize, getHolidays]);

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
          onTableChange={handleTableChange}
        />
      )}

      <HolidayFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={selectedHoliday}
      />
    </div>
  );
};

// --- Desktop View ---
const DesktopView = ({ holidays, loading, onAdd, onEdit, onDelete, router, pagination, onTableChange }: any) => {
  const columns: TableProps<Holiday>['columns'] = [
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
    {
      title: "Actions",
      key: "action",
      align: 'right',
      render: (_, record: Holiday) => (
        <Space>
          <Button icon={<FaEdit />} onClick={() => onEdit(record)}>Edit</Button>
          <Button icon={<FaTrash />} danger onClick={() => onDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

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
        <Space>
          <Button icon={<BsSortDown />} />
          <Button icon={<BiCalendar />} onClick={() => router.push("/dashboard/list/holidays/calendar")} />
          <Button type="primary" icon={<IoMdAdd />} onClick={onAdd}>Add Holiday</Button>
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
const MobileView = ({ holidays, loading, onAdd, onEdit, onDelete, pagination, onPageChange }: any) => (
    <Card title="Holidays">
        <Space direction="vertical" style={{width: '100%'}}>
            <Input.Search placeholder="Search holidays..." />
            <Button type="primary" icon={<IoMdAdd />} onClick={onAdd} block>Add Holiday</Button>
        </Space>
        <List
            className="mt-4"
            loading={loading}
            dataSource={holidays}
            renderItem={(item: Holiday) => (
                <List.Item
                    actions={[
                        <Button key="edit" type="text" shape="circle" icon={<FaEdit />} onClick={() => onEdit(item)} />,
                        <Button key="delete" type="text" shape="circle" danger icon={<FaTrash />} onClick={() => onDelete(item.id)} />
                    ]}
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

  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue({
        ...initialData,
        date_range: [dayjs(initialData.start_date), dayjs(initialData.end_date)],
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form, isOpen]);

  const handleOk = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      const payload = {
        ...values,
        is_recurring: values.is_recurring || false,
        start_date: values.date_range[0].format('YYYY-MM-DD'),
        end_date: values.date_range[1].format('YYYY-MM-DD'),
      };
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
      title={initialData ? "Edit Holiday" : "Add Holiday"}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="holiday_form" className="mt-4">
        <Form.Item name="name" label="Occasion" rules={[{ required: true }]}>
          <Input placeholder="e.g., New Year's Day" />
        </Form.Item>
        <Form.Item name="date_range" label="Date Range" rules={[{ required: true }]}>
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select placeholder="Select type">
            <Select.Option value="Public">Public</Select.Option>
            <Select.Option value="Optional">Optional</Select.Option>
            <Select.Option value="Company">Company</Select.Option>
            <Select.Option value="Regional">Regional</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea showCount maxLength={150} />
        </Form.Item>
        <Form.Item name="is_recurring" valuePropName="checked">
          <Checkbox>Is this a recurring holiday?</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HolidayPage;