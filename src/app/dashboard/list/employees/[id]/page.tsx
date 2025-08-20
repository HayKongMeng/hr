'use client';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getEmergencyContactsByEmployeeId, getEmployeeById } from '@/lib/api/employee';
import { TbPointFilled } from "react-icons/tb";
import { FiEdit } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { Disclosure } from '@headlessui/react'
import { RiEdit2Line } from "react-icons/ri";
import { BsPatchCheckFill } from "react-icons/bs";
import {
    FaIdBadge,
    FaUsers,
    FaCalendarAlt,
    FaBuilding,
    FaCommentDots,
    FaPhoneAlt,
    FaEnvelope,
    FaGenderless,
    FaBirthdayCake,
    FaMapMarkerAlt,
    FaPassport,
    FaCalendarTimes,
    FaFlag,
    FaPrayingHands,
    FaRing,
    FaUserTimes,
    FaChild, FaLock
} from "react-icons/fa";
import { MdKeyboardArrowRight } from 'react-icons/md';
import EmergencyContactForm from '@/components/forms/EmergencyContactFrom';
import { useEffect, useState } from 'react';
import FormModal from '@/components/FormModal';
import LoadingRollerSpinner from '@/components/ui/LoadingRollerSpinner';
import PersonalInfoForm from '@/components/forms/PersonalInfoForm';
import { getPersonalInformationByEmployeeId } from '@/lib/api/personalinformation';
import { getBankInformationByEmployeeId } from '@/lib/api/bankInformation';
import BankInfoForm from '@/components/forms/BankInfoForm';
import { getFamilyInformationByEmployeeId } from '@/lib/api/familyInformation';
import FamilyInfoForm from '@/components/forms/FamilyInfoForm';
import { getEducationDetailByEmployeeId } from '@/lib/api/educationdetail';
import EducationDetailsForm from '@/components/forms/EducationDetailsForm';
import { getExperienceByEmployeeId } from '@/lib/api/experience';
import ExperienceForm from '@/components/forms/ExperienceForm';
import ChangePasswordModal from "@/components/ChangePasswordModal";

interface EmergencyContact {
    id: number;
    employee_id: number;
    contact_type: 'primary' | 'secondary' | string;
    name: string;
    relationship: string;
    phone1: string;
    phone2?: string | null;
    email?: string;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

type EducationDetail = {
    id: number;
    employee_id: number;
    institution_name: string;
    course: string;
    start_date: string;
    end_date: string;
};

type Experience = {
    id: number;
    employee_id: number;
    previous_company_name: string;
    designation: string;
    start_date: string;
    end_date: string;
    is_current: boolean
};

const ProfilePage = () => {
    const router = useRouter();
    const { id } = useParams();

    const [employee, setEmployee] = useState<any>(null);
    const [imgSrc, setImgSrc] = useState('');
    const [selectedPersonalInfoId, setSelectedPersonalInfoId] = useState<number | undefined>();
    const [selectedBankInfoId, setSelectedBankInfoId] = useState<number | undefined>();
    const [selectedFamilyInfoId, setSelectedFamilyInfoId] = useState<number | undefined>();
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
    const [personalInformation, setPersonalInformation] = useState<any>(null);
    const [bankInformation, setBankInformation] = useState<any>(null);
    const [familyInformation, setFamilyInformation] = useState<any>(null);
    const [educationDetail, setEducationDetail] = useState<EducationDetail[]>([]);
    const [experience, setExperience] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [isModalOpenEmC, setIsModalOpenEmC] = useState(false);
    const [isModalOpenPerIn, setIsModalOpenPerIn] = useState(false);
    const [isModalOpenBankIn, setIsModalOpenBankIn] = useState(false);
    const [isModalOpenFamilyIn, setIsModalOpenFamilyIn] = useState(false);
    const [isModalOpenEduDetail, setIsModalOpenEduDetail] = useState(false);
    const [isModalOpenExperience, setIsModalOpenExperience] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const handleOpenEmergencyContact = (employeeId: number | undefined) => {
        if (employeeId === undefined) return;
        setSelectedId(employeeId);
        setIsModalOpenEmC(true);
    };

    const handleOpenPersoalInfo = (employeeId: number, personalInfoId?: number) => {
        setSelectedId(employeeId);
        setSelectedPersonalInfoId(personalInfoId);
        setIsModalOpenPerIn(true);
    };

    const handleOpenBankInfo = (employeeId: number, bankInfoId?: number) => {
        setSelectedId(employeeId);
        setSelectedFamilyInfoId(bankInfoId);
        setIsModalOpenBankIn(true);
    };

    const handleOpenFamilyInfo = (employeeId: number, familyInfoId?: number) => {
        setSelectedId(employeeId);
        setSelectedBankInfoId(familyInfoId);
        setIsModalOpenFamilyIn(true);
    };

    const handleOpenEduDetail = (employeeId: number | undefined) => {
        if (employeeId === undefined) return;
        setSelectedId(employeeId);
        setIsModalOpenEduDetail(true);
    };

    const handleOpenExperience = (employeeId: number | undefined) => {
        if (employeeId === undefined) return;
        setSelectedId(employeeId);
        setIsModalOpenExperience(true);
    };

    const handleCloseEmergencyContact = () => setIsModalOpenEmC(false);
    const handleClosePersoalInfo = () => setIsModalOpenPerIn(false);
    const handleCloseBankInfo = () => setIsModalOpenBankIn(false);
    const handleCloseFamilyInfo = () => setIsModalOpenFamilyIn(false);
    const handleCloseEduDetail = () => setIsModalOpenEduDetail(false);
    const handleCloseExperience = () => setIsModalOpenExperience(false);
    const handleCloseChangePassword = () => setIsChangePasswordModalOpen(false);

    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [
                    employeeRes,
                    contactsRes,
                    personalInfo,
                    bankInfo,
                    familyInfo,
                    eduDetails,
                    experience
                ] = await Promise.all([
                getEmployeeById(Number(id)),
                getEmergencyContactsByEmployeeId(Number(id)),
                getPersonalInformationByEmployeeId(Number(id)),
                getBankInformationByEmployeeId(Number(id)),
                getFamilyInformationByEmployeeId(Number(id)),
                getEducationDetailByEmployeeId(Number(id)),
                getExperienceByEmployeeId(Number(id))
            ]);
            setEmployee(employeeRes.data.result.data);
            setEmergencyContacts(contactsRes.data.result.data);
            setPersonalInformation(personalInfo.data.result.data);
            setBankInformation(bankInfo.data.result.data);
            setFamilyInformation(familyInfo.data.result.data);
            setEducationDetail(eduDetails.data.result.data);
            setExperience(experience.data.result.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (employee?.image_url) {
            setImgSrc(employee.image_url);
        } else {
            setImgSrc('/avatar.png');
        }
    }, [employee?.image_url]);

