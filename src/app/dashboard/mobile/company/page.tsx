"use client";
import AddButton from "@/components/button/AddButton";
import {
  Button,
  Dropdown,
  Flex,
  Input,
  MenuProps,
  message,
  Radio,
  Space,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import ButtonCustom from "@/components/ui/Button";
import { IoIosArrowDown } from "react-icons/io";
import TextArea from "antd/es/input/TextArea";
import dynamic from "next/dynamic";
import CompanyCard from "@/components/card/InfoCardLogo";
import {
  createDepartment,
  deleteDepartment,
  Department,
  fetchAllDepartments,
  updateDepartment,
} from "@/lib/api/department";
import {
  createCompany,
  deleteCompany,
  fetchCompanies,
  updateCompany,
} from "@/lib/api/company";
import DepartmentCard from "@/components/card/InfoCard";
import { companySchema } from "@/lib/validationSchema";
import Pagination from "@/components/Pagination";

const CaptureLocation = dynamic(
  () => import("@/components/button/CaptureLocation"),
  { ssr: false }
);

// Constants
const ITEMS_PER_PAGE = 10;

const Page = () => {
  const [selectedOption, setSelectedOption] = useState("Companies");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isDepartmentEditEnabled, setIsDepartmentEditEnabled] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    company_code: "",
    name: "",
    type: "",
    email: "",
    phone: "",
    country: "",
    province: "",
    city: "",
    zip_code: "",
    address: "",
    account_url: "",
    website: "",
    status: true,
    longitude: "",
    latitude: "",
  });

  // Handle input changes for company form
  const handleCompanyChange = (field: string, value: string) => {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
  };

  // --- PAGE CHANGE HANDLER ---
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleCompanySubmit = async () => {
    const result = companySchema.safeParse(companyForm);
    if (!result.success) {
      const firstError = Object.values(
        result.error.flatten().fieldErrors
      )[0]?.[0];
      message.error(firstError || "Please fill all required fields correctly.");
      return;
    }
    try {
      if (isEditEnabled && selectedCompanyId) {
        await updateCompany({ ...companyForm, id: selectedCompanyId });
        message.success("Company updated!");
      } else {
        await createCompany(companyForm);
        message.success("Company created!");
      }
      setCompanyForm({
        company_code: "",
        name: "",
        type: "",
        email: "",
        phone: "",
        country: "",
        province: "",
        city: "",
        zip_code: "",
        address: "",
        account_url: "",
        website: "",
        status: true,
        longitude: "",
        latitude: "",
      });
      // Optionally refresh company list here
      fetchCompanies().then(currentPage);
      setSelectedCompanyId(null);
      setIsEditEnabled(false);
      setIsCompanyModalOpen(true);
    } catch (err: any) {
      message.error(
        err?.response?.data?.exception?.message || "Failed to create company"
      );
    }
  };

  // Company
  const [companies, setCompanies] = useState<any[]>([]);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCompaniesData = useCallback(
    async (page: number) => {
      if (selectedOption !== "Companies") return;
      setLoading(true);
      try {
        const response = await fetchCompanies(page, ITEMS_PER_PAGE);
        setCompanies(response.data || []);
        setTotalCompanies(response.total_items || 0);
        setCurrentPage(response.current_page || page);
      } catch (error) {
        message.error("Failed to load companies.");
      } finally {
        setLoading(false);
      }
    },
    [selectedOption]
  );

  // --- useEffect TO FETCH DATA ON PAGE OR TAB CHANGE ---
  useEffect(() => {
    if (selectedOption === "Companies") {
      fetchCompaniesData(currentPage);
    }
  }, [selectedOption, currentPage, fetchCompaniesData]);

  // departments
  const [departments, setDepartments] = useState<any[]>([]);
  const [deptForm, setDeptForm] = useState({
    company_id: 1,
    name: "",
    code: "",
    description: "",
    status: true,
  });

  const handleDeptChange = (field: string, value: string) => {
    setDeptForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeptSubmit = async () => {
    try {
      if (isDepartmentEditEnabled && selectedDepartmentId) {
        await updateDepartment({ ...deptForm, id: selectedDepartmentId });
        message.success("Department updated!");
      } else {
        await createDepartment(deptForm);
        message.success("Department created!");
      }
      setDeptForm({
        company_id: 1,
        name: "",
        code: "",
        description: "",
        status: true,
      });
      fetchAllDepartments().then((data) => setDepartments(data));
      setSelectedDepartmentId(null);
      setIsDepartmentEditEnabled(false);
      setIsDepartmentModalOpen(false);
    } catch (err) {
      message.error("Failed to create department");
    }
  };
  const handleDeleteDepartment = async () => {
    if (!selectedDepartmentId) {
      message.error("No department selected to delete.");
      return;
    }
    try {
      await deleteDepartment(selectedDepartmentId);
      message.success("Department deleted!");

      fetchAllDepartments().then((data) => setDepartments(data));
      setSelectedDepartmentId(null);
      setIsDepartmentEditEnabled(false);
      setIsDepartmentModalOpen(false);
    } catch (err) {
      message.error("Failed to delete department");
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompanyId) {
      message.error("No company selected to delete.");
      return;
    }
    try {
      await deleteCompany(selectedCompanyId);
      message.success("Company deleted!");

      fetchAllCompanies().then((data) => setCompanies(data));
      setSelectedCompanyId(null);
      setIsEditEnabled(false);
      setIsCompanyModalOpen(false);
    } catch (err) {
      message.error("Failed to delete company");
    }
  };
  useEffect(() => {
    if (selectedOption === "Department") {
      fetchAllDepartments().then((data) => {
        setDepartments(data);
      });
    }
  }, [selectedOption]);
  return (
    <div>
      <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
        HRMS System Setup
      </h1>
      <div>
        <Flex vertical gap="middle">
          <Radio.Group
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="bg-shadow border-none flex justify-between"
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button
              value="Companies"
              className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
            >
              Companies
            </Radio.Button>
            <Radio.Button
              value="Department"
              className="bg-[#ffffff] text-black !rounded-full !border-none data-[checked=true]:!bg-[#ffffff] data-[checked=true]:!text-white"
            >
              Department
            </Radio.Button>
          </Radio.Group>
        </Flex>
      </div>
      {selectedOption === "Companies" && (
        <>
          <div className="bg-shadow flex flex-col gap-4">
            <div className="flex flex-col items-end ">
              <Input
                className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
                placeholder="Search..."
                prefix={<CiSearch className="text-[#364663] text-xl" />}
              />

              <AddButton
                modalTitle={isEditEnabled ? "Update Company" : "Add Companies"}
                label={isEditEnabled ? "Update Company" : "Add Companies"}
                className="mb-20"
                showDeleteButton={isEditEnabled}
                onDelete={handleDeleteCompany}
                open={isCompanyModalOpen}
                setOpen={(open) => {
                  if (open) {
                    if (isEditEnabled && selectedCompanyId) {
                      const selectedCompany = companies.find(
                        (c) => c.id === selectedCompanyId
                      );
                      if (selectedCompany) {
                        setCompanyForm({
                          ...selectedCompany,
                          longitude: selectedCompany.longitude || "",
                          latitude: selectedCompany.latitude || "",
                        });
                      }
                    } else {
                      setCompanyForm({
                        company_code: "",
                        name: "",
                        type: "",
                        email: "",
                        phone: "",
                        country: "",
                        province: "",
                        city: "",
                        zip_code: "",
                        address: "",
                        account_url: "",
                        website: "",
                        status: true,
                        longitude: "",
                        latitude: "",
                      });
                    }
                  }
                  setIsCompanyModalOpen(open);
                }}
              >
                <div>
                  <div className="bg-shadow p-4">
                    <label htmlFor="leave-type">Companies Name</label>
                    <div className="flex flex-col gap-4 mt-4">
                      <Input
                        value={companyForm.name}
                        onChange={(e) =>
                          handleCompanyChange("name", e.target.value)
                        }
                        placeholder=""
                        className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Companies Code</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.company_code}
                          onChange={(e) =>
                            handleCompanyChange("company_code", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Account URL</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.account_url}
                          onChange={(e) =>
                            handleCompanyChange("account_url", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Website</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.website}
                          onChange={(e) =>
                            handleCompanyChange("website", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Email Address</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          type="email"
                          value={companyForm.email}
                          onChange={(e) =>
                            handleCompanyChange("email", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Phone Number</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.phone}
                          onChange={(e) =>
                            handleCompanyChange("phone", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Type</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.type}
                          onChange={(e) =>
                            handleCompanyChange("type", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Country</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.country}
                          onChange={(e) =>
                            handleCompanyChange("country", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Province</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.province}
                          onChange={(e) =>
                            handleCompanyChange("province", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">City</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.city}
                          onChange={(e) =>
                            handleCompanyChange("city", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Zip Code</label>
                      <div className="flex flex-col gap-4 mt-4">
                        <Input
                          value={companyForm.zip_code}
                          onChange={(e) =>
                            handleCompanyChange("zip_code", e.target.value)
                          }
                          placeholder=""
                          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="leave-type">Select status</label>
                      <Dropdown
                        className="flex flex-row items-cente justify-between px-[10px] py-[7px] gap-[12px]
                                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px]
                                        flex-none order-1 self-stretch flex-grow-0 "
                      >
                        <Button className="mt-4">
                          <Space>Select</Space>
                          <IoIosArrowDown />
                        </Button>
                      </Dropdown>
                    </div>

                    <div className=" mt-4">
                      <label htmlFor="leave-type">Address</label>
                      <TextArea
                        value={companyForm.address}
                        onChange={(e) =>
                          handleCompanyChange("address", e.target.value)
                        }
                        className="mt-4  
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                        showCount
                        maxLength={100}
                        placeholder="Enter Address..."
                      />
                    </div>
                    <div className="">
                      <CaptureLocation
                        onLocationChange={({ longitude, latitude }) =>
                          setCompanyForm((prev) => ({
                            ...prev,
                            longitude: String(longitude),
                            latitude: String(latitude),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <ButtonCustom
                    label={isEditEnabled ? "Update" : "Submit"}
                    className="primary-button mt-4 px-5 float-right"
                    type="submit"
                    onClick={handleCompanySubmit}
                  />
                </div>
              </AddButton>
            </div>
            {/* --- COMPANY CARDS --- */}
            {loading ? <p>Loading...</p> : companies.map((company) => (
              <CompanyCard
                key={company.id}
                name={company.name}
                code={company.company_code}
                email={company.email}
                isSelected={selectedCompanyId === company.id}
                onClick={() => {
                  if (selectedCompanyId === company.id) {
                    setSelectedCompanyId(null);
                    setIsEditEnabled(false);
                  } else {
                    setSelectedCompanyId(company.id);
                    setIsEditEnabled(true);
                  }
                }}
              />
            ))}
            {/* --- INTEGRATE PAGINATION COMPONENT --- */}
            {totalCompanies > ITEMS_PER_PAGE && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalCompanies}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </>
      )}
      {selectedOption === "Department" && (
        <>
          <div className="bg-shadow flex flex-col gap-4">
            <div className="flex flex-col items-end">
              <Input
                className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
                placeholder="Search..."
                prefix={<CiSearch className="text-[#364663] text-xl" />}
              />

              <AddButton
                modalTitle={
                  isDepartmentEditEnabled
                    ? "Update Departments"
                    : "Add Departments"
                }
                label={
                  isDepartmentEditEnabled
                    ? "Update Departments"
                    : "Add Departments"
                }
                open={isDepartmentModalOpen}
                className="mb-20"
                showDeleteButton={isDepartmentEditEnabled}
                onDelete={handleDeleteDepartment}
                setOpen={(open) => {
                  if (open) {
                    if (isDepartmentEditEnabled && selectedDepartmentId) {
                      const selectedDepartment = departments.find(
                        (d) => d.id === selectedDepartmentId
                      );
                      if (selectedDepartment) {
                        setDeptForm({
                          ...selectedDepartment,
                          company_id: selectedDepartment.company_id || 1,
                          status: selectedDepartment.status ?? true,
                        });
                      }
                    } else {
                      setDeptForm({
                        company_id: 1,
                        name: "",
                        code: "",
                        description: "",
                        status: true,
                      });
                    }
                  }
                  setIsDepartmentModalOpen(open);
                }}
              >
                <div className="bg-shadow p-4">
                  <label htmlFor="leave-type">Department Name</label>
                  <div className="flex flex-col gap-4 mt-4">
                    <Input
                      value={deptForm.name}
                      onChange={(e) => handleDeptChange("name", e.target.value)}
                      placeholder=""
                      className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                    />
                  </div>
                  <div className="mt-4">
                    <label htmlFor="leave-type">Department Code</label>
                    <div className="flex flex-col gap-4 mt-4">
                      <Input
                        value={deptForm.code}
                        onChange={(e) =>
                          handleDeptChange("code", e.target.value)
                        }
                        placeholder=""
                        className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                      />
                    </div>
                  </div>
                  {/* Add company select if needed */}
                  <div className="mt-4">
                    <label htmlFor="leave-type">Description</label>
                    <TextArea
                      value={deptForm.description}
                      onChange={(e) =>
                        handleDeptChange("description", e.target.value)
                      }
                      className="mt-4 bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                      showCount
                      maxLength={100}
                      placeholder="Enter Description..."
                    />
                  </div>
                </div>
                <ButtonCustom
                  label="Submit"
                  className="primary-button mt-4 px-5 float-right"
                  type="button"
                  onClick={handleDeptSubmit}
                />
              </AddButton>
            </div>
            {departments.map((department) => (
              <DepartmentCard
                key={department.id}
                name={department.name}
                code={department.code}
                description={department.description}
                isSelected={selectedDepartmentId === department.id}
                onClick={() => {
                  if (selectedDepartmentId === department.id) {
                    setSelectedDepartmentId(null);
                    setIsDepartmentEditEnabled(false);
                  } else {
                    setSelectedDepartmentId(department.id);
                    setIsDepartmentEditEnabled(true);
                  }
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
