import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [status, setStatus] = useState("Verifying invitation...");
  const hasProcessed = useRef(false);

  const acceptInviteMutation = useMutation({
    mutationFn: async (tokenData: { token: string }) => {
      const response = await axiosClient.post("/invitation/accept", { token: tokenData.token });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error("Invitation process error:", error);
      toast.error(error.response?.data?.message || "Failed to process invitation.");
      navigate(isAuthenticated ? "/dashboard" : "/signin");
    }
  });

  const checkEmailMutation = useMutation({
    mutationFn: async (emailData: { email: string }) => {
      const response = await axiosClient.post("/user/check-email", { email: emailData.email });
      return response;
    },
    onSuccess: (checkRes) => {
      if (checkRes.data && checkRes.data.exists === false) {
          navigate(`/signin?tab=signup&token=${token}&email=${encodeURIComponent(email!)}`);
      } else {
          navigate(`/signin?tab=signin&token=${token}&email=${encodeURIComponent(email!)}`);
      }
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 404) {
         navigate(`/signin?tab=signup&token=${token}&email=${encodeURIComponent(email!)}`);
      } else {
         navigate(`/signin?tab=signup&token=${token}&email=${encodeURIComponent(email!)}`);
      }
    }
  });

  useEffect(() => {
    if (hasProcessed.current) return;

    if (!token) {
      hasProcessed.current = true;
      toast.error("Invalid or missing invitation token.");
      navigate("/signin");
      return;
    }

    if (!email) {
      hasProcessed.current = true;
      navigate(`/signin?token=${token}`);
      return;
    }

    hasProcessed.current = true;

    if (isAuthenticated) {
      if (user?.email && user.email.toLowerCase() !== email.toLowerCase()) {
        toast.error(`This invite is for ${email}. Please log out and sign in with the correct account.`);
        navigate("/dashboard");
        return;
      }
      
      setStatus("Accepting invitation...");
      acceptInviteMutation.mutate({ token });
    } else {
      setStatus("Checking user details...");
      checkEmailMutation.mutate({ email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email, isAuthenticated, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#0a7a66] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <h2 className="text-xl font-medium text-gray-700">{status}</h2>
      </div>
    </div>
  );
}
