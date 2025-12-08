import { useState } from "react"
import { useNavigate } from "@/router"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"
import api from "@/api/axios"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      const res = await api.post('/auth/login', {
        email,
        password
      }, { withCredentials: true });

      const { jwtToken, user } = res.data;
      setAuth(user, jwtToken);
      navigate('/dashboard');

    } catch (error: any) {
      if (error.response?.status === 401) {
        if (error.response.data.invalid === "email") {
          setEmailError(true);
        } else {
          setEmailError(false);
        }

        if (error.response.data.invalid === "password") {
          setPasswordError(true);
        } else {
          setPasswordError(false);
        }
      } else {
        toast.error(`Internal Server Error: ${error.message}`);
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="pt-5">
        <CardHeader>
          <CardTitle className="text-center">Login to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email & password below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  style={{ border: `${emailError ? "1px solid red" : ""}` }}
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailError && <Label className="text-red-500">Invalid email</Label>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  style={{ border: `${passwordError ? "1px solid red" : ""}` }}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
                {passwordError && <Label className="text-red-500">Invalid password</Label>}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
