import React, { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

const loginPage = () => {
    const [register, setRegister] = useState(false);
    console.log("Login Page Rendered");

    return (
        <div>
            <h1>Login Page</h1>
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}

export default loginPage;