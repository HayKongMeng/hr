'use client';

import React, {useState} from 'react';
import {Button, Badge, Tabs, TabsProps} from 'antd';
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { RiMenuUnfoldFill } from 'react-icons/ri';
import { IoMdNotificationsOutline } from "react-icons/io";

import UserDropdown from './UserDropdown';
import {FiSettings} from "react-icons/fi";
import Modal from "@/components/Modal";
import {HiOutlineMenuAlt2} from "react-icons/hi";

interface NavbarProps {
    toggleCollapsed: () => void;
    collapsed: boolean;
    toggleMenu: () => void;
    onNotificationClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleCollapsed, collapsed,toggleMenu, onNotificationClick }) => {

    const [isNotiModalOpen, setIsNotiModalOpen] = useState(false);

    const handleNotificationClick = () => {
        setIsNotiModalOpen(true);
    };

    const closeNotiModal = () => {
        setIsNotiModalOpen(false);
    };

    const notificationList = [
        {
            id: 1,
            avatar: "/avatar.png",
            name: "Srey Mom",
            message: "approved your leave request.",
            time: "2 min ago",
        },
        {
            id: 2,
            avatar: "/avatar.png",
            name: "John Smith",
            message: "commented on your attendance.",
            time: "10 min ago",
        },
        // Add more notifications as needed
    ];

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "All",
            children: (
                <div className="space-y-4">
                    {notificationList.map((noti) => (
                        <div
                            key={noti.id}
                            className="flex  gap-3 bg-[#64B5F6] bg-opacity-15 p-3"
                        >
                            <img
                                src={noti.avatar}
                                alt={noti.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-lg">{noti.name}</div>
                                <div className="text-xs text-gray-400 whitespace-nowrap">
                                    {noti.time}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">{noti.message}</div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: "2",
            label: "Attendance",
            children: "Content of Tab Pane 2",
        },
        {
            key: "3",
            label: "Leave",
            children: "Content of Tab Pane 3",
        },
        {
            key: "4",
            label: "Announce",
            children: "Content of Tab Pane 3",
        },
    ];
    return (
        <div className="flex items-center justify-between bg-light-card p-3 border-b border-light-border shadow-sm">

            <div className="flex items-center gap-4">

                <Button
                    className="hidden md:flex items-center justify-center text-gray-500"
                    type="text"
                    icon={collapsed ? <AiOutlineMenuUnfold size={20} /> : <RiMenuUnfoldFill size={20} />}
                    onClick={toggleCollapsed}
                />

                <Button
                    className="flex md:hidden items-center justify-center text-gray-500"
                    type="text"
                    icon={<HiOutlineMenuAlt2 size={22} />}
                    onClick={toggleMenu}
                />
                <UserDropdown />

            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Badge count={2} size="small" onClick={handleNotificationClick}>
                        <Button
                            type="text"
                            shape="circle"
                            className="flex items-center justify-center text-text-secondary hover:text-text-primary"
                            icon={<IoMdNotificationsOutline size={22} />}
                            onClick={onNotificationClick}
                        />
                    </Badge>

                    {/*<Button*/}
                    {/*    type="text"*/}
                    {/*    shape="circle"*/}
                    {/*    className="flex items-center justify-center text-text-secondary hover:text-text-primary"*/}
                    {/*    icon={<FiSettings size={20} />}*/}
                    {/*/>*/}
                </div>

                {/*<div className="w-px h-8 bg-light-border mx-2 hidden md:block"></div>*/}

            </div>
            <Modal
                isOpen={isNotiModalOpen}
                onClose={closeNotiModal}
                title="Notifications"
                className="px-4"
            >
                <Tabs defaultActiveKey="1" items={items} />
            </Modal>
        </div>
    );
};

export default Navbar;