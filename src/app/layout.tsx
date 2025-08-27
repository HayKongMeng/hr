import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import 'antd/dist/reset.css'; // Ant Design v5+
import { AuthProvider } from "@/lib/AuthContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Human Resource Management System",
    description: "A Human Resource Management System (HRMS) is a software solution designed to manage and automate HR processes, from employee recruitment and payroll to performance management and compliance. It helps HR teams streamline administrative tasks, improve efficiency, and ensure compliance with labor laws.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-light-bg text-text-primary`}>
                <AuthProvider>
                    <ScrollToTop />
                    <Toaster richColors position='top-center' />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
