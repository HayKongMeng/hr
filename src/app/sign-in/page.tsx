"use client";

import { useState, useRef, useEffect } from 'react'; // Import useRef and useEffect for the effect
import api from '../../lib/api/index';
import { toast } from "sonner";
import Textbox from "../../components/ui/Textbox";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import axios from "axios";
import {jwtDecode} from "jwt-decode";

type LoginFormData = {
    email: string;
    password: string;
};
interface TokenPayload {
    roles: string[];
}
const LoginPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    // const { setRole } = useAuth();
    const { login } = useAuth();

    const formRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
        const formElement = formRef.current;
        if (!formElement) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = formElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            formElement.style.setProperty('--mouse-x', `${x}px`);
            formElement.style.setProperty('--mouse-y', `${y}px`);
        };

        formElement.addEventListener('mousemove', handleMouseMove);

        return () => { // Cleanup function
            formElement.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleLogin = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/auth/login', data);

            const { token } = response.data;

            if (!token || typeof token !== 'string') {
                throw new Error("Invalid token received from server.");
            }

            login(token);

            const decoded = jwtDecode<TokenPayload>(token);
            const userRole = decoded.roles[0];

            toast.success('Login successful!');

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
        <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row animated-gradient-bg'>
            <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
                <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
                    <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
                        <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-white'>
                            <span>HR</span>
                            <span>Management</span>
                        </p>
                    </div>
                </div>

                <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit(handleLogin)}
                        className='glass-form-container w-full md:w-[400px] flex flex-col gap-y-8 px-8 sm:px-10 pt-12 pb-10'
                    >
                        <div>
                            <p className='text-white text-3xl font-bold text-center'>
                                Welcome Back
                            </p>
                            <p className='text-center text-base text-gray-300'>
                                Securely sign in to your account.
                            </p>
                        </div>
                        <div className='flex flex-col gap-y-5'>
                            <Textbox
                                placeholder='you@example.com'
                                type='email'
                                name='email'
                                label='Email Address'
                                labelClass="text-white"
                                className='border-white w-full bg-white/5 border-white/20 text-white placeholder-white dark:placeholder-gray-300 dark:text-gray-300 focus:border-white/50 rounded-lg'
                                register={register("email", {
                                    required: "Email Address is required!",
                                })}
                                error={errors.email ? errors.email.message : ""}
                            />
                            <Textbox
                                placeholder='••••••••'
                                type='password'
                                name='password'
                                label='Password'
                                labelClass="text-white"
                                className='w-full bg-white/5 border-white/20 text-white placeholder-white dark:placeholder-gray-300 dark:text-gray-300 focus:border-white/50 rounded-lg'
                                register={register("password", {
                                    required: "Password is required!",
                                })}
                                error={errors.password ? errors.password?.message : ""}
                            />
                        </div>
                        {isLoading ? (
                            <Loading />
                        ) : (
                            <Button
                                type='submit'
                                label='Log In'
                                // --- STYLE UPDATE: ClassName for glass button ---
                                className='w-full h-11 bg-white/90 text-black font-semibold hover:bg-white transition-all duration-300 rounded-lg'
                            />
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;