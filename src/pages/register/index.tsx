import React, { useState } from "react";
import { Link } from "@/router";
import { RegisterForm } from "@/components/register-form";

const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-t from-[#8ECAE6] to-white pt-5">
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <RegisterForm />
                    <p className="mt-4 text-center text-sm">
                        Already have an account?
                        <Link to="/login" className="underline underline-offset-4"> Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;