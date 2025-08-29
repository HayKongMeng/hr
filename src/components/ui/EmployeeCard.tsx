'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Dropdown, Space, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import { MdEdit, MdDelete, MdRemoveRedEye, MdMoreVert } from 'react-icons/md';

// Re-using the Employee type from your page
type Employee = { id: number; user_id: number; employee_code: string; name: string; image?: string; position?: { title: string }; email: string; };

interface EmployeeCardProps {
    employee: Employee;
    onEdit: (employee: Employee) => void;
    onDelete: (id: number) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {

    // Menu items for the dropdown
    const menuItems: MenuProps['items'] = [
        {
            key: '1',
            label: 'View Details',
            icon: <MdRemoveRedEye />,
            onClick: () => { /* Link handles this */ },
        },
        {
            key: '2',
            label: 'Edit',
            icon: <MdEdit />,
            onClick: () => onEdit(employee),
        },
        {
            key: '3',
            label: (
                <Popconfirm
                    title="Delete Employee?"
                    description="This action is irreversible."
                    onConfirm={() => onDelete(employee.id)}
                    okText="Yes, Delete"
                    cancelText="No"
                >
                    Delete
                </Popconfirm>
            ),
            icon: <MdDelete />,
            danger: true,
        },
    ];

    return (
        <div className="bg-light-card border border-light-border rounded-xl shadow-sm p-4 text-center flex flex-col items-center">
            {/* Dropdown Menu for actions */}
            <div className="absolute top-2 right-2">
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                    <Button type="text" shape="circle" icon={<MdMoreVert className="text-text-secondary" />} />
                </Dropdown>
            </div>

            <Link href={`/dashboard/list/employees/${employee.id}`}>
                <Image
                    src={'/avatar.png'}
                    alt={employee.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover mb-4 border-2 border-light-border"
                />
                <h3 className="font-semibold text-text-primary hover:text-accent-purple transition-colors">{employee.name}</h3>
            </Link>

            <p className="text-sm text-text-secondary mt-1">{employee.position?.title || 'N/A'}</p>
            <p className="text-xs text-text-secondary mt-2">{employee.employee_code}</p>
        </div>
    );
};

export default EmployeeCard;