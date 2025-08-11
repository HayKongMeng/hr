"use client";

import { BsSortDown } from "react-icons/bs";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Loading from "@/components/ui/Loading";
import TableSearch from "@/components/TableSearch";
import { FaArrowUpFromBracket } from "react-icons/fa6";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useRouter } from "next/navigation";
import Textbox from "@/components/ui/Textbox";
import { useEffect, useState } from "react";
import SelectList from "@/components/ui/SelectList";
import { fetchAllPositions } from "@/lib/api/position";
import { fetchAllDepartments } from "@/lib/api/department";
import { fetchEmploymentTypes, fetchMaritalStatuses, fetchNationality, fetchWorkStation } from "@/lib/api/status";

const CreateEmployeePage = () => {
    const router = useRouter();
    const genderOptions = ["Male", "Female", "Other"];
    const [selectedGender, setSelectedGender] = useState<string>("Male");
    const [preview, setPreview] = useState<string>("/avatar.png");

    const [positionList, setPositionList] = useState<{ id: number; title: string }[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<{ id: number; title: string } | null>(null);

    const [departmentList, setDepartmentList] = useState<{ id: number; name: string }[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<{ id: number; name: string } | null>(null);

    const [maritalStatusList, setMaritalStatusList] = useState<{ id: number; status_name: string }[]>([]);
    const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<{ id: number; status_name: string } | null>(null);

    const [nationalityList, setNationalityList] = useState<{ id: number; country_name: string }[]>([]);
    const [selectedNationality, setSelectedNationality] = useState<{ id: number; country_name: string } | null>(null);

    const [workStationList, setWorkStationList] = useState<{ id: number; name: string }[]>([]);
    const [selectedWorkStation, setSelectedWorkStation] = useState<{ id: number; name: string } | null>(null);

    const [employmentTypeList, setEmploymentTypeList] = useState<{ id: number; status_name: string }[]>([]);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState<{ id: number; status_name: string } | null>(null);

    useEffect(() => {
            const loadData = async () => {
              try {
                    const [positions, department, maritalStatus, national, workStation, employmentTypes] = await Promise.all([
                        fetchAllPositions(),
                        fetchAllDepartments(),
                        fetchMaritalStatuses(),
                        fetchNationality(),
                        fetchWorkStation(),
                        fetchEmploymentTypes(),
                    ]);
                    console.log(employmentTypes);
                    setPositionList(positions);
                    setDepartmentList(department);
                    setMaritalStatusList(maritalStatus);
                    setNationalityList(national);
                    setWorkStationList(workStation);
                    setEmploymentTypeList(employmentTypes);
    
                    // if (positions.length > 0) {
                    //     if (type === "update" && data?.position_id) {
                    //         const selected = positions.find(p => p.id === data.position_id);
                    //         setSelectedPosition(selected || positions[0]);
                    //     } else {
                    //         setSelectedPosition(positions[0]);
                    //     }
                    // }
                    // if (department.length > 0) {
                    //     if (type === "update" && data?.department_id) {
                    //         const selected = department.find(p => p.id === data.department_id);
                    //         setSelectedDepartment(selected || department[0]);
                    //     } else {
                    //         setSelectedDepartment(department[0]);
                    //     }
                    // }
                    // if (maritalStatus.length > 0) {
                    //     if (type === "update" && data?.marital_status_id) {
                    //         const selected = maritalStatus.find(p => p.id === data.marital_status_id);
                    //         setSelectedMaritalStatus(selected || maritalStatus[0]);
                    //     } else {
                    //         setSelectedMaritalStatus(maritalStatus[0]);
                    //     }
                    // }
                    // if (national.length > 0) {
                    //     if (type === "update" && data?.nationality_id) {
                    //         const selected = national.find(p => p.id === data.nationality_id);
                    //         setSelectedNationality(selected || national[0]);
                    //     } else {
                    //         setSelectedNationality(national[0]);
                    //     }
                    // }
                    // if (workStation.length > 0) {
                    //     if (type === "update" && data?.work_station_id) {
                    //         const selected = workStation.find(p => p.id === data.work_station_id);
                    //         setSelectedWorkStation(selected || workStation[0]);
                    //     } else {
                    //         setSelectedWorkStation(workStation[0]);
                    //     }
                    // }
                    // if (employmentTypes.length > 0) {
                    //     if (type === "update" && data?.employment_type_id) {
                    //         const selected = employmentTypes.find(p => p.id === data.employment_type_id);
                    //         setSelectedEmploymentType(selected || employmentTypes[0]);
                    //     } else {
                    //         setSelectedEmploymentType(employmentTypes[0]);
                    //     }
                    // }
                } catch (error){
                    console.error("Failed to fetch dropdown data:", error);
                } finally {
                    // setLoadingPosition(false);
                    // setLoadingDepartment(false);
                    // setLoadingMaritalStatus(false);
                    // setLoadingNationality(false);
                    // setLoadingWorkStation(false);
                    // setLoadingEmploymentType(false);
                }
            }
    
            loadData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreview(imageUrl);
        }
    };

    const goBack = () => {
        router.push("/dashboard/list/dashboard/admin");
    };
    const goBackToEmployee = () => {
        router.push("/dashboard/list/dashboard/admin");
    }; 
    return (
        <div>
            <div className="flex items-center justify-between m-4">
                <div>
                    <h1 className="hidden md:block text-lg font-semibold mb-0">Create Employee</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                            onClick={goBack}
                            className="hover:underline cursor-pointer text-blue-600 font-light"
                        >
                            Home
                        </span>
                        <MdKeyboardArrowRight />
                        <span onClick={goBackToEmployee} className="hover:underline cursor-pointer text-blue-600 font-light">Employee</span>
                        <MdKeyboardArrowRight />
                        <span className="text-gray-700 font-light">Create Employee</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end m-4 mb-0"></div>
            </div>
            <div className="flex flex-col lg:flex-row gap-2">
                <div className="w-full lg:w-1/2 bg-white rounded-2xl m-4 mt-0 pb-5 card-table">
                    <div className="flex items-center justify-between mt-5 mb-5 border-b pb-3">
                        <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                            <h2 className="text-base font-semibold">Personal Detail</h2>
                        </div>
                    </div>
                    <div className="px-4 py-1">
                        <div className="flex items-center gap-4  mt-4">
                            <Textbox
                                type="text"
                                name="name"
                                label="First Name *"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="Last Name *"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4  mt-4">
                            <Textbox
                                type="text"
                                name="name"
                                label="Phone *"
                                className="w-full rounded-lg"
                            />
                            <SelectList
                                lists={genderOptions}
                                selected={selectedGender}
                                setSelected={setSelectedGender}
                                label="Select Gender *"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4  mt-4">
                            <Textbox
                                placeholder="Enter Birthday"
                                type="date"
                                name="date_of_birth"
                                label="Date of Birth *"
                                className="w-full rounded-lg"
                            />
                            <SelectList
                                lists={maritalStatusList.map((marital_status) => marital_status.status_name)} // Extract the name if you only want the name
                                selected={selectedMaritalStatus ? selectedMaritalStatus.status_name : ""}
                                setSelected={(marital_status_name) =>
                                    setSelectedMaritalStatus(
                                        maritalStatusList.find((marital_status) => marital_status.status_name === marital_status_name) || null
                                    )
                                }
                                label="Select Marital Status"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4  mt-4">
                            <Textbox
                                type="text"
                                name="email"
                                label="Username *"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="Email *"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4  mt-4">
                            <Textbox
                                type="password"
                                name="password"
                                label="Password *"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="password"
                                name="confirm_password"
                                label="Confirm Password *"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 bg-white rounded-2xl m-4 ml-1 mt-0 card-table">
                    <div className="flex items-center justify-between mt-5 mb-5 border-b pb-3">
                        <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                            <h2 className="text-base font-semibold">Company Detail</h2>
                        </div>
                    </div>
                    <div className="px-4 py-1">
                        <div className="flex items-center gap-4  mt-4">
                            <Textbox
                                type="text"
                                name="employee_code"
                                label="Employee ID"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <SelectList
                                lists={nationalityList.map((countryName) => countryName.country_name)} // Extract the name if you only want the name
                                selected={selectedNationality ? selectedNationality.country_name : ""}
                                setSelected={(country_name) =>
                                    setSelectedNationality(
                                        nationalityList.find((countryName) => countryName.country_name === country_name) || null
                                    )
                                }
                                label="Select Nationality"
                                className="w-full rounded-lg"
                            />
                            <SelectList
                                lists={workStationList.map((workStation) => workStation.name)} // Extract the name if you only want the name
                                selected={selectedWorkStation ? selectedWorkStation.name : ""}
                                setSelected={(work_station_name) =>
                                    setSelectedWorkStation(
                                        workStationList.find((workStation) => workStation.name === work_station_name) || null
                                    )
                                }
                                label="Select Work Station"
                                className="w-full rounded-lg"
                            />
                        </div> 
                        <div className="flex items-center gap-4 mt-4">
                            <Textbox
                                placeholder="Enter Birthday"
                                type="date"
                                name="date_of_birth"
                                label="Date of Birth *"
                                className="w-full rounded-lg"
                            />
                            <SelectList
                                lists={employmentTypeList.map((e) => e.status_name)}
                                selected={selectedEmploymentType ? selectedEmploymentType.status_name : ""}
                                setSelected={(name) =>
                                    setSelectedEmploymentType(
                                        employmentTypeList.find((e) => e.status_name === name) || null
                                    )
                                }
                                label="Select Employment Type"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <SelectList
                                lists={departmentList.map((department) => department.name)} // Extract the name if you only want the name
                                selected={selectedDepartment ? selectedDepartment.name : ""}
                                setSelected={(departmentName) =>
                                    setSelectedDepartment(
                                        departmentList.find((department) => department.name === departmentName) || null
                                    )
                                }
                                label="Select Department"
                                className="w-full rounded-lg"
                            />
                            <SelectList
                                lists={positionList.map((position) => position.title)} // Extract the title if you only want the title
                                selected={selectedPosition ? selectedPosition.title : ""}
                                setSelected={(positionTitle) =>
                                    setSelectedPosition(
                                        positionList.find((position) => position.title === positionTitle) || null
                                    )
                                }
                                label="Select Designation"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-2">
                <div className="w-full lg:w-1/2 bg-white rounded-2xl m-4 mt-0 pb-5 card-table">
                    <div className="flex items-center justify-between mt-5 mb-5 border-b pb-3">
                        <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                            <h2 className="text-base font-semibold">Document</h2>
                        </div>
                    </div>
                    <div className="px-4 py-1">
                        <div className="flex items-center gap-4 mt-4">
                            <label className="block mb-2 font-light text-gray-700 text-sm">Certificate *</label>   
                            {/* Custom Upload Button */}
                            <div className="flex items-center gap-4 mb-4">
                                <label className="inline-flex items-center px-4 py-2 bg-lime-500 font-light text-sm text-white rounded-md cursor-pointer hover:bg-lime-600 transition">
                                    <FaArrowUpFromBracket className="mr-2" />
                                    Choose file here
                                    <input type="file" className="hidden" onChange={handleFileChange} />
                                </label>
                                <div className="w-12 h-12 border border-dashed rounded-md overflow-hidden">
                                    <img
                                        src={preview}
                                        alt="avatar preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div> 
                            </div>  
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <label className="block mb-2 text-sm font-light text-gray-700">Resume *</label>   
                            {/* Custom Upload Button */}
                            <div className="flex items-center gap-4 mb-4">
                                <label className="inline-flex items-center px-4 py-2 bg-lime-500 font-light text-sm text-white rounded-md cursor-pointer hover:bg-lime-600 transition">
                                    <FaArrowUpFromBracket className="mr-2" />
                                    Choose file here
                                    <input type="file" className="hidden" onChange={handleFileChange} />
                                </label>
                                <div className="w-12 h-12 border border-dashed rounded-md overflow-hidden">
                                    <img
                                        src={preview}
                                        alt="avatar preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div> 
                            </div>  
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <label className="block mb-2 font-light text-gray-700 text-sm">Photo</label>   
                            {/* Custom Upload Button */}
                            <div className="flex items-center gap-4 mb-4">
                                <label className="inline-flex items-center px-4 py-2 bg-lime-500 font-light text-sm text-white rounded-md cursor-pointer hover:bg-lime-600 transition">
                                    <FaArrowUpFromBracket className="mr-2" />
                                    Choose file here
                                    <input type="file" className="hidden" onChange={handleFileChange} />
                                </label>
                                <div className="w-12 h-12 border border-dashed rounded-md overflow-hidden">
                                    <img
                                        src={preview}
                                        alt="avatar preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div> 
                            </div>  
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 bg-white rounded-2xl m-4 ml-1 mt-0 card-table">
                    <div className="flex items-center justify-between mt-5 mb-5 border-b pb-3">
                        <div className="border-l-[3px] border-[#6FD943] px-4 py-1">
                            <h2 className="text-base font-semibold">Bank Account Detail</h2>
                        </div>
                    </div>
                    <div className="px-4 py-1">
                        
                    </div>
                </div>
            </div>

            {/* {loading ? (
                <Loading />
            ) : ( */}
                {/* <div className="bg-white rounded-2xl m-4 mt-0 card-table">
                    <>
                        

            
                    </>
                </div> */}
            {/* )} */}
        </div>
    );
};

export default CreateEmployeePage;
