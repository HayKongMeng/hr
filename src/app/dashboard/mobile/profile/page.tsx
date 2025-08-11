"use client";

import ProfileMenuItem from '@/components/mobile/ProfileMenuItem';
import React from 'react';
import {
    FaInfoCircle,
    FaUser,
    FaPhoneAlt,
    FaUniversity,
    FaFileContract,
    FaShieldAlt
} from 'react-icons/fa';

const ProfilePage = () => {
    const handleMenuItemClick = (section: string) => {
        alert(`Navigating to ${section} section!`);
    };
    return (
        <div className="min-h-screen w-full absolute -mt-[27px] z-20 bg-white rounded-t-[15px] overflow-y-auto max-h-[calc(100vh-62px)] border">
            <main className="p-4 pt-6 space-y-6 relative z-20 pb-52">
                {/* <div className="pr-4 pl-4 pb-10 bg-white bg-opacity-20 backdrop-filter backdrop-blur-l flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-600">John Smith</h2>
                        <p className="text-gray-600">General Manager</p>
                    </div>
                </div> */}
                <div className="space-y-4">
                    <ProfileMenuItem
                        Icon={FaInfoCircle}
                        title="General Information"
                        onClick={() => handleMenuItemClick("General Information")}
                    />
                    <ProfileMenuItem
                        Icon={FaUser}
                        title="Personal Information"
                        onClick={() => handleMenuItemClick("Personal Information")}
                    />
                    <ProfileMenuItem    
                        Icon={FaPhoneAlt}
                        title="Contact Information"
                        onClick={() => handleMenuItemClick("Contact Information")}
                    />
                    <ProfileMenuItem
                        Icon={FaUniversity}
                        title="Bank Information"
                        onClick={() => handleMenuItemClick("Bank Information")}
                    />
                    <ProfileMenuItem
                        Icon={FaFileContract}
                        title="Employee Document Information"
                        onClick={() => handleMenuItemClick("Employee Document Information")}
                    />
                    <ProfileMenuItem
                        Icon={FaShieldAlt}
                        title="Insurance Details"
                        onClick={() => handleMenuItemClick("Insurance Details")}
                    />
                </div>
            </main>
        </div>
    )
}

export default ProfilePage;
