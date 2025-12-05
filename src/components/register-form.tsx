import { useState } from "react"
import { useNavigate } from "@/router"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "./ui/select"
import api from "@/api/axios"
import { toast } from "sonner"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [retypePass, setRetypePass] = useState("");
  const [showRetype, setRetype] = useState(false);
  const [role, setRole] = useState("USER");

  const [emailExist, setEmailExist] = useState(false);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !retypePass.trim()) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (password !== retypePass && password.length !== retypePass.length) {
      toast.warning("Passwords do not match");
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role
      }, { withCredentials: true });

      const { jwtToken, user } = res.data;
      setAuth(user, jwtToken);
      navigate('/product');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setEmailExist(true);
      } else {
        toast.error(`Internal Server Error: ${error.message}`);
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="pt-5">
        <CardHeader>
          <CardTitle className="text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information below to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ash Frost"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  style={{ border: `${emailExist ? "1px solid red" : ""}` }}
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailExist && <Label className="text-red-500">Email already registered</Label>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button className="absolute inset-y-0 right-3 flex items-center text-gray-500" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="retype-password">Retype Password</Label>
                </div>
                <div className="relative">
                  <Input id="retype-password" type={showRetype ? "text" : "password"} value={retypePass} onChange={(e) => setRetypePass(e.target.value)} required />
                  <button className="absolute inset-y-0 right-3 flex items-center text-gray-500" onClick={() => setRetype(!showRetype)}>{showRetype ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue={role} onValueChange={(value) => setRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Role</SelectLabel>
                      <SelectItem value="USER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
