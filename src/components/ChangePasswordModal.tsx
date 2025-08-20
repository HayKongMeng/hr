"use client";
import { useState, FormEvent } from "react";
import { RxEyeClosed, RxEyeOpen } from "react-icons/rx";
import { updateEmployeeRegistration } from "@/lib/api/users"; // Use the correct API function
import { message } from "antd"; // Use Ant Design's message for feedback

interface ChangePasswordModalProps {
    open: boolean;
    // We now need the full employee object to get name and email for the payload
    employee: { user_id: number; name: string; email: string; };
    onCancel: () => void;
    onSuccess: () => void;
}

const ChangePasswordModal = ({ open, employee, onCancel, onSuccess }: ChangePasswordModalProps) => {
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // State for form inputs (current password removed)
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // --- Client-side validation ---
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) { // A standard minimum length
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        // --- Construct the payload as required by the new API endpoint ---
        const payload = {
            name: employee.name,
            email: employee.email,
            password: newPassword,
        };

        try {
            // --- Call the correct API function ---
            await updateEmployeeRegistration(employee.user_id, payload);
            message.success("Password updated successfully!");
            onSuccess();
            handleClose(); // Close and reset form on success
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to update password.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset all state when closing
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setLoading(false);
        onCancel(); // Call parent's cancel function
    };

    if (!open) {
        return null;
    }

    return (
        // Modal Overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="flex flex-col gap-4 p-4 sm:p-6 w-[90vw] max-w-[400px] bg-white rounded-[16px] sm:rounded-[20px] shadow-lg">
                <h1 className="text-[#1A1A2E] text-xl sm:text-2xl font-bold">Change Password</h1>
                <span className="text-sm text-[#4F4F4F]">
                    Password must be at least 8 characters long.
                </span>

                <div>
                    <form onSubmit={handleSubmit}>
                        {/* "Current Password" field has been removed */}

                        <label htmlFor="new-password">New password</label>
                        <div className="flex flex-row items-center px-[10px] py-[7px] gap-[12px] bg-[rgba(150,166,194,0.2)] rounded-[10px] mb-3">
                            <input
                                id="new-password"
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="bg-transparent outline-none w-full text-[#364663]"
                            />
                            <button type="button" onClick={() => setShowNew((v) => !v)} tabIndex={-1}>
                                {showNew ? <RxEyeOpen className="text-[#96A6C2]" /> : <RxEyeClosed className="text-[#96A6C2]" />}
                            </button>
                        </div>

                        <label htmlFor="confirm-password">Confirm new password</label>
                        <div className="flex flex-row items-center px-[10px] py-[7px] gap-[12px] bg-[rgba(150,166,194,0.2)] rounded-[10px]">
                            <input
                                id="confirm-password"
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-transparent outline-none w-full text-[#364663]"
                            />
                            <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                                {showConfirm ? <RxEyeOpen className="text-[#96A6C2]" /> : <RxEyeClosed className="text-[#96A6C2]" />}
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </form>
                </div>

                <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 w-full pt-2">
                    <button
                        className="box-border flex-row justify-center items-center px-4 sm:px-5 py-2.5 sm:py-3.5 gap-2.5 h-10 sm:h-12 bg-[#EAEDF3] border border-[#F5F6F7] rounded-full flex-none flex-grow text-sm sm:text-base font-bold"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="box-border flex flex-row justify-center items-center px-4 sm:px-5 py-2.5 sm:py-3.5 gap-2.5 h-10 sm:h-12 bg-[#392648] rounded-full flex-none flex-grow text-white text-sm sm:text-base font-bold disabled:bg-gray-400"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Change Password'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;