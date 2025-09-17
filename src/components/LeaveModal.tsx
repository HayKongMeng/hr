"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Descriptions, Tag, Spin, Input, Typography } from "antd"; // ==> 1. Import Input and Typography
import { toast } from "sonner";
import moment from "moment";
import { ApproveLeave } from "@/lib/api/leave"; // ==> 2. Import the new API function
import { getEmployeeName } from "@/lib/api/employee";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useAuth } from "@/lib/AuthContext";

const { Text } = Typography;

interface EventData {
    id: any;
    employee: any;
    type: any;
    status: any;
    reason: any;
    applied_on: any;
    start: any;
    end: any;
}

interface LeaveModalProps {
    isOpen: boolean;
    onClose: (shouldRefetch?: boolean) => void;
    data: EventData | null;
}

const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, data }) => {
    const { user, loading: authLoading } = useAuth();

    const [loadingAction, setLoadingAction] = useState(false);
    const [loadingEmployeeName, setLoadingEmployeeName] = useState(true);
    const [employeeName, setEmployeeName] = useState<string>("");
    const [comments, setComments] = useState<string>(""); // ==> 3. Add state for comments


    useEffect(() => {
        if (!isOpen) {
            setComments("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (data?.employee) {
            setLoadingEmployeeName(true);
            const loadEmployeeName = async () => {
                try {
                    const name = await getEmployeeName(data.employee);
                    setEmployeeName(name);
                } catch (error) {
                    console.error("Failed to fetch employee name", error);
                    setEmployeeName("N/A");
                } finally {
                    setLoadingEmployeeName(false);
                }
            };
            loadEmployeeName();
        } else {
            setEmployeeName("");
            setLoadingEmployeeName(false);
        }
    }, [data]);

    // ==> 4. REWRITE the handleAction function
    const handleAction = async (action: 'approved' | 'rejected') => {
        if (!data) {
            toast.error("Leave data is missing.");
            return;
        }
        setLoadingAction(true);
        const actionText = action === 'approved' ? "approving" : "rejecting";

        try {
            await ApproveLeave({
                leave_id: data.id,
                action: action,
                comments: comments, // Pass the comments from state
            });

            toast.success(`Leave ${action} successfully!`);
            onClose(true); // Close modal and signal a refetch
        } catch (err) {
            toast.error(`Failed ${actionText} leave. Please try again.`);
        } finally {
            setLoadingAction(false);
        }
    };

    const getStatusTag = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return <Tag color="success">Approved</Tag>;
            case 'pending': return <Tag color="warning">Pending</Tag>;
            case 'rejected': return <Tag color="error">Rejected</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const renderFooter = () => {
        const userRole = user?.roles?.[0];
        const canTakeAction = (userRole === 'Admin' || userRole === 'Super Admin') && data?.status === "Pending";

        return [
            <Button key="cancel" onClick={() => onClose()}>
                Close
            </Button>,
            ...(canTakeAction ? [
                <Button
                    key="reject"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleAction('rejected')}
                    loading={loadingAction}
                >
                    Reject
                </Button>,
                <Button
                    key="approve"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleAction('approved')}
                    loading={loadingAction}
                >
                    Approve
                </Button>
            ] : [])
        ];
    };

    const userRole = user?.roles?.[0];
    const canTakeAction = (userRole === 'Admin' || userRole === 'Super Admin') && data?.status === "Pending";

    return (
        <Modal
            title={<span className="font-semibold text-lg">{data?.type || 'Leave Details'}</span>}
            open={isOpen}
            onCancel={() => onClose()}
            footer={renderFooter()}
            width={600}
        >
            {data ? (
                <Spin spinning={loadingEmployeeName || authLoading}>
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="Employee">{employeeName || "Loading..."}</Descriptions.Item>
                        <Descriptions.Item label="Leave Type">{data.type}</Descriptions.Item>
                        <Descriptions.Item label="Applied On">{moment(data.applied_on).format("DD MMM, YYYY")}</Descriptions.Item>
                        <Descriptions.Item label="Duration">
                            {moment(data.start).format("DD MMM, YYYY")} to {moment(data.end).format("DD MMM, YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Reason">{data.reason || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Status">{getStatusTag(data.status)}</Descriptions.Item>
                    </Descriptions>

                    {canTakeAction && (
                        <div className="mt-6">
                            <Text strong>Comments (Optional)</Text>
                            <Input.TextArea
                                rows={3}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Add comments for your decision..."
                                className="mt-2"
                            />
                        </div>
                    )}
                </Spin>
            ) : (
                <div className="flex justify-center items-center h-48">
                    <Spin tip="Loading details..." />
                </div>
            )}
        </Modal>
    );
};

export default LeaveModal;