'use client'

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react'
import { LuUser } from "react-icons/lu";
import { IoMdPower } from "react-icons/io";
import Link from 'next/link';

const api = {
    post: async (url: string) => {
        if (url === '/auth/logout') {
            return new Promise((resolve) => setTimeout(resolve, 500));
        }
        throw new Error('Unknown endpoint');
    },
};

export default function UserDropdown() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [userName, setUserName] = useState<string>('')
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const employeeId = typeof window !== 'undefined' ? localStorage.getItem('employee_id') : null;

    useEffect(() => {
        const storedName = localStorage.getItem('user_name')
        if (storedName) {
            setUserName(storedName)
        }
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) { 
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            toast.success('Logged out successfully!');
            router.push('/sign-in');
        } catch (error: any) {
            toast.error('Logout failed. Try again.');
        }
    };

    return (
        <div className="relative inline-block text-left w-full" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border ring-gray-300 text-xs md:w-auto md:h-auto md:gap-2 md:rounded-xl md:ring-[1.5px] md:py-1.5 md:px-2"
            >
                <img
                    src="/avatar.png"
                    alt="User"
                    className="w-8 h-8 rounded-lg md:rounded-full md:border-2 border-green-400"
                />
                <div className="hidden md:inline text-blue-600 font-normal">Hi, {userName}!</div>
                <svg
                    className="hidden md:inline w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl card-table z-10">
                    <ul className="py-2">
                        <li className='px-4 py-4  text-sm font-normal text-[#293240] cursor-pointer hover:bg-gray-100'>
                           <Link href={`/dashboard/list/employees/${employeeId}`} className="gap-2 flex items-center">
                                <LuUser size={20} /> My Profile
                            </Link>
                        </li>
                        <li onClick={handleLogout} className="px-4 py-4 text-sm font-normal text-[#293240] hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                            <IoMdPower size={20} /> Logout
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}
