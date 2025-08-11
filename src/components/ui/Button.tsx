'use client';

import React from "react";
import clsx from "clsx";

type ButtonProps = {
    className?: string;
    label: string;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
    className,
    label,
    type = "button",
    onClick = () => {},
    icon,
    disabled = false,
    loading = false,
}) => {
    return (
        <button
            type={type}
            className={clsx("flex items-center justify-center gap-2 px-2 py-2 outline-none", className)}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span>{icon}</span>}
            <span>{label}</span>
            {loading && (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M14.6667 8.33333C14.6667 11.5917 12.4083 14.8667 9.99998 14.8667C7.59167 14.8667 5.33333 11.5917 5.33333 8.33333C5.33333 4.07833 7.59167 1.80333 9.99998 1.80333C12.4083 1.80333 14.6667 4.07833 14.6667 8.33333Z"
                        stroke="#141414"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M7.33333 10.6667L10.6667 7.33333"
                        stroke="#141414"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    );
};

export default Button;
