"use client";

import React, { useMemo } from 'react';
import { Card, Tag, Dropdown, Button, Empty } from 'antd';
import type { MenuProps } from 'antd';
import moment from 'moment';
import { FaEllipsisV, FaCheck } from 'react-icons/fa';
import { MdDelete, MdEdit, MdRemoveRedEye } from "react-icons/md";

// --- 1. IMPORT the correct, authoritative types ---
import type { Leave } from '@/app/dashboard/list/leaves/page';
import {Employee} from "@/lib/api/employee"; // Adjust the path if it's different

// --- 2. DELETE the local, incomplete type definitions that were here ---
// type Leave = { ... };  <-- DELETE THIS
// type Employee = { ... }; <-- DELETE THIS

// --- Reusable Leave Card Component ---
const LeaveCard = ({ leave, employee, onEdit, onManage, onDelete, onView, hideEmployeeName }: {
    leave: Leave;
    employee?: Employee;
    onEdit: (r: Leave) => void | Promise<void>;
    onManage: (r: Leave) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
    onView: (r: Leave) => void | Promise<void>;
    hideEmployeeName?: boolean;
}) => {
    const status = leave.status?.status_name || 'Pending';
    const isEditable = status === 'Pending';
    const isManageable = status === 'Pending' || status === 'Approved';

    const items: MenuProps['items'] = [
        { key: '1', label: 'View Details', icon: <MdRemoveRedEye />, onClick: () => onView(leave) },
        { key: '2', label: 'Manage', icon: <FaCheck />, onClick: () => onManage(leave), disabled: !isManageable },
        { key: '3', label: 'Edit', icon: <MdEdit />, onClick: () => onEdit(leave), disabled: !isEditable },
        { key: '4', label: 'Delete', icon: <MdDelete />, onClick: () => onDelete(leave.id), danger: true, disabled: !isEditable },
    ];

    return (
        <Card size="small" className="mb-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <Tag color="blue">{leave.leave_type.type_name}</Tag>
                <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                    <Button type="text" shape="circle" icon={<FaEllipsisV className="text-gray-500" />} />
                </Dropdown>
            </div>
            {!hideEmployeeName && (
                <p className="font-semibold text-gray-800 my-2">{employee?.name || 'Unknown Employee'}</p>
            )}
            <div className={`text-xs text-gray-500 ${hideEmployeeName ? 'mt-2' : ''}`}>
                <p>{moment(leave.start_date).format("MMM Do")} - {moment(leave.end_date).format("MMM Do, YYYY")}</p>
                <p className="font-medium">{moment(leave.end_date).diff(moment(leave.start_date), 'days') + 1} day(s)</p>
            </div>
        </Card>
    );
};


const BoardView = ({ leaves, employeeMap, onEdit, onManage, onDelete, onView, hideEmployeeName }: { // 1. Add hideEmployeeName here
    leaves: Leave[];
    employeeMap: { [id: number]: Employee };
    onEdit: (r: Leave) => void | Promise<void>;
    onManage: (r: Leave) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
    onView: (r: Leave) => void | Promise<void>;
    hideEmployeeName?: boolean; // 2. Define the prop type
}) => {
    const groupedLeaves = useMemo(() => {
        const groups: { [key: string]: Leave[] } = {
            'Pending': [],
            'Approved': [],
            'Rejected': [],
            'Cancelled': [], // Added Cancelled status for completeness
        };

        leaves.forEach(leave => {
            const statusName = leave.status?.status_name || 'Pending';
            if (groups[statusName] !== undefined) { // Check if the group exists before pushing
                groups[statusName].push(leave);
            }
        });
        return groups;
    }, [leaves]);

    const statuses = Object.keys(groupedLeaves);

    return (
        <div className="w-full p-2 overflow-x-auto">
            <div className="flex space-x-4 min-w-max">
                {statuses.map(status => (
                    <div key={status} className="w-72 bg-gray-50 rounded-lg p-3 flex-shrink-0">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h2 className="font-semibold text-sm text-gray-600 uppercase tracking-wider">{status}</h2>
                            <span className="text-sm font-bold text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                                {groupedLeaves[status].length}
                            </span>
                        </div>
                        <div className="h-[60vh] overflow-y-auto pr-1">
                            {groupedLeaves[status].length > 0 ? (
                                groupedLeaves[status].map(leave => (
                                    <LeaveCard
                                        key={leave.id}
                                        leave={leave}
                                        employee={employeeMap[leave.employee_id]}
                                        onEdit={onEdit}
                                        onManage={onManage}
                                        onDelete={onDelete}
                                        onView={onView}
                                        hideEmployeeName={hideEmployeeName}
                                    />
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-40">
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Requests" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardView;