"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

// UI Components & Icons
import { DatePicker, Input, Select, Modal as AntdModal, Form, Checkbox } from "antd";
import { BsSortDown } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
import { BiCalendar } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";

// Custom Components (assuming these exist in your project)
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Loading from "@/components/ui/Loading";
import TableSearch from "@/components/TableSearch";
import InfoCard from "@/components/card/InfoCard";
import ButtonCustom from "@/components/ui/Button";

// API functions
import {
  fetchHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/lib/api/holidays";
import { role } from "@/lib/data"; // Assuming role is 'admin' for actions

// Type definitions
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

const { TextArea } = Input;
const { confirm } = AntdModal;

// --- Helper Hook for Screen Size ---
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

// --- Main Combined Component ---
const CombinedHolidayPage = () => {
  const isMobile = useIsMobile();

  // --- State Management ---
  const router = useRouter();
  const [holidaysByPage, setHolidaysByPage] = useState<{ [key: string]: Holiday[] }>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  // --- Data Fetching ---
  const getHolidays = async (page: number, perPage: number) => {
    const cacheKey = `${page}-${perPage}`;
    if (holidaysByPage[cacheKey]) {
      setHolidays(holidaysByPage[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchHolidays(page, perPage);
      const filtered = res.data.filter((h: any) => h && h.name);

      setHolidaysByPage((prev) => ({ ...prev, [cacheKey]: filtered }));
      setHolidays(filtered);
      setTotalPages(res.total_pages);
      setTotalItems(res.total_items);
    } catch (err: any) {
      setError(err.message || "Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHolidays(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // --- Handlers ---
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(1);
    setHolidays([]); // Clear current holidays
    setHolidaysByPage({}); // Clear cache
  };

  const goBack = () => router.push("/dashboard/list/dashboard/admin");
  const goToCalendar = () => router.push("/dashboard/list/holidays/calendar");

  const refreshData = () => {
    setHolidaysByPage({}); // Invalidate cache
    getHolidays(currentPage, itemsPerPage);
  };
  
  // Modal and CRUD handlers
  const handleOpenModal = (holiday: Holiday | null) => {
    setSelectedHoliday(holiday);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHoliday(null);
  };

  const handleSubmit = async (values: Omit<Holiday, 'id' | 'is_recurring'>) => {
      try {
          if (selectedHoliday) {
            console.log("Updating holiday:", selectedHoliday.id, values);
              await updateHoliday(selectedHoliday.id, values);
          } else {
              await createHoliday(values);
          }
          handleCloseModal();
          refreshData(); // Refresh data to show changes
      } catch (err) {
          console.error("Failed to save holiday:", err);
          // Here you could show an error notification
      }
  };

  const handleDelete = (holidayId: number) => {
    confirm({
      title: 'Are you sure you want to delete this holiday?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteHoliday(holidayId);
          refreshData(); // Refresh data
        } catch (err) {
          console.error("Failed to delete holiday:", err);
        }
      },
    });
  };

  if (loading && !holidays.length) {
    return <Loading />;
  }

  return (
    <div>
      {isMobile ? (
        <MobileView
          holidays={holidays}
          onAdd={() => handleOpenModal(null)}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          loading={loading}
        />
      ) : (
        <DesktopView
          holidays={holidays}
          onAdd={() => handleOpenModal(null)}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          goToBack={goBack}
          goToCalendar={goToCalendar}
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      <HolidayFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={selectedHoliday}
        isMobile={isMobile}
      />
    </div>
  );
};

// --- Desktop Layout Component ---
const DesktopView = ({
  holidays, onAdd, onEdit, onDelete, goToBack, goToCalendar,
  currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange
}: any) => {

    const columns = [
        { header: "Occasion", accessor: "name" },
        { header: "Start Date", accessor: "start_date", className: "hidden md:table-cell" },
        { header: "End Date", accessor: "end_date", className: "hidden lg:table-cell" },
        { header: "Type", accessor: "type", className: "hidden lg:table-cell" },
        { header: "Recurring", accessor: "is_recurring", className: "hidden lg:table-cell" },
        { header: "Actions", accessor: "action" },
    ];
    
    const renderRow = (item: Holiday) => {
      if (!item || !item.name) return null;
      return (
        <tr key={item.id} className="border-b border-gray-200 text-sm">
          <td className="py-4 px-4">{item.name}</td>
          <td className="hidden md:table-cell py-4 px-4">{dayjs(item.start_date).format("DD MMM YYYY")}</td>
          <td className="hidden lg:table-cell py-4 px-4">{dayjs(item.end_date).format("DD MMM YYYY")}</td>
          <td className="hidden lg:table-cell py-4 px-4">
              <span className={`px-2 py-1 rounded-full text-xs
                  ${item.type === 'Public' && 'bg-blue-100 text-blue-700'}
                  ${item.type === 'Optional' && 'bg-yellow-100 text-yellow-700'}
                  ${item.type === 'Company' && 'bg-purple-100 text-purple-700'}
                  ${item.type === 'Regional' && 'bg-pink-100 text-pink-700'}`}>
                  {item.type}
              </span>
          </td>
          <td className="hidden lg:table-cell py-4 px-4">
            {item.is_recurring ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Recurring</span>
            ) : (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">One-time</span>
            )}
          </td>
          <td className="py-4 px-4">
            {role === "admin" && (
              <div className="flex items-center gap-3">
                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
              </div>
            )}
          </td>
        </tr>
      );
    };

  return (
    <div>
      <div className="flex items-center justify-between m-4">
        <div>
          <h1 className="text-lg font-semibold mb-0">Manage Holidays</h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span onClick={goToBack} className="hover:underline cursor-pointer text-blue-600 font-light">Home</span>
            <MdKeyboardArrowRight />
            <span className="text-gray-700 font-light">Holidays List</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500">
            <BsSortDown className="text-white font-semibold" />
          </button>
          <button onClick={goToCalendar} className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500">
            <BiCalendar className="text-white font-semibold" />
          </button>
          <ButtonCustom onClick={onAdd} label="Add Holiday" icon={<IoMdAdd />} className="primary-button" />
        </div>
      </div>
      <div className="bg-white rounded-2xl m-4 mt-0 card-table">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <select value={itemsPerPage} onChange={onItemsPerPageChange} className="border rounded px-3 py-2 text-sm">
              {[10, 20, 30, 50].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
            <span>entries per page</span>
          </div>
          <TableSearch />
        </div>
        <Table columns={columns} renderRow={renderRow} data={holidays} />
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

// --- Mobile Layout Component ---
const MobileView = ({ holidays, onAdd, onEdit, onDelete, currentPage, totalItems, itemsPerPage, onPageChange, loading }: any) => (
  <div className="bg-white shadow-md p-4">
    <h1 className="text-xl font-medium tracking-tight">Holidays</h1>
    <div className="py-4 flex flex-col items-end">
      <Input
        className="bg-gray-100 w-full rounded-lg text-gray-800 mt-2"
        placeholder="Search..."
        prefix={<CiSearch className="text-gray-500 text-xl" />}
      />
      <ButtonCustom
        onClick={onAdd}
        label="Add Holiday"
        icon={<IoMdAdd />}
        className="primary-button mt-4 gap-1 rounded-md px-3"
      />
    </div>
    {loading && <div className="text-center p-4">Loading...</div>}
    {!loading && holidays.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-10">
        <img src="/empty.svg" alt="No holidays" className="w-40 h-40" />
        <p className="text-gray-500 mt-4 text-sm">No holidays found</p>
      </div>
    ) : (
      <div className="space-y-3">
        {holidays.map((holiday: Holiday) => (
          <div key={holiday.id} className="flex items-center gap-2">
            <InfoCard // Assuming InfoCard takes name and description props
              name={holiday.name}
              description={`${dayjs(holiday.start_date).format("MMM DD")} - ${dayjs(holiday.end_date).format("MMM DD, YYYY")}`}
              className="flex-grow"
            />
            <ButtonCustom label="Edit" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => onEdit(holiday)} />
            <ButtonCustom label="Delete" className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => onDelete(holiday.id)} />
          </div>
        ))}
      </div>
    )}
    <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
  </div>
);

// --- Shared Form Modal Component ---
// --- Shared Form Modal Component ---
const HolidayFormModal = ({ isOpen, onClose, onSubmit, initialData, isMobile }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialData: Holiday | null;
  isMobile: boolean; // Receive the isMobile prop
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        type: initialData.type.toLowerCase(), 
        start_date: dayjs(initialData.start_date),
        end_date: dayjs(initialData.end_date),
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form, isOpen]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const payload = {
            ...values,
            is_recurring: values.is_recurring || false, 
            start_date: values.start_date.format('YYYY-MM-DD'),
            end_date: values.end_date.format('YYYY-MM-DD'),
        };
        onSubmit(payload);
      })
      .catch(info => console.log('Validation Failed:', info));
  };
  
   return (
    <AntdModal
      title={initialData ? "Edit Holiday" : "Add Holiday"}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose
      // --- STYLE CHANGES START HERE ---
      width={isMobile ? '100%' : 520} // Use full width on mobile
      style={isMobile ? { top: 0, padding: 0, height: '100vh' } : {}}
      wrapClassName={isMobile ? '!p-0' : ''}
      // --- STYLE CHANGES END HERE ---
      footer={[
          <ButtonCustom key="back" onClick={onClose} label="Cancel" />,
          <ButtonCustom key="submit" onClick={handleOk} label="Submit" className="primary-button" />
      ]}
    >
      <Form 
        form={form} 
        layout="vertical" 
        name="holiday_form" 
        // Add class for better scrolling on mobile
        className="mt-4 bg-white p-4 h-full overflow-y-auto"
      >
        <Form.Item name="name" label="Occasion" rules={[{ required: true, message: 'Please enter the occasion name!' }]}>
          <Input placeholder="e.g., New Year's Day" />
        </Form.Item>
        <Form.Item label="Date Range" className="mb-0">
             <div className="flex justify-between gap-2">
                <Form.Item name="start_date" rules={[{ required: true, message: 'Please select a start date!' }]} className="flex-1">
                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>
                 <Form.Item name="end_date" rules={[{ required: true, message: 'Please select an end date!' }]} className="flex-1">
                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>
             </div>
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select a holiday type!' }]}>
          <Select placeholder="Select type">
            <Select.Option value="Public">Public</Select.Option>
            <Select.Option value="Optional">Optional</Select.Option>
            <Select.Option value="Company">Company</Select.Option>
            <Select.Option value="Regional">Regional</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea showCount maxLength={150} placeholder="Enter a short description..." />
        </Form.Item>
        <Form.Item name="is_recurring" valuePropName="checked">
            <Checkbox>Is this a recurring holiday?</Checkbox>
        </Form.Item>
      </Form>
    </AntdModal>
  );
};

export default CombinedHolidayPage;