    const goBackToList = () => {
        router.push('/dashboard/list/employees');
    };

    if (loading) return <LoadingRollerSpinner />;

    // Filter contacts by type
    const primaryContacts = emergencyContacts.filter(c => c.contact_type === 'primary');
    const secondaryContacts = emergencyContacts.filter(c => c.contact_type === 'secondary');

    const getExperienceYears = (start: string, end: string, isCurrent?: boolean): string => {
        const startDate = new Date(start);
        const endDate = isCurrent ? new Date() : new Date(end);

        const diffInMs = endDate.getTime() - startDate.getTime();
        const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25); // average with leap years

        if (diffInYears < 1 && diffInYears > 0) return "< 1 year";
        if (diffInYears <= 0) return "0 year";

        return `${Math.floor(diffInYears)}+ years`;
    };

    if (loading) return <LoadingRollerSpinner />;

    return (
        <div className="min-h-screen p-6">
            <div className="text-sm text-gray-500 mb-6 flex items-center">
                <span
                    onClick={goBackToList}
                    className="hover:underline cursor-pointer text-blue-600"
                >
                    Home
                </span>
                <MdKeyboardArrowRight />
                <span
                    onClick={goBackToList}
                    className="hover:underline cursor-pointer text-blue-600"
                >
                    Employee
                </span>
                <MdKeyboardArrowRight />
                <span className="text-gray-700 font-medium">Employee Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
                <div className="bg-white rounded-xl card-table overflow-hidden relative">
                    <div className="bg-gradient-to-r h-24 from-[#392648] to-[#4A3AFF] p-4 text-center rounded-b-xl">
                        <Image
                            src={imgSrc}
                            alt="Avatar"
                            width={80}
                            height={80}
                            unoptimized
                            className="rounded-full border object-cover absolute top-0 left-1/2 translate-x-[-50%] translate-y-[62%]"
                            onError={() => setImgSrc( employee?.image || '/avatar.png')}
                        />
                    </div>

                    <div className='text-center mt-10'>
                        <h2 className="font-bold text-lg mt-2 text-black flex justify-center items-center">{employee?.name} <BsPatchCheckFill className='ml-1 text-green-400' size={14} /></h2>
                        <p className="text-black text-sm pl-4 pr-4">
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                                • {employee?.position?.title}
                            </span>
                        </p>
                    </div>

                    {/* Client Info */}
                    <div className="p-4 space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaIdBadge className="text-blue-600" />
                                Employee ID:
                            </p>
                            <p className="text-black">{employee?.employee_code}</p>
                        </div>
                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaUsers className="text-green-600" />
                                Team:
                            </p>
                            <p className="text-black">{employee?.department?.name}</p>
                        </div>
                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaCalendarAlt className="text-yellow-500" />
                                Date Of Join:
                            </p>
                            <p className="text-black">{employee?.hire_date}</p>
                        </div>
                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaBuilding className="text-purple-600" />
                                Report Office:
                            </p>
                            <p className="text-black">{employee?.posted_by_name}</p>
                        </div>

                        {/* Buttons with Icons */}
                        <div className="flex gap-2 mt-5">
                            <button className="w-full bg-orange-500 text-white py-2 rounded-md flex items-center justify-center gap-2">
                                <FaCommentDots />
                                Message
                            </button>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="p-4 space-y-2 text-sm text-gray-700 border-t">
                        <div className='mb-4 flex items-center justify-between'>
                            <p className="font-semibold text-sm text-black">Basic Information</p>
                            <FormModal
                                table="Employee"
                                type="update"
                                data={employee}
                                onSuccess={() => {
                                    setShowModal(false);
                                }}
                                onCancel={() => setShowModal(false)}
                            />
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaPhoneAlt className="text-blue-600" />
                                Phone:
                            </p>
                            <p className="text-black">{employee?.phone}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaEnvelope className="text-green-600" />
                                Email:
                            </p>
                            <p className="text-black">{employee?.email}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaGenderless className="text-pink-500" />
                                Gender:
                            </p>
                            <p className="text-black">{employee?.gender}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaBirthdayCake className="text-yellow-500" />
                                Birthday:
                            </p>
                            <p className="text-black">{employee?.date_of_birth}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaMapMarkerAlt className="text-red-500" />
                                Address:
                            </p>
                            <p className="text-black">1861 Bayonne Ave, Manchester, NJ, 08759</p>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="p-4 space-y-2 text-sm text-gray-700 border-t">
                        <div className='mb-4 flex items-center justify-between'>
                            <p className="font-semibold text-sm text-black">Personal Information</p>
                            <button
                                onClick={() => {
                                    if (employee?.id !== undefined && personalInformation?.[0]?.id) {
                                        handleOpenPersoalInfo(employee.id, personalInformation[0].id); // Edit
                                    } else if (employee?.id !== undefined) {
                                        handleOpenPersoalInfo(employee.id); // Add
                                    }
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-200"
                            >
                                <RiEdit2Line size={16} />
                            </button>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaPassport className="text-blue-600" />
                                Passport No:
                            </p>
                            <p className="text-black">{personalInformation?.[0]?.passport_no || 'N/A'}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaCalendarTimes className="text-red-500" />
                                Expiry Date:
                            </p>
                            <p className="text-black">{personalInformation?.[0]?.passport_expiry_date || 'N/A'}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaFlag className="text-green-600" />
                                Nationality:
                            </p>
                            <p className="text-black">{personalInformation?.[0]?.nationality?.country_name || 'N/A'}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaPrayingHands className="text-purple-600" />
                                Religion:
                            </p>
                            <p className="text-black">{personalInformation?.[0]?.religion || 'N/A'}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaRing className="text-yellow-500" />
                                Marital Status:
                            </p>
                            <p className="text-black">{personalInformation?.[0]?.marital_status?.status_name || 'N/A'}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaUserTimes className="text-gray-600" />
                                Spouse Employed:
                            </p>
                            <p className="text-black">{personalInformation?.[0]?.employment_spouse || 'N/A'}</p>
                        </div>

                        <div className="flex justify-between gap-2 text-xs">
                            <p className="flex items-center gap-1">
                                <FaChild className="text-pink-500" />
                                No. of Children:
                            </p>
                            <p className="text-black">{personalInformation?.[0]?.number_of_children || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="p-4 space-y-2 text-sm text-gray-700 border-t">
                        <div className='mb-4 flex items-center justify-between'>
                            <p className="font-semibold text-sm text-black">Emergency Contact Number</p>
                            <button
                                onClick={() => {
                                    if (employee?.id !== undefined) {
                                        handleOpenEmergencyContact(employee.id);
                                    }
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-200"
                            >
                                <RiEdit2Line size={16} />
                            </button>
                        </div>
                        {primaryContacts.length > 0 ? (
                                primaryContacts.map(contact => (
                                    <div key={contact.id} className="flex items-center justify-between">
                                        <div>
                                            <div className="text-gray-500 text-xs mb-1">Primary</div>
                                            <div className="text-gray-900 text-xs font-semibold flex items-center">
                                                {contact.name} <TbPointFilled className="text-red-500" /> {contact.relationship}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">{contact.phone1}</div>
                                    </div>
                                ))
                        ) : (
                            <div className='flex items-center justify-between'>
                                <div className="text-gray-500 text-xs mb-1">Primary</div>
                                <div className="text-gray-900 text-xs font-semibold flex items-center">
                                    -
                                </div>
                            </div>
                        )}
                        {secondaryContacts.length > 0 ? (
                            secondaryContacts.map(contact => (
                                <div key={contact.id} className="flex items-center justify-between">
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Secondary</div>
                                        <div className="text-gray-900 text-xs font-semibold flex items-center">
                                            {contact.name} <TbPointFilled className="text-red-500" /> {contact.relationship}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-700">{contact.phone1}</div>
                                </div>
                            ))
                        ) : (
                            <div className='flex items-center justify-between'>
                                <div className="text-gray-500 text-xs mb-1">Secondary</div>
                                <div className="text-gray-900 text-xs font-semibold flex items-center">
                                    -
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Tabs and Projects */}
                <div className="md:col-span-2 space-y-6">
                    {/* Sections */}
                    <Disclosure>
                        {({ open }) => (
                            <div className="bg-white rounded-xl card-table p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-md font-semibold">About Employee</h3>
                                    <div className="flex items-center">
                                        <FormModal
                                            table="Employee"
                                            type="update"
                                            data={employee}
                                            onSuccess={() => {
                                                setShowModal(false);
                                            }}
                                            onCancel={() => setShowModal(false)}
                                        />
                                        <Disclosure.Button>
                                            <IoIosArrowDown size={22}
                                                className={`text-gray-600 
                                                        w-7 h-7
                                                        hover:text-blue-600 
                                                        hover:bg-gray-200 
                                                        p-1 rounded-full 
                                                        cursor-pointer 
                                                        transition-all duration-300 
                                                        ${open ? 'rotate-180' : ''}`}
                                            />
                                        </Disclosure.Button>
                                    </div>
                                </div>
                                <Disclosure.Panel
                                    static
                                    className={`disclosure-panel ${open ? 'open' : ''} mt-2 text-sm text-gray-700`}
                                >
                                    <div className='border-t pt-4'>
                                        <div className='flex items-center justify-between'>
                                            <div className="flex items-center gap-2">
                                                <FaLock className="text-gray-500"/>
                                                <p className='text-gray-900 text-xs font-semibold'>Password</p>
                                            </div>
                                            <button
                                                onClick={() => setIsChangePasswordModalOpen(true)}
                                                className='text-xs text-blue-600 hover:underline'
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                                <Disclosure.Panel
                                    static
                                    className={`disclosure-panel ${open ? 'open' : ''} mt-2 text-sm text-gray-700`}
                                >
                                     <div className='border-t'>
                                        <div className="text-xs text-gray-700 pt-4">
                                            {employee?.address}
                                        </div>
                                     </div>
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                    <Disclosure>
                        {({ open }) => (
                            <div className="bg-white rounded-xl card-table p-4">
                                <div className='flex items-center justify-between'>
                                    <h3 className="text-md font-semibold mb-4">Bank Information</h3>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={() => {
                                                if (employee?.id !== undefined && bankInformation?.[0]?.id) {
                                                    handleOpenBankInfo(employee.id, bankInformation[0].id); // Edit
                                                } else if (employee?.id !== undefined) {
                                                    handleOpenBankInfo(employee.id); // Add
                                                }
                                            }}
                                            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-200"
                                        >
                                            <RiEdit2Line size={16} />
                                        </button>
                                        <Disclosure.Button>
                                            <IoIosArrowDown size={22}
                                                className={`text-gray-600 
                                                        w-7 h-7
                                                        hover:text-blue-600 
                                                        hover:bg-gray-200 
                                                        p-1 rounded-full 
                                                        cursor-pointer 
                                                        transition-all duration-300 
                                                        ${open ? 'rotate-180' : ''}`}
                                            />
                                        </Disclosure.Button>
                                    </div>
                                </div>
                                <Disclosure.Panel
                                    static
                                    className={`disclosure-panel ${open ? 'open' : ''} mt-2 text-sm text-gray-700`}
                                >
                                    <div className='border-t'>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                            <div className="">
                                                <div className="text-gray-500 text-xs mb-1">Bank Name</div>
                                                <div className="text-gray-900 text-xs font-semibold">{bankInformation?.[0]?.bank_details || 'N/A'}</div>
                                            </div>

                                            <div className="">
                                                <div className="text-gray-600 text-xs mb-1">Bank account no</div>
                                                <div className="text-gray-900 text-xs font-semibold">{bankInformation?.[0]?.bank_account_no || 'N/A'}</div>
                                            </div>
                                            <div className="">
                                                <div className="text-gray-600 text-xs mb-1">IFSC Code</div>
                                                <div className="text-gray-900 text-xs font-semibold">{bankInformation?.[0]?.ifsc_code || 'N/A'}</div>
                                            </div>
                                            <div className="">
                                                <div className="text-gray-600 text-xs mb-1">Branch</div>
                                                <div className="text-gray-900 text-xs font-semibold">{bankInformation?.[0]?.branch_address || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                    <Disclosure>
                        {({ open }) => (
                            <div className="bg-white rounded-xl card-table p-4">
                                <div className='flex items-center justify-between'>
                                    <h3 className="text-md font-semibold mb-4">Family Information</h3>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={() => {
                                                if (employee?.id !== undefined && familyInformation?.[0]?.id) {
                                                    handleOpenFamilyInfo(employee.id, familyInformation[0].id); // Edit
                                                } else if (employee?.id !== undefined) {
                                                    handleOpenFamilyInfo(employee.id); // Add
                                                }
                                            }}
                                            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-200"
                                        >
                                            <RiEdit2Line size={16} />
                                        </button>
                                        <Disclosure.Button>
                                            <IoIosArrowDown size={22}
                                                className={`text-gray-600 
                                                        w-7 h-7 
                                                        hover:text-blue-600 
                                                        hover:bg-gray-200 
                                                        p-1 rounded-full
                                                        cursor-pointer 
                                                        transition-all duration-300 
                                                        ${open ? 'rotate-180' : ''}`}
                                            />
                                        </Disclosure.Button>
                                    </div>
                                </div>
                                <Disclosure.Panel
                                    static
                                    className={`disclosure-panel ${open ? 'open' : ''} mt-2 text-sm text-gray-700`}
                                >
                                    <div className='border-t'>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                            <div className="">
                                                <div className="text-gray-500 text-xs mb-1">Name</div>
                                                <div className="text-gray-900 text-xs font-semibold">{familyInformation?.[0]?.name || 'N/A'}</div>
                                            </div>

                                            <div className="">
                                                <div className="text-gray-600 text-xs mb-1">Relationship</div>
                                                <div className="text-gray-900 text-xs font-semibold">{familyInformation?.[0]?.relationship || 'N/A'}</div>
                                            </div>
                                            <div className="">
                                                <div className="text-gray-600 text-xs mb-1">Date of birth</div>
                                                <div className="text-gray-900 text-xs font-semibold">{familyInformation?.[0]?.passport_expiry_date || 'N/A'}</div>
                                            </div>
                                            <div className="">
                                                <div className="text-gray-600 text-xs mb-1">Phone</div>
                                                <div className="text-gray-900 text-xs font-semibold">{familyInformation?.[0]?.phone || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                    <Disclosure>
                        {({ open }) => (
                            <div className="bg-white rounded-xl card-table p-4">
                                <div className='flex items-center justify-between'>
                                    <h3 className="text-md font-semibold mb-4">Education Details</h3>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={() => {
                                                if (employee?.id !== undefined) {
                                                    handleOpenEduDetail(employee.id);
                                                }
                                            }}
                                            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-200"
                                        >
                                            <RiEdit2Line size={16} />
                                        </button>
                                        <Disclosure.Button>
                                            <IoIosArrowDown size={22}
                                                className={`text-gray-600 
                                                        w-7 h-7 
                                                        hover:text-blue-600 
                                                        hover:bg-gray-200 
                                                        p-1 rounded-full 
                                                        cursor-pointer 
                                                        transition-all duration-300 
                                                        ${open ? 'rotate-180' : ''}`}
                                            />
                                        </Disclosure.Button>
                                    </div>
                                </div>
                                <Disclosure.Panel
                                    static
                                    className={`disclosure-panel ${open ? 'open' : ''} mt-2 text-sm text-gray-700`}
                                >
                                    <div className='border-t'>
                                        {educationDetail.length > 0 ? (
                                                educationDetail.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between pt-4">
                                                        <div>
                                                            <div className="text-gray-500 text-xs mb-1">{item.institution_name}</div>
                                                            <div className="text-gray-900 text-xs font-semibold flex items-center">
                                                                {item.course}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            {new Date(item.start_date).getFullYear()} - {new Date(item.end_date).getFullYear()}
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className='pt-4'></div>
                                        )}
                                    </div>
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                    <Disclosure>
                        {({ open }) => (
                            <div className="bg-white rounded-xl card-table p-4">
                                <div className='flex items-center justify-between'>
                                    <h3 className="text-md font-semibold mb-4">Experience</h3>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={() => {
                                                if (employee?.id !== undefined) {
                                                    handleOpenExperience(employee.id);
                                                }
                                            }}
                                            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-200"
                                        >
                                            <RiEdit2Line size={16} />
                                        </button>
                                        <Disclosure.Button>
                                            <IoIosArrowDown size={22}
                                                className={`text-gray-600 
                                                        w-7 h-7 
                                                        hover:text-blue-600 
                                                        hover:bg-gray-200 
                                                        p-1 rounded-full
                                                        cursor-pointer 
                                                        transition-all duration-300 
                                                        ${open ? 'rotate-180' : ''}`}
                                            />
                                        </Disclosure.Button>
                                    </div>
                                </div>
                                <Disclosure.Panel
                                    static
                                    className={`disclosure-panel ${open ? 'open' : ''} mt-2 text-sm text-gray-700`}
                                >
                                    <div className='border-t'>
                                        {experience.length > 0 ? (
                                                experience.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between pt-4">
                                                        <div>
                                                            <div className="text-gray-500 text-xs mb-1">{item.previous_company_name}</div>
                                                            <div className="text-gray-900 text-xs font-semibold flex items-center">
                                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                                                                    • {item.designation}
                                                                </span>
                                                                <span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                                                    {getExperienceYears(item.start_date, item.end_date, item.is_current)} of experience
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            {new Date(item.start_date).toLocaleString("en-US", { month: "short", year: "numeric" })} -{" "}
                                                            {item.is_current
                                                                ? "Present"
                                                                : new Date(item.end_date).toLocaleString("en-US", { month: "short", year: "numeric" })}
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className='pt-4'></div>
                                        )}
                                    </div>
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                </div>
            </div>
            {isModalOpenEmC && employee?.id !== undefined && (
                <EmergencyContactForm
                    onClose={handleCloseEmergencyContact}
                    employeeId={employee.id}
                    onSaved={fetchData}
                />
            )}
            {isModalOpenPerIn && employee?.id !== undefined && (
                <PersonalInfoForm
                    onClose={handleClosePersoalInfo}
                    key={selectedPersonalInfoId ?? "new"}
                    employeeId={employee.id}
                    personalInfoId={selectedPersonalInfoId} // pass if editing
                    onSaved={fetchData}
                />
            )}
            {isModalOpenBankIn && employee?.id !== undefined && (
                <BankInfoForm
                    onClose={handleCloseBankInfo}
                    key={selectedBankInfoId ?? "new"}
                    employeeId={employee.id}
                    bankInfoId={selectedBankInfoId} // pass if editing
                    onSaved={fetchData}
                />
            )}
            {isModalOpenFamilyIn && employee?.id !== undefined && (
                <FamilyInfoForm
                    onClose={handleCloseFamilyInfo}
                    key={selectedFamilyInfoId ?? "new"}
                    employeeId={employee.id}
                    familyInfoId={selectedFamilyInfoId} // pass if editing
                    onSaved={fetchData}
                />
            )}
            {isModalOpenEduDetail && employee?.id !== undefined && (
                <EducationDetailsForm
                    onClose={handleCloseEduDetail}
                    employeeId={employee.id}
                    onSaved={fetchData}
                />
            )}
            {isModalOpenExperience && employee?.id !== undefined && (
                <ExperienceForm
                    onClose={handleCloseExperience}
                    employeeId={employee.id}
                    onSaved={fetchData}
                />
            )}
            {isChangePasswordModalOpen && employee && (
                <ChangePasswordModal
                    open={isChangePasswordModalOpen}
                    employee={employee}
                    onCancel={handleCloseChangePassword}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}

export default ProfilePage;
