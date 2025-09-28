import React, { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

const loginPage = () => {
    const [register, setRegister] = useState(false);

    return (
        <div>
            <h1>Login Page</h1>
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    {!register && <LoginForm />}
                    {register && <RegisterForm />}
                </div>
                <div className="mt-4 text-center text-sm">
                    {register ? "Already have an account? " : "Don't have an account? "}
                    <a href="#" className="underline underline-offset-4" onClick={() => setRegister(prev => !prev)}>
                        {register ? "Login" : "Sign up"}
                    </a>
                </div>
            </div>
        </div>
    );
}

export default loginPage;