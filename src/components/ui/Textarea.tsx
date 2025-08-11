'use client';

import React, { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

type TextareaProps = {
    placeholder?: string;
    label?: string;
    className?: string;
    labelClass?: string;
    register?: any; // You can type it more strictly if you want
    name?: string;
    error?: string;
    rows?: number;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            placeholder,
            label,
            className,
            labelClass,
            register,
            name,
            error,
            rows = 4,
            ...rest
        },
        ref
    ) => {
        return (
            <div className="w-full flex flex-col gap-2">
                {label && (
                    <label
                        htmlFor={name}
                        className={clsx("text-block text-sm font-light", labelClass)}
                    >
                        {label}
                    </label>
                )}

                <div>
                    <textarea
                        id={name}
                        name={name}
                        ref={ref}
                        placeholder={placeholder}
                        rows={rows}
                        className={clsx(
                            "bg-transparent px-2 py-2 2xl:py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white outline-none text-base focus:ring-1 ring-blue-300",
                            className
                        )}
                        {...register}
                        {...rest}
                        aria-invalid={error ? "true" : "false"}
                    />
                </div>

                {error && (
                <span className="text-xs text-[#f64949fe] mt-0.5">{error}</span>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export default Textarea;
