import { Modal, Button, Flex, Typography, Avatar } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LogoutModalProps {
    open: boolean; // Use 'open' to align with Ant Design's API
    onCancel: () => void;
    onLogout: () => void;
}

const LogoutModal = ({ open, onCancel, onLogout }: LogoutModalProps) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            centered // Vertically centers the modal
            footer={null} // We will create a custom footer inside the modal body
            width={400}
            closable={false} // Prevents closing with the 'x' button, forcing a choice
        >
            <Flex vertical align="center" gap="middle" className="py-6">

                {/* Icon mimicking the original design */}
                <Avatar
                    size={72}
                    icon={<ExclamationCircleFilled />}
                    style={{
                        backgroundColor: '#fff1f0', // Ant Design's red-1
                        color: '#ff4d4f', // Ant Design's red-6
                        fontSize: '36px'
                    }}
                />

                {/* Title and Text */}
                <Flex vertical align="center" gap={4}>
                    <Title level={4} style={{ margin: 0 }}>Logout</Title>
                    <Text type="secondary">Are you sure you want to log out?</Text>
                </Flex>

                {/* Custom Footer Buttons */}
                <Flex justify="center" gap="middle" className="w-full mt-4">
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        danger // This makes the primary button red for destructive actions
                        size="large"
                        onClick={onLogout}
                        style={{ flex: 1 }}
                    >
                        Logout
                    </Button>
                </Flex>
            </Flex>
        </Modal>
    );
};

export default LogoutModal;