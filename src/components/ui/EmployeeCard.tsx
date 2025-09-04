"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Tag, Space } from 'antd';
import { MdEdit, MdDelete, MdLocationOn, MdCheckCircle } from 'react-icons/md';
import {Employee} from "@/app/dashboard/list/employees/page";



interface EmployeeCardProps {
    employee: Employee;
    onEdit: (employee: Employee) => void;
    onDelete: (id: number) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {
    // A simple hash function to generate a color from a string (for the position tag)
    const getColorFromString = (str: string = '') => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col transition-shadow hover:shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
                <Image
                    src={employee.image_url || '/avatar.png'} // Fallback to a default avatar
                    alt={employee.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{employee.name}</h3>
                        <MdCheckCircle className="ml-1 text-green-500" />
                    </div>
                    {employee.work_station?.name && (
                        <p className="text-sm text-gray-500 flex items-center">
                            <MdLocationOn className="mr-1" />
                            {employee.work_station.name}
                        </p>
                    )}
                </div>
            </div>

            {employee.position?.title && (
                <div className="mb-4">
                    <Tag color={getColorFromString(employee.position.title)}>{employee.position.title}</Tag>
                </div>
            )}

            <div className="mt-auto flex justify-between items-center">
                <Link href={`/dashboard/list/employees/${employee.id}`}>
                    <Button type="text" className="px-0 text-gray-600 hover:text-blue-500">View Profile</Button>
                </Link>
                <Space>
                    <Button onClick={() => onEdit(employee)}>Edit</Button>
                    <Button danger onClick={() => onDelete(employee.id)}>Delete</Button>
                </Space>
            </div>
        </div>
    );
};

export default EmployeeCard;