import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/context/UnifiedContext";

const loginSchema = z.object({
  username: z.string().min(1, "Username / Account number is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

 const onSubmit = async (data: LoginFormData) => {
  setError("");
  setIsLoading(true);
  try {

    const roleLoggedIn = await login(data.username, data.password);

    if (roleLoggedIn === "customer") navigate("/customer/dashboard");
    else if (roleLoggedIn === "officer") navigate("/officer/dashboard");
    else if (roleLoggedIn === "admin") navigate("/admin/dashboard");

  } catch (err: any) {
    console.error(err);
    setError(err.message || "Login failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-2xl">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-semibold">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-medium">Username / Account Number</Label>
              <Input
                placeholder="Enter username or account number"
                {...register("username")}
                className={`h-11 rounded-lg ${errors.username ? "border-red-500" : "border-gray-300"}`}
                disabled={isLoading}
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2 relative">
              <Label className="font-medium">Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={`h-11 rounded-lg pr-10 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-100 border border-red-300 p-2 rounded-md text-center">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 rounded-lg text-base font-medium" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Logging in...</> : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLogin;
