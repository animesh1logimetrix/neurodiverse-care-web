import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import CustomModal from "../components/ui/modal/CustomModal";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import { EyeCloseIcon, EyeIcon } from "../icons";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";

export default function UserProfiles() {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<{ oldPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const handleClose = () => {
    setIsChangePasswordModalOpen(false);
    resetForm();
  };

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => axiosClient.post("/user/change-password", data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      handleClose();
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Failed to change password. Please try again later.";
      toast.error(errMsg);
    },
  });

  const handleSubmit = async () => {
    let hasError = false;
    const newErrors: any = {};

    if (!oldPassword) {
      newErrors.oldPassword = "Required";
      hasError = true;
    }
    if (!newPassword) {
      newErrors.newPassword = "Required";
      hasError = true;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Required";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (newPassword && !passwordRegex.test(newPassword)) {
      newErrors.newPassword = "Password must be at least 8 chars with an uppercase, lowercase, number, and special character.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return false; // prevent modal from closing
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword,
        newPassword,
      });
      return true; // allows modal to be handled gracefully (though onSuccess handles close)
    } catch {
      return false;
    }
  };

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-5 flex items-center justify-between lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Profile
          </h3>
          <button
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none"
          >
            Change Password
          </button>
        </div>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>

      <CustomModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleClose}
        title="Change Password"
        size="sm"
        onSubmit={handleSubmit}
        submitText="Change Password"
      >
        <div className="space-y-4 pt-2">
          <div>
            <Label>Current Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e: any) => {
                  setOldPassword(e.target.value);
                  if (errors.oldPassword) setErrors({ ...errors, oldPassword: undefined });
                }}
              />
              <span
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showOldPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
            {errors.oldPassword && <p className="mt-1 text-xs text-red-500">{errors.oldPassword}</p>}
          </div>

          <div>
            <Label>New Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e: any) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                }}
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showNewPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
            {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
          </div>

          <div>
            <Label>Confirm New Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e: any) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
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
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>
      </CustomModal>
    </>
  );
}
