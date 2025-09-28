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
import api from "@/lib/axios"
import { set } from "zod"
import { eslintUseValue } from "@mui/x-data-grid/internals"

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
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await api.post('/api/login', {
        email,
        password
      }, { withCredentials: true });

      const { jwtToken, user } = res.data;
      setAuth(user, jwtToken);
      navigate('/dashboard');

    } catch (error: any) {
      if (error.response.status === 401) {
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
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleLogin}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
