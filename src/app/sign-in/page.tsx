"use client";

import { useState } from 'react';
import { toast } from "sonner";
import Textbox from "../../components/ui/Textbox";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import axios from "axios";
import { encryptData } from '@/lib/crypto';

type LoginFormData = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const { login } = useAuth();

    const handleLogin = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            // <-- 2. ENCRYPT THE PASSWORD
            const payload = {
                email: data.email,
                password: encryptData(data.password), // Encrypt here!
            };

            // Send the payload with the encrypted password
            const response = await axios.post('/api/auth/login', payload);

            const { token, user, employee } = response.data;

            if (!token || !user) {
                throw new Error("Invalid login response from server.");
            }

            login({ token, user, employee });

            toast.success('Login successful!');

            const userRole = user.roles[0];
            if (userRole === 'Employee') {
                router.push('/dashboard/dash');
            } else {
                router.push('/dashboard/admin');
            }

        } catch (error: any) {
            setIsLoading(false);
            const errorMessage = error.response?.data?.message || error.message || "An unknown login error occurred.";
            toast.error(errorMessage);
        }
    };

    return (
        <div
            className='w-full min-h-screen flex items-center justify-center p-4 bg-cover bg-center backdrop-blur-xs '
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=1920&auto=format&fit=crop')",
            }}
        >
            <div className="absolute inset-0 bg-black/30" />
            <div className='w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-20 relative z-10 text-white'>
                {/* Left Side: Branding and Text */}
                <div className='text-white text-center lg:text-left '>
                    <div className='flex items-center justify-center lg:justify-start gap-2 mb-4'>
                        <span className='text-2xl font-bold tracking-wider'>Welcome</span>
                        {/* A simple SVG to replicate the plane icon and dashed line */}
                        <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M1 12H15" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                            <path d="M38.5 12.5L25 18V7L38.5 12.5Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                    <h1 className='text-5xl md:text-6xl font-extrabold leading-tight'>
                        NEW DAY WITH YOUR WORK
                    </h1>
                    <p className='mt-6 text-lg'>
                        We're glad you're here. Log in to access your dashboard, manage your information, and stay connected with your team
                    </p>
                </div>

                {/* Right Side: Login Form */}
                <div className='w-full max-w-md mx-auto'>
                    <form
                        onSubmit={handleSubmit(handleLogin)}
                        className='bg-gray-900/40 backdrop-blur-lg shadow-2xl rounded-2xl p-8 space-y-6'
                    >
                        <div className='flex flex-col gap-y-5'>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                                <Textbox
                                    placeholder='Enter your email'
                                    type='email'
                                    name='email'
                                    className='w-full rounded-md p-2.5 placeholder-gray-200 dark:placeholder-gray-200 text-white dark:text-white'
                                    register={register("email", {
                                        required: "Email Address is required!",
                                    })}
                                    error={errors.email ? errors.email.message : ""}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
                                </div>
                                <Textbox
                                    placeholder='Enter your password'
                                    type='password'
                                    name='password'
                                    className='w-full rounded-md p-2.5 placeholder-gray-200 dark:placeholder-gray-200 text-white dark:text-white'
                                    register={register("password", {
                                        required: "Password is required!",
                                    })}
                                    error={errors.password ? errors.password?.message : ""}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <Loading />
                        ) : (
                            <Button
                                type='submit'
                                label='SIGN IN'
                                className='w-full h-11 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 rounded-md'
                            />
                        )}

                        <div className="flex items-center gap-4">
                            <hr className="w-full border-gray-500" />
                            <span className="text-gray-400 text-sm">or</span>
                            <hr className="w-full border-gray-500" />
                        </div>

                        <p className="text-center text-sm text-gray-300">
                            Are you new?{" "} Please contact your supervisor.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;