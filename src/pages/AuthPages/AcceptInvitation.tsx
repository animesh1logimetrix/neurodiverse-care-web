import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
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

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing invitation token.");
      navigate("/signin");
      return;
    }

    if (!email) {
      // If email is somehow missing, just redirect to signin with token
      navigate(`/signin?token=${token}`);
      return;
    }

    const checkAndProcessInvitation = async () => {
      try {
        if (isAuthenticated) {
          // User is logged in. 
          if (user?.email && user.email.toLowerCase() !== email.toLowerCase()) {
            toast.error(`This invite is for ${email}. Please log out and sign in with the correct account.`);
            navigate("/dashboard");
            return;
          }
          
          setStatus("Accepting invitation...");
          await axiosClient.post("/invitation/accept", { token });
          toast.success("Invitation accepted successfully!");
          navigate("/dashboard");
        } else {
          // User is not logged in, check if email exists in system
          setStatus("Checking user details...");
          
          try {
             // Assuming the backend returns 201/200 if check is successful.
             // Some backends return 404 or a boolean. We try to handle both.
             const checkRes = await axiosClient.post("/user/check-email", { email });
             
             if (checkRes.data && checkRes.data.exists === false) {
                 navigate(`/signin?tab=signup&token=${token}&email=${encodeURIComponent(email)}`);
             } else {
                 navigate(`/signin?tab=signin&token=${token}&email=${encodeURIComponent(email)}`);
             }
          } catch (error: any) {
             if (error.response && error.response.status === 404) {
                navigate(`/signin?tab=signup&token=${token}&email=${encodeURIComponent(email)}`);
             } else {
                // Default to signup if check fails
                navigate(`/signin?tab=signup&token=${token}&email=${encodeURIComponent(email)}`);
             }
          }
        }
      } catch (error: any) {
        console.error("Invitation process error:", error);
        toast.error(error.response?.data?.message || "Failed to process invitation.");
        navigate(isAuthenticated ? "/dashboard" : "/signin");
      }
    };

    checkAndProcessInvitation();
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
