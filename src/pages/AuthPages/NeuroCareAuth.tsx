import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function NeuroCareAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Parent / Guardian");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicRoles, setDynamicRoles] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "signup" && dynamicRoles.length === 0) {
      axiosClient.get("/role?page=1&limit=10")
        .then((res) => {
          if (res.data && res.data.roles) {
             setDynamicRoles(res.data.roles);
             const parentRole = res.data.roles.find((r: any) => r.name === "Parent/Guardian");
             if (parentRole) {
               setSelectedRoleId(parentRole.id);
             }
          }
        })
        .catch((err) => {
          console.error("Error fetching roles:", err);
        });
    }
  }, [activeTab]);

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    try {
      setLoginError("");
      setIsLoading(true);
      
      const response = await axiosClient.post("/user/login", { email, password });
      
      const userData = response.data.user;
      const tokens = response.data.backendTokens;

      if (userData && tokens?.accessToken) {
         login(userData, tokens);
         toast.success("Logged in successfully!");
         navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.message || "Invalid credentials or server error.";
      setLoginError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!signupName.trim()) {
       setSignupError("Please enter your full name.");
       return;
    }
    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
       setSignupError("Please enter a valid email address.");
       return;
    }
    if (!signupPassword) {
       setSignupError("Please enter a password.");
       return;
    }
    if (signupPassword.length < 8) {
       setSignupError("Password must be at least 8 characters.");
       return;
    }
    if (signupPassword !== signupConfirmPassword) {
       setSignupError("Passwords do not match.");
       return;
    }
    if (!selectedRoleId && dynamicRoles.length > 0) {
       setSignupError("Please select a role.");
       return;
    }
    if (!isChecked) {
       setSignupError("Please agree to the Terms of Service and Privacy Policy.");
       return;
    }

    setIsLoading(true);
    setSignupError("");

    try {
      const payload = {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        roleId: selectedRoleId
      };

      const response = await axiosClient.post("/user/register", payload);
      if (response.data?.status === "Ok" || response.status === 201 || response.status === 200) {
        toast.success(response.data?.message || "User registered successfully");
        setActiveTab("signin");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setSignupError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { label: "Parent / Guardian", icon: "👨‍👩‍👦" },
    { label: "Pediatrician", icon: "👨‍⚕️" },
    { label: "Dev. Psychologist", icon: "🧠" },
    { label: "Therapist (OT/ST/ABA)", icon: "🤝" },
    { label: "Functional / Biomedical", icon: "🧬" },
    { label: "Ayurvedic Practitioner", icon: "🌿" },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <Toaster position="top-center" />
      {/* Left Panel */}
      <div className={`hidden lg:flex w-[45%] flex-col justify-between bg-[#0a7a66] px-12 ${activeTab === 'signin' ? 'py-12' : 'py-16'} text-white overflow-y-auto`}>
        <div>
          <div className={`flex items-center gap-3 ${activeTab === "signin" ? "" : "mb-16"}`}>
            {/* Simple logo placeholder */}
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden relative">
               <div className="absolute w-full h-full bg-orange-400 rotate-45 transform translate-x-1/2"></div>
            </div>
            <span className="text-xl font-semibold">NeuroCare</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-6">
            Every provider.<br />
            One child's story.
          </h1>

          <p className="text-lg text-white/90 mb-12 max-w-md">
            The care coordination platform built for neurodivergent children and the teams who support them — from pediatricians to Ayurvedic practitioners.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4">
              <span className="text-xl">🧬</span>
              <div>
                <h3 className="font-medium text-white mb-1">Unified Health Records</h3>
                <p className="text-white/80 text-sm">Diagnoses, genetic testing, labs, and medications — all in one place.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-xl">🎯</span>
              <div>
                <h3 className="font-medium text-white mb-1">IEP Goal Tracking</h3>
                <p className="text-white/80 text-sm">Psychologists set goals, therapists track progress — every session logged.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-xl">💬</span>
              <div>
                <h3 className="font-medium text-white mb-1">Provider Messaging</h3>
                <p className="text-white/80 text-sm">Secure, child-scoped conversations between every member of the care team.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-xl">👨‍👩‍👦</span>
              <div>
                <h3 className="font-medium text-white mb-1">Parent Summaries</h3>
                <p className="text-white/80 text-sm">Parents see what matters — clear, jargon-free progress updates.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`pt-8 border-t border-white/20 flex items-center gap-3 ${activeTab === 'signin' ? '' : 'mt-16'}`}>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-[#0a7a66]"></div>
            <div className="w-8 h-8 rounded-full bg-purple-300 border-2 border-[#0a7a66]"></div>
            <div className="w-8 h-8 rounded-full bg-pink-300 border-2 border-[#0a7a66]"></div>
            <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-[#0a7a66]"></div>
          </div>
          <span className="text-sm text-white/90">Trusted by <strong className="font-semibold">1,200+</strong> families and their care teams</span>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className={`flex-1 flex flex-col pt-8 px-6 sm:px-12 md:px-24 overflow-y-auto ${activeTab === 'signin' ? 'justify-center' : ''}`}>
        <div className="max-w-md w-full mx-auto">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-full mb-12">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === "signin"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {activeTab === "signin" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-8">Sign in to your NeuroCare account</p>

              <form className="space-y-5">
                {loginError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{loginError}</div>}
                
                <div>
                  <Label>Email</Label>
                  <Input 
                    className="!rounded-full" 
                    placeholder="you@neurocare.in" 
                    value={email} 
                    onChange={(e: any) => setEmail(e.target.value)} 
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      className="!rounded-full"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 size-5" />
                      )}
                    </span>
                  </div>
                  <div className="mt-2 text-right">
                    <Link to="#" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleLogin} 
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#0a7a66] hover:bg-[#086353] disabled:opacity-70 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                  {!isLoading && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.3335 8H12.6668" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 3.33331L12.6667 7.99998L8 12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setActiveTab("signup")} className="text-brand-600 hover:text-brand-700 font-medium">
                    Create account
                  </button>
                </p>
              </form>
            </div>
          )}

          {activeTab === "signup" && (
            <div className="animate-in fade-in duration-300 pb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-500 text-sm mb-6">Join a child's care team on NeuroCare</p>

              <form className="space-y-5">
                {signupError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{signupError}</div>}
                <div>
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {/* 1. Show Dynamic Roles First (Parent/Guardian sorted to top) */}
                    {dynamicRoles.length > 0 && [...dynamicRoles].sort((a, b) => a.name === "Parent/Guardian" ? -1 : (b.name === "Parent/Guardian" ? 1 : 0)).map((role: any) => {
                      const isParent = role.name === "Parent/Guardian";
                      const icon = isParent ? "👨‍👩‍👦" : (role.name === "Therapist" ? "🤝" : "🧑‍⚕️");
                      return (
                      <button
                        key={`dyn-${role.id}`}
                        type="button"
                        onClick={() => isParent && setSelectedRoleId(role.id)}
                        disabled={!isParent}
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-full border transition-all ${
                          selectedRoleId === role.id
                            ? "border-[#0a7a66] bg-[#0a7a66]/5 text-[#0a7a66] font-medium"
                            : "border-gray-200 text-gray-400 opacity-60"
                        } ${!isParent ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <span>{icon}</span>
                        <span className="truncate">{role.name}</span>
                      </button>
                    )})}
                    
                    {/* 2. Show Static Roles After (Just for show, filtering out duplicates if dynamic loaded) */}
                    {roles
                      .filter(role => {
                         if (dynamicRoles.length > 0) {
                           if (role.label === "Parent / Guardian" || role.label.includes("Therapist")) return false;
                         }
                         return true;
                      })
                      .map((role) => {
                      const isParent = role.label === "Parent / Guardian";
                      return (
                      <button
                        key={`static-${role.label}`}
                        type="button"
                        onClick={() => {
                          if (dynamicRoles.length === 0 && isParent) {
                            setSelectedRole(role.label);
                          }
                        }}
                        disabled={dynamicRoles.length > 0 ? true : !isParent}
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-full border transition-all ${
                          (selectedRole === role.label && dynamicRoles.length === 0)
                            ? "border-[#0a7a66] bg-[#0a7a66]/5 text-[#0a7a66] font-medium"
                            : "border-gray-200 text-gray-400 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <span>{role.icon}</span>
                        <span className="truncate">{role.label}</span>
                      </button>
                    )})}
                  </div>
                </div>

                <div>
                  <Label>Full name</Label>
                  <Input className="!rounded-full" placeholder="Dr. Reena Kapoor" value={signupName} onChange={(e: any) => setSignupName(e.target.value)} />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input className="!rounded-full" placeholder="you@email.com" value={signupEmail} onChange={(e: any) => setSignupEmail(e.target.value)} />
                </div>

                {/* <div>
                  <Label>Practice / Organization</Label>
                  <p className="text-xs text-gray-500 mb-1">Where you see patients or provide therapy</p>
                  <Input className="!rounded-full" placeholder="Child Mind Institute, Chennai" />
                </div> */}

                <div>
                  <Label>Password</Label>
                  <p className="text-xs text-gray-500 mb-1">Minimum 8 characters</p>
                  <div className="relative">
                    <Input
                      className="!rounded-full"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e: any) => setSignupPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Confirm password</Label>
                  <div className="relative">
                    <Input
                      className="!rounded-full"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e: any) => setSignupConfirmPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <div className="pt-1">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    I agree to NeuroCare's <Link to="#" className="text-[#0a7a66] hover:underline">Terms of Service</Link> and <Link to="#" className="text-[#0a7a66] hover:underline">Privacy Policy</Link>. Patient data is handled in compliance with HIPAA and applicable regulations.
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#0a7a66] hover:bg-[#086353] disabled:opacity-70 text-white rounded-full font-medium transition-colors mt-2"
                >
                  {isLoading ? "Creating Account..." : "Create NeuroCare Account"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setActiveTab("signin")} className="text-brand-600 hover:text-brand-700 font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
