"use client";
import { useState } from "react";
import { RxEyeClosed, RxEyeOpen } from "react-icons/rx";

const ChangePasswordModal = ({ onCancel }: { onCancel?: () => void }) => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    return (
        <div className="flex flex-col gap-4 p-4 sm:p-6 w-[90vw] max-w-[400px] bg-white rounded-[16px] sm:rounded-[20px] shadow-lg">
            <h1 className="text-[#1A1A2E] text-xl sm:text-2xl font-bold">Change Password</h1>
            <span className="text-sm text-[#4F4F4F]">
                Password must contain at least 1 letter, 1 number, and 1 symbol. Minimum length is 12 characters.
            </span>

            <div>
                <form>
                    <label htmlFor="current-password">Current password</label>
                    <div
                        className="flex flex-row items-center px-[10px] py-[7px] gap-[12px]
                        bg-[rgba(150,166,194,0.2)] rounded-[10px]
                        flex-none order-1 self-stretch flex-grow-0"
                    >
                        <input
                            id="current-password"
                            type={showCurrent ? "text" : "password"}
                            placeholder=""
                            className="bg-transparent outline-none w-full text-[#364663]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent((v) => !v)}
                            tabIndex={-1}
                        >
                            {showCurrent ? (
                                <RxEyeOpen className="text-[#96A6C2]" />
                            ) : (
                                <RxEyeClosed className="text-[#96A6C2]" />
                            )}
                        </button>
                    </div>
                    <label htmlFor="new-password">New password</label>
                    <div
                        className="flex flex-row items-center px-[10px] py-[7px] gap-[12px]
                        bg-[rgba(150,166,194,0.2)] rounded-[10px]
                        flex-none order-1 self-stretch flex-grow-0"
                    >
                        <input
                            id="new-password"
                            type={showNew ? "text" : "password"}
                            placeholder=""
                            className="bg-transparent outline-none w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            tabIndex={-1}
                        >
                            {showNew ? (
                                <RxEyeOpen className="text-[#96A6C2]" />
                            ) : (
                                <RxEyeClosed className="text-[#96A6C2]" />
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 w-full">
                <button
                    className="box-border flex flex-row justify-center items-center px-4 sm:px-5 py-2.5 sm:py-3.5 gap-2.5
                         h-10 sm:h-12
                bg-[#EAEDF3] border border-[#F5F6F7] rounded-full
                flex-none flex-grow text-sm sm:text-base font-bold"
                    onClick={onCancel}
                >Cancel</button>
                <button className="box-border flex flex-row justify-center items-center px-4 sm:px-5 py-2.5 sm:py-3.5 gap-2.5
                  h-10 sm:h-12
                bg-[#392648] rounded-full
                flex-none flex-grow text-white text-sm sm:text-base font-bold"
                >
                    Change Password
                </button>
            </div>
        </div>
    )
}

export default ChangePasswordModal