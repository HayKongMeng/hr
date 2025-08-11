"use client";

import Button from "@/components/ui/Button";
import Textbox from "@/components/ui/Textbox";
import { useRef, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaArrowUpFromBracket } from "react-icons/fa6";

const MyProfilePage = () => {
    const [activeTab, setActiveTab] = useState("personal");
    const personalRef = useRef<HTMLDivElement>(null);
    const addressRef = useRef<HTMLDivElement>(null);
    const passwordRef = useRef<HTMLDivElement>(null);

    const [preview, setPreview] = useState<string>("/avatar.png");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreview(imageUrl);
        }
    };

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);

        // Scroll to section smoothly
        const scrollOptions: ScrollIntoViewOptions = { behavior: "smooth", block: "start" };

        if (tab === "personal") personalRef.current?.scrollIntoView(scrollOptions);
        if (tab === "address") addressRef.current?.scrollIntoView(scrollOptions);
        if (tab === "password") passwordRef.current?.scrollIntoView(scrollOptions);
    };


    return (
        <div>
            <div className="flex items-center justify-between m-4">
                <div>
                    <h1 className="hidden md:block text-lg font-semibold mb-0">Account Setting</h1>
                </div>
                <div className="flex items-center gap-4 self-end m-4 mb-0">
                </div>
            </div>
            <div className="flex p-4 pt-0">
                <aside className="w-72 bg-white rounded-xl shadow h-fit self-start card-table">
                    <ul>
                        <li
                            onClick={() => handleTabClick("personal")}
                            className={`text-sm p-4 cursor-pointer rounded-t-xl font-light flex items-center justify-between ${
                                activeTab === "personal" ? "bg-lime-500 text-white" : "hover:bg-gray-100"
                            }`}
                        >
                            Personal Info <MdKeyboardArrowRight size={18} />
                        </li>
                        <li
                            onClick={() => handleTabClick("address")}
                            className={`text-sm p-4 cursor-pointer font-light flex items-center justify-between ${
                                activeTab === "address" ? "bg-lime-500 text-white" : "hover:bg-gray-100"
                            }`}
                        >
                            Address Information <MdKeyboardArrowRight size={18} />
                        </li>
                        <li
                            onClick={() => handleTabClick("password")}
                            className={`text-sm p-4 cursor-pointer rounded-b-xl font-light flex items-center justify-between ${
                                activeTab === "password" ? "bg-lime-500 text-white" : "hover:bg-gray-100"
                            }`}
                        >
                            Change Password <MdKeyboardArrowRight size={18} />
                        </li>
                    </ul>
                </aside>
                <div ref={personalRef} className="ml-6 flex-1 items-center rounded-xl justify-between border-b card-table">
                    <div className="border-l-[3px] border-[#6FD943] px-4 py-1 mb-2 mt-3">
                        <h2 className="text-lg font-semibold">Personal Information</h2>
                        <small>Details about your personal information</small>
                    </div>
                    <div className="border-t px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Textbox
                                type="text"
                                name="name"
                                label="Name *"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="Email *"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="Phone *"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="px-4 py-4">
                        <label className="block mb-2 font-semibold text-gray-700">Avatar</label>
                        {/* Custom Upload Button */}
                        <div className="flex items-center gap-4 mb-4">
                            <label className="inline-flex items-center px-4 py-2 bg-lime-500 font-light text-sm text-white rounded-md cursor-pointer hover:bg-lime-600 transition">
                               <FaArrowUpFromBracket className="mr-2" />
                                Choose File
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>

                            <span className="text-sm text-gray-500">JPG, PNG, max 2MB</span>
                        </div>

                        {/* Avatar Preview */}
                        <div className="w-28 h-28 border border-dashed rounded-md overflow-hidden">
                            <img
                                src={preview}
                                alt="avatar preview"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <p className="text-xs mt-2 text-gray-500">
                            Please upload a valid image file. Max size: 2MB.
                        </p>
                    </div>

                    <div className="flex justify-between px-4 py-4">
                        <div></div>
                        <div>
                            <Button
                                type="button"
                                className="inline-flex items-center px-4 py-3 border border-[#6FD943] bg-[#69d63b] text-sm font-medium text-white hover:bg-[#4ec11e] rounded-lg"
                                label="Save Changes"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex p-4 pt-0">
                <div className="w-72"></div>
                <div ref={addressRef} className="ml-6 flex-1 items-center rounded-xl justify-between border-b card-table">
                    <div className="border-l-[3px] border-[#6FD943] px-4 py-1 mb-2 mt-3">
                        <h2 className="text-lg font-semibold">Address Information</h2>
                    </div>
                    <div className="border-t px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Textbox
                                type="text"
                                name="name"
                                label="Address"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <Textbox
                                type="text"
                                name="email"
                                label="Country"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="State"
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <Textbox
                                type="text"
                                name="email"
                                label="City"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="Postal Code"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between px-4 py-4">
                        <div></div>
                        <div>
                            <Button
                                type="button"
                                className="inline-flex items-center px-4 py-3 border border-[#6FD943] bg-[#69d63b] text-sm font-medium text-white hover:bg-[#4ec11e] rounded-lg"
                                label="Save Changes"
                            />
                        </div>
                    </div>
                </div>             
            </div>
            <div className="flex p-4 pt-0">
                <div className="w-72"></div>
                <div ref={passwordRef} className="ml-6 flex-1 items-center rounded-xl justify-between border-b card-table">
                    <div className="border-l-[3px] border-[#6FD943] px-4 py-1 mb-2 mt-3">
                        <h2 className="text-lg font-semibold">Change Password</h2>
                    </div>
                    <div className="border-t px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Textbox
                                type="text"
                                name="name"
                                label="Current Password *"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="New Password *"
                                className="w-full rounded-lg"
                            />
                            <Textbox
                                type="text"
                                name="email"
                                label="Re-type New Password *"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between px-4 py-4">
                        <div></div>
                        <div>
                            <Button
                                type="button"
                                className="inline-flex items-center px-4 py-3 border border-[#6FD943] bg-[#69d63b] text-sm font-medium text-white hover:bg-[#4ec11e] rounded-lg"
                                label="Save Changes"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
