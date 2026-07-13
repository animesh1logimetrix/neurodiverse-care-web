import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && isSuccess) {
      navigate("/signin");
    }
    return () => clearTimeout(timer);
  }, [countdown, isSuccess, navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      
      await axiosClient.post("/user/reset-password", { password, token });
      
      setIsSuccess(true);
      setCountdown(5); // Redirect to login after 5 seconds
      toast.success("Password reset successfully. Redirecting to login...");
    } catch (err: any) {
      console.error("Reset password error:", err);
      const errMsg = err.response?.data?.message || "Failed to reset password. Please try again later.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between bg-[#0a7a66] px-12 py-16 text-white overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden relative">
               <div className="absolute w-full h-full bg-orange-400 rotate-45 transform translate-x-1/2"></div>
            </div>
            <span className="text-xl font-semibold">NeuroCare</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-6">
            Create a new password.
          </h1>

          <p className="text-lg text-white/90 mb-12 max-w-md">
            Please enter your new password below to regain access to your NeuroCare account.
          </p>
        </div>

        <div className="pt-8 border-t border-white/20 flex items-center gap-3 mt-16">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-[#0a7a66]"></div>
            <div className="w-8 h-8 rounded-full bg-purple-300 border-2 border-[#0a7a66]"></div>
            <div className="w-8 h-8 rounded-full bg-pink-300 border-2 border-[#0a7a66]"></div>
            <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-[#0a7a66]"></div>
          </div>
          <span className="text-sm text-white/90">Trusted by <strong className="font-semibold">1,200+</strong> families and their care teams</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-24 overflow-y-auto">
        <div className="max-w-md w-full mx-auto animate-in fade-in duration-300">
          {!isSuccess ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-8">Enter your new password to access your account.</p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
                
                <div>
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input 
                      className="!rounded-full" 
                      placeholder="Enter new password" 
                      type={showPassword ? "text" : "password"}
                      value={password} 
                      onChange={(e: any) => setPassword(e.target.value)} 
                      disabled={isSubmitting}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      className="!rounded-full" 
                      placeholder="Confirm new password" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword} 
                      onChange={(e: any) => setConfirmPassword(e.target.value)} 
                      disabled={isSubmitting}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#0a7a66] hover:bg-[#086353] disabled:opacity-70 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Remember your password?{" "}
                  <Link to="/signin" className="text-brand-600 hover:text-brand-700 font-medium">
                    Back to Sign in
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password Reset Successful</h2>
              <p className="text-gray-500 text-sm mb-8">
                Your password has been reset successfully. You will be redirected to the login page in <strong className="text-gray-900">{countdown}</strong> seconds.
              </p>

              <div className="space-y-4">
                <Link
                  to="/signin"
                  className="w-full py-3 px-4 bg-[#0a7a66] hover:bg-[#086353] text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Go to Login Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
