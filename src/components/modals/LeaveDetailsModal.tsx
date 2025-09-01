"use client";

import React from 'react';
import { Modal, Table, Tag, Spin } from 'antd';
import type { TableProps } from 'antd';
import moment from 'moment';

// Define the shape of the leave data
interface Leave {
    id: number;
    reason: string;
    start_date: string;
    end_date: string;
    leave_type: { type_name: string; };
    status: { status_name: string; };
}

interface LeaveDetailsModalProps {
    open: boolean;
    onClose: () => void;
    employeeName: string;
    status: string;
    leaves: Leave[];
    loading: boolean;
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({ open, onClose, employeeName, status, leaves, loading }) => {

    const columns: TableProps<Leave>['columns'] = [
        { title: 'Leave Type', dataIndex: ['leave_type', 'type_name'], key: 'leave_type' },
        { title: 'Dates', key: 'dates', render: (_, record) => `${moment(record.start_date).format("DD MMM")} - ${moment(record.end_date).format("DD MMM YYYY")}`},
        { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    ];

    const filteredLeaves = leaves.filter(leave => leave.status.status_name.toLowerCase() === status.toLowerCase());

    return (
        <Modal
            title={`${employeeName}'s ${status} Leaves`}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Close</Button>
            ]}
            width={700}
        >
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={filteredLeaves}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Spin>
        </Modal>
    );
};

export default LeaveDetailsModal;