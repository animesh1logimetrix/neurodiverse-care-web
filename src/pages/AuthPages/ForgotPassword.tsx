import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      
      await axiosClient.post("/user/forgot-password", { email });
      
      setIsSuccess(true);
      setCountdown(30);
      toast.success("Password reset link sent to your email.");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      const errMsg = err.response?.data?.message || "Failed to process request. Please try again later.";
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
            <img
              className="w-8 h-8 rounded-md"
              src="/images/logo/theraverse-logo.jpg"
              alt="Logo"
            />
            <span className="text-xl font-semibold">NeuroCare</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-6">
            Recover your account.
          </h1>

          <p className="text-lg text-white/90 mb-12 max-w-md">
            We will help you regain access to your NeuroCare account so you can continue coordinating care.
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forgot password?</h2>
              <p className="text-gray-500 text-sm mb-8">No worries, we'll send you reset instructions.</p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
                
                <div>
                  <Label>Email address</Label>
                  <Input 
                    className="!rounded-full" 
                    placeholder="you@neurocare.in" 
                    type="email"
                    value={email} 
                    onChange={(e: any) => setEmail(e.target.value)} 
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#0a7a66] hover:bg-[#086353] disabled:opacity-70 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? "Sending Reset Link..." : "Reset Password"}
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-8">
                We've sent a password reset link to <strong className="text-gray-900">{email}</strong>. Please check your inbox and spam folder.
              </p>

              {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded mb-6">{error}</div>}

              <div className="space-y-4">
                <Link
                  to="/signin"
                  className="w-full py-3 px-4 bg-[#0a7a66] hover:bg-[#086353] text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Back to Login
                </Link>
                
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={countdown > 0 || isSubmitting}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-medium transition-colors"
                >
                  {isSubmitting ? "Sending..." : countdown > 0 ? `Resend Email (${countdown}s)` : "Resend Email"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
