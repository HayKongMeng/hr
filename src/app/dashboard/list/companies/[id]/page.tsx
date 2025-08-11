'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getCompanyById } from '@/lib/api/company';
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaGlobe,
    FaCity,
    FaCode,
    FaUser,
    FaCalendarAlt,
    FaBuilding,
    FaLink
} from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';

interface CompanyData {
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
    status: number;
    longitude: string;
    latitude: string;
    posted_by: number;
    posted_by_name: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

const CompanyDetails = () => {
    const router = useRouter();
    const { id } = useParams();
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchCompany = async () => {
            try {
                const response = await getCompanyById(Number(id));
                setCompany(response.data.result.data);
            } catch (error) {
                console.error('Failed to fetch company', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [id]);

    const goBackToList = () => {
        router.push('/dashboard/list/companies');
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!company) return <div className="p-6">Company not found.</div>;

    return (
        <div className="p-6 bg-[#f3f4f6] min-h-screen">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                <span onClick={goBackToList} className="hover:underline cursor-pointer text-blue-600">
                    Companies
                </span>
                <MdKeyboardArrowRight />
                <span className="text-gray-700 font-medium">Company Details</span>
            </div>

            {/* Company Header */}
            <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                <Image
                    src="/avatar.png"
                    alt="Avatar"
                    width={100}
                    height={100}
                    className="rounded-full border object-cover"
                />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
                    <p className="text-gray-500">{company.company_code}</p>
                     <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${company.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${company.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {company.status ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <a
                    href={company.account_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm"
                >
                    Visit Website
                </a>
            </div>

            {/* Info Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SectionCard title="Contact Information">
                    <InfoRow label="Email Address" value={company.email} icon={<FaEnvelope />} />
                    <InfoRow label="Phone" value={company.phone} icon={<FaPhoneAlt />} />
                    <InfoRow label="Website" value={company.website} icon={<FaLink />} />
                    <InfoRow label="Account URL" value={company.account_url} icon={<FaLink />} />
                </SectionCard>

                <SectionCard title="Location Details">
                    <InfoRow label="Country" value={company.country} icon={<FaGlobe />} />
                    <InfoRow label="Province" value={company.province} icon={<FaCity />} />
                    <InfoRow label="City" value={company.city} icon={<FaCity />} />
                    <InfoRow label="Zip Code" value={company.zip_code} icon={<FaCode />} />
                    <InfoRow label="Address" value={company.address} icon={<FaMapMarkerAlt />} />
                </SectionCard>

                <SectionCard title="Meta Information" fullWidth>
                    <InfoRow label="Posted By" value={company.posted_by_name} icon={<FaUser />} />
                    <InfoRow label="Created At" value={new Date(company.created_at).toLocaleString()} icon={<FaCalendarAlt />} />
                    <InfoRow label="Updated At" value={new Date(company.updated_at).toLocaleString()} icon={<FaCalendarAlt />} />
                    <InfoRow label="Longitude" value={company.longitude} icon={<FaMapMarkerAlt />} />
                    <InfoRow label="Latitude" value={company.latitude} icon={<FaMapMarkerAlt />} />
                </SectionCard>
            </div>
        </div>
    );
};

const SectionCard = ({
    title,
    children,
    fullWidth = false,
}: {
    title: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}) => (
    <div className={`bg-white rounded-xl p-6 ${fullWidth ? 'xl:col-span-2' : ''}`}>
        <h2 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);

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
            <p className="text-sm text-gray-800 break-all">{value}</p>
        </div>
    </div>
);

export default CompanyDetails;
