import React from "react";
import { Link } from "@/router";
import { LoginForm } from "@/components/login-form";

const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8ECAE6] to-white pt-5">
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <LoginForm />
                    <p className="mt-4 text-center text-sm">
                        Don't have an account?
                        <Link to="/register" className="underline underline-offset-4"> Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;