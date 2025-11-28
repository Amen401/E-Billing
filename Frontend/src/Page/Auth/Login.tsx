import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Loader2, User, Shield, UserCheck, Eye, EyeOff } from "lucide-react";

import { useCustomerAuth } from "@/Components/Context/AuthContext";
import { useOfficerAuth } from "@/Components/Context/OfficerContext";
import { useAdminAuth } from "@/Components/Context/AdminContext";

const loginSchema = z.object({
  username: z.string().min(1, "Username / Account number is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { role: urlRole } = useParams(); 

  const { login: customerLogin } = useCustomerAuth();
  const { login: officerLogin } = useOfficerAuth();
  const { login: adminLogin } = useAdminAuth();

  const [role, setRole] =
    useState<"customer" | "officer" | "admin">(
      (urlRole as any) || "customer"
    );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });


  useEffect(() => {
    if (urlRole === "customer" || urlRole === "officer" || urlRole === "admin") {
      setRole(urlRole);
    }
  }, [urlRole]);


  const changeRole = (r: "customer" | "officer" | "admin") => {
    setRole(r);
    navigate(`/login/${r}`);
  };

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      if (role === "customer") {
        await customerLogin(data.username, data.password);
        navigate("/customer/dashboard");
      } else if (role === "officer") {
        await officerLogin(data.username, data.password);
        navigate("/officer/dashboard");
      } else if (role === "admin") {
        await adminLogin(data.username, data.password);
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcon =
    role === "customer" ? (
      <User className="h-7 w-7 text-primary" />
    ) : role === "officer" ? (
      <UserCheck className="h-7 w-7 text-primary" />
    ) : (
      <Shield className="h-7 w-7 text-primary" />
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-2xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center shadow-sm">
              {roleIcon}
            </div>
          </div>

          <CardTitle className="text-3xl font-semibold text-center">
            Welcome Back
          </CardTitle>

          <CardDescription className="text-center text-gray-600">
            Select your role and sign in to continue
          </CardDescription>

          <div className="grid grid-cols-3 mt-4 gap-2 bg-gray-100 p-1 rounded-lg">
            {[
              { key: "customer", label: "Customer" },
              { key: "officer", label: "Officer" },
              { key: "admin", label: "Admin" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => changeRole(key as any)}
                className={`py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  role === key
                    ? "bg-primary text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-medium">
                {role === "customer" ? "Account Number" : "Username"}
              </Label>
              <Input
                placeholder={
                  role === "customer" ? "Enter account number" : "Enter username"
                }
                {...register("username")}
                className={`h-11 rounded-lg ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

           <div className="space-y-2 relative">
  <Label className="font-medium">Password</Label>

  <Input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    {...register("password")}
    className={`h-11 rounded-lg pr-10 ${
      errors.password ? "border-red-500" : "border-gray-300"
    }`}
    disabled={isLoading}
    autoComplete="current-password"
  />


  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-9 text-gray-600 hover:text-gray-800"
  >
    {showPassword ? (
      <EyeOff className="h-5 w-5" />
    ) : (
      <Eye className="h-5 w-5" />
    )}
  </button>

  {errors.password && (
    <p className="text-xs text-red-500">{errors.password.message}</p>
  )}
</div>


            {error && (
              <p className="text-sm text-red-600 bg-red-100 border border-red-300 p-2 rounded-md text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-lg text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLogin;
