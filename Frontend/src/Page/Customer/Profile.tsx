import React, { useState } from "react";
import { useCustomerAuth } from "@/Components/Context/AuthContext";
import { customerApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/UnifiedContext";

const CustomerProfile: React.FC = () => {
  const { user, logout } = useAuth();

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  if (!user) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  const handlePasswordUpdate = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      return toast.error("Please fill all fields");
    }

    if (newPass !== confirmPass) {
      return toast.error("New passwords do not match");
    }

    try {
      setLoading(true);

      await customerApi.updatepassword({
        id: user.id,
        oldPass,
        newPass,
      });

      toast.success("Password updated successfully");

      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 rounded-xl bg-white border border-gray-300 shadow-sm">

      <h1 className="text-3xl font-bold text-black mb-6 text-center">
        Customer Profile
      </h1>


      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">Account Details</h2>

        <div className="space-y-2 text-gray-700">
          <p><strong className="text-black">ID:</strong> {user.id}</p>
          <p><strong className="text-black">Username:</strong> {user.username}</p>
          <p><strong className="text-black">Account Number:</strong> {user.username}</p>
          <p><strong className="text-black">Name:</strong> {user.name}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-black mb-3">Update Password</h2>

      <div className="space-y-4">
        <input
          type="password"
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Current Password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
        />

        <input
          type="password"
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />

        <input
          type="password"
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Confirm New Password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />

        <button
          onClick={handlePasswordUpdate}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>


      <button
        onClick={() => {
    logout();       
    navigate("/");  
  }}
        className="mt-8 w-full bg-gray-200 text-black py-3 rounded-lg font-medium hover:bg-gray-300 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default CustomerProfile;
