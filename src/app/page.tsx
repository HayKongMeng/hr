"use client";  // Ensure this line is at the top of the file

import { useState } from 'react';
import { toast } from "sonner";
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { fetchAllEmployees } from '@/lib/api/employee';
import api from '@/lib/api';
import Textbox from '@/components/ui/Textbox';
import { Button } from 'antd';
import Loading from '@/components/ui/Loading';

type LoginFormData = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

    const handleLogin = async (data: LoginFormData) => {
        setIsLoading(true);
      
        try {
            const response = await api.post('/auth/login', data);
           
            const { user, token } = response.data.result;
            localStorage.setItem('access_token', token);
            console.log(token);
            
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user_name', user.name);

            // Fetch all employees
            // const employees = await fetchAllEmployees();
           
            // const employee = employees.find(emp => emp.user_id === user.id);

            // if (employee) {
            //     localStorage.setItem('employee_id', employee.id.toString());
            // } else {
            //     console.warn('Employee not found for user.id:', user.id);
            // }
       
            toast.success('Login successful!');
            router.push('/dashboard/admin');
            // window.location.href = '/dashboard/admin'; dashboard/mobile/home
            // window.location.href = 'dashboard/mobile/home';

        } catch (error: any) {
            setIsLoading(false);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error(error.message || 'Login failed');
            }
        }
    };
      
    return (
        <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black'>
            <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
                <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
                    <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
                        <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base dark:border-gray-700 dark:text-blue-400 border-gray-300 text-gray-600'>
                            Manage all your tasks in one place.
                        </span>
                        <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center dark:text-gray-400 text-blue-700'>
                            <span>HR</span>
                            <span>Management</span>
                        </p>
                      <div className='cell'>
                          <div className='circle rotate-in-up-left'></div>
                      </div>
                    </div>
                </div>
    
                <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
                    <form
                        onSubmit={handleSubmit(handleLogin)}
                        className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white dark:bg-slate-900 px-10 pt-14 pb-14 rounded-lg'
                    >
                        <div>
                            <p className='text-blue-600 text-3xl font-bold text-center'>
                                Welcome back!
                            </p>
                            <p className='text-center text-base text-gray-700 dark:text-gray-500'>
                                Keep all your credentials safe!
                            </p>
                        </div>
                        <div className='flex flex-col gap-y-5'>
                            <Textbox
                                placeholder='you@example.com'
                                type='email'
                                name='email'
                                label='Email Address'
                                className='w-full rounded-full'
                                register={register("email", {
                                    required: "Email Address is required!",
                                })}
                                error={errors.email ? errors.email.message : ""}
                            />
                            <Textbox
                                placeholder='password'
                                type='password'
                                name='password'
                                label='Password'
                                className='w-full rounded-full'
                                register={register("password", {
                                    required: "Password is required!",
                                })}
                                error={errors.password ? errors.password?.message : ""}
                            />
                            <span className='text-sm text-gray-600 hover:underline cursor-pointer'>
                                Forget Password?
                            </span>
                        </div>
                        {isLoading ? (
                            <Loading />
                        ) : (
                            <Button
                                type='text'
                                className='w-full h-10 bg-blue-700 text-white rounded-full'
                            />
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;