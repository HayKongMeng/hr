# Lama Dev School Management Dashboard

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Lama Dev Youtube Channel](https://youtube.com/lamadev) 
- [Next.js](https://nextjs.org/learn)



'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getEmployeeById } from '@/lib/api/employee';
import {
    FaPhoneAlt,
    FaEnvelope,
    FaTransgender,
    FaCalendarAlt,
    FaBuilding,
    FaUser,
    FaIdBadge,
    FaGlobe,
    FaMapMarkerAlt,
    FaHeart
} from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';

interface EmployeeData {
    id: number;
    employee_code: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    hire_date: string | null;
    status_id: number;
    date_of_birth: string;
    gender: string;
    marital_status: {
        id: number;
        status_name: string;
    };
    nationality: {
        id: number;
        country_name: string;
    };
    work_station: {
        id: number;
        name: string;
    };
    position: {
        id: number;
        title: string;
    };
    department: {
        id: number;
        name: string;
    };
    company_histories: {
        id: number;
        start_date: string;
        end_date: string;
        company: {
            name: string;
        };
    }[];
}

const EmployeeDetails = () => {
    const router = useRouter();
    const { id } = useParams();
    const [employee, setEmployee] = useState<EmployeeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchEmployee = async () => {
            try {
                const response = await getEmployeeById(Number(id));
                setEmployee(response.data.result.data);
            } catch (error) {
                console.error('Failed to fetch employee', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    const goBackToList = () => {
        router.push('/dashboard/list/employees');
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!employee) return <div className="p-6">Employee not found.</div>;

    const statusText = employee.status_id === 7 ? 'Active' : 'Inactive';
    const statusColor =
        employee.status_id === 7
        ? 'bg-green-100 text-green-600'
        : 'bg-red-100 text-red-600';

        return (
            <div className="p-6 bg-[#f3f4f6] min-h-screen">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
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

                {/* Profile Header */}
                <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                    <Image
                        src="/avatar.png"
                        alt="Avatar"
                        width={100}
                        height={100}
                        className="rounded-full border object-cover"
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {employee.name}
                        </h1>
                        <p className="text-gray-500">{employee.position?.title}</p>
                        <span
                            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                        >
                            {statusText}
                        </span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm">
                        Edit Profile
                    </button>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 xl:grid-cols-6 gap-6" >
                    <SectionCard colSpan="xl:col-span-2 relative">
                        <div style={{ position: 'relative', width: '100%', height: '100px' }} className='rounded-xl'>
                            <Image src="/card-bg.png" className='rounded-xl' alt="" fill style={{ objectFit: 'cover' }} />
                        </div>
                        <Image
                            src="/avatar.png"
                            alt="Avatar"
                            width={80}
                            height={80}
                            className="rounded-full border object-cover absolute top-0 left-1/2 translate-x-[-50%] translate-y-[45%]"
                        />
                        <div>sdsdsdsdsdsdsd</div>
                        <InfoRow label="Employee ID" value={employee.employee_code} icon={<FaIdBadge />} />
                        <InfoRow label="First Name" value={employee.first_name} icon={<FaUser />} />
                        <InfoRow label="Last Name" value={employee.last_name} icon={<FaUser />} />
                        <InfoRow label="Email Address" value={employee.email} icon={<FaEnvelope />} />
                        <InfoRow label="Phone" value={employee.phone} icon={<FaPhoneAlt />} />
                        <InfoRow label="Gender" value={employee.gender} icon={<FaTransgender />} />
                        <InfoRow label="Date of Birth" value={employee.date_of_birth} icon={<FaCalendarAlt />} />
                        <InfoRow label="Marital Status" value={employee.marital_status?.status_name} icon={<FaHeart />} />
                        <InfoRow label="Nationality" value={employee.nationality?.country_name} icon={<FaGlobe />} />
                        <InfoRow label="Work Station" value={employee.work_station?.name} icon={<FaMapMarkerAlt />} />
                    </SectionCard>

                    <SectionCard   colSpan="xl:col-span-4">
                        <InfoRow label="Job Title" value={employee.position?.title} icon={<FaBuilding />} />
                        <InfoRow label="Department" value={employee.department?.name} icon={<FaBuilding />} />
                        <InfoRow
                            label="Start Date"
                            value={employee.company_histories?.[0]?.start_date ?? 'N/A'}
                            icon={<FaCalendarAlt />}
                        />
                        <InfoRow
                            label="End Date"
                            value={employee.company_histories?.[0]?.end_date ?? 'N/A'}
                            icon={<FaCalendarAlt />}
                        />
                    </SectionCard>

                    <SectionCard fullWidth>
                        <InfoRow
                            label="Company Name"
                            value={employee.company_histories?.[0]?.company.name ?? 'N/A'}
                            icon={<FaBuilding />}
                        />
                        <InfoRow label="Note" value="(Data from company history)" />
                    </SectionCard>
                </div>
            </div>
        );
};

const SectionCard = ({
    // title,
    children,
    fullWidth = false,
    colSpan = 'xl:col-span-1',
}: {
    // title: string;
    children: React.ReactNode;
    fullWidth?: boolean;
    colSpan?: string;
}) => (
    <div className={`bg-white rounded-xl ${fullWidth ? 'xl:col-span-2' : colSpan}`}>
        {/* <h2 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h2> */}
        <div className="space-y-4">{children}</div>
    </div>
);


// const SectionCard = ({
//     title,
//     children,
//     fullWidth = false,
// }: {
//     title: string;
//     children: React.ReactNode;
//     fullWidth?: boolean;
// }) => (
//     <div className={`bg-white rounded-xl p-6 ${fullWidth ? 'xl:col-span-2' : ''}`}>
//         <h2 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h2>
//         <div className="space-y-4">{children}</div>
//     </div>
// );

const InfoRow = ({
    label,
    value,
    icon,
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
}) => (
    <div className="flex items-start gap-4">
        {icon && (
            <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full text-lg">
                {icon}
            </div>
        )}
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-sm text-gray-800">{value}</p>
        </div>
    </div>
);

export default EmployeeDetails;
"# hr" 
