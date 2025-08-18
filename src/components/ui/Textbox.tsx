'use client';

import React, { useState, InputHTMLAttributes } from "react";
import clsx from "clsx";
import { FiEye, FiEyeOff } from "react-icons/fi";

type TextboxProps = {
    type?: string;
    placeholder?: string;
    label?: string;
    className?: string;
    labelClass?: string;
    register?: ReturnType<any>; // React Hook Form register result
    name?: string;
    error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Textbox: React.FC<TextboxProps> = ({
    type = "text",
    placeholder,
    label,
    className,
    labelClass,
    register,
    name,
    error,
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="w-full flex flex-col gap-2">
            {label && (
                <label
                    htmlFor={name}
                    className={clsx("text-block text-sm font-light text-white", labelClass)}
                >
                    {label.split('*').map((part, index, arr) => (
                        <React.Fragment key={index}>
                            {part}
                            {index < arr.length - 1 && (
                                <span className="text-red-500 font-semibold">*</span>
                            )}
                        </React.Fragment>
                    ))}
                </label>
            )}

            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    className={clsx(
                        "bg-transparent px-2 py-2 pr-10 2xl:py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white outline-none text-base focus:ring-1 ring-blue-500 w-full",
                        className
                    )}
                    {...register}
                    {...rest}
                    aria-invalid={!!error}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                    >
                        {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                    </button>
                )}
            </div>

            {error && (
                <span className="text-xs text-[#f64949fe] mt-0.5">{error}</span>
            )}
        </div>
    );
};

export default Textbox;


// 'use client';

// import React, { InputHTMLAttributes, useState } from "react";
// import clsx from "clsx";
// import { FiEye, FiEyeOff } from "react-icons/fi";

// type TextboxProps = {
//     type?: string;
//     placeholder?: string;
//     label?: string;
//     className?: string;
//     labelClass?: string;
//     register?: any;
//     name?: string;
//     error?: string;
// } & InputHTMLAttributes<HTMLInputElement>;

// const Textbox = React.forwardRef<HTMLInputElement, TextboxProps>(
//     (
//         {
//             type = "text",
//             placeholder,
//             label,
//             className,
//             labelClass,
//             register,
//             name,
//             error,
//             ...rest
//         },
//         ref
//     ) => {
//         const [showPassword, setShowPassword] = useState(false);
//         const isPassword = type === "password";
//         const inputType = isPassword && showPassword ? "text" : type;

//         return (
//             <div className="w-full flex flex-col gap-2">
//                 {label && (
//                     <label
//                         htmlFor={name}
//                         className={clsx("text-block text-sm font-light", labelClass)}
//                     >
//                         {label.split('*').map((part, index, arr) => (
//                             <React.Fragment key={index}>
//                                 {part}
//                                 {index < arr.length - 1 && <span className="text-red-500 font-semibold">*</span>}
//                             </React.Fragment>
//                         ))}
//                     </label>
//                 )}


//                 <div className="relative">
//                     <input
//                         type={inputType}
//                         name={name}
//                         placeholder={placeholder}
//                         ref={ref}
//                         className={clsx(
//                             "bg-transparent px-2 py-2 pr-10 2xl:py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white outline-none text-base focus:ring-1 ring-blue-500 w-full",
//                             className
//                         )}
//                         {...register}
//                         {...rest}
//                         aria-invalid={error ? "true" : "false"}
//                     />

//                     {/* Toggle visibility icon */}
//                     {isPassword && (
//                         <button
//                             type="button"
//                             onClick={() => setShowPassword(!showPassword)}
//                             className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                             tabIndex={-1}
//                         >
//                             {showPassword ?  <FiEye size={18} /> : <FiEyeOff size={18} />}
//                         </button>
//                     )}
//                 </div>

//                 {error && (
//                     <span className="text-xs text-[#f64949fe] mt-0.5">{error}</span>
//                 )}
//             </div>
//         );
//     }
// );

// Textbox.displayName = "Textbox";
// export default Textbox;
