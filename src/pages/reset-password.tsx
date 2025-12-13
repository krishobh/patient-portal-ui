import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import ProtectedLayout from '@/layouts/ProtectedLayout';
import { useUser } from '@/contexts/UserContext';
import { useApi } from '@/hooks/useApi';

const ResetPassword = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { execute, isLoading } = useApi();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (!user?.user_id || !user?.token) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive"
      });
      return;
    }

    try {
      await execute<any>(
        'put',
        `/v1/consultants/${user.user_id}`,
        {
          password: newPassword
        },
        {
          onSuccess: undefined,
          onError: undefined,
          showSuccessToast: true,
          successMessage: "Password has been reset successfully",
        },
        { Authorization: `Bearer ${user.token}` }
      );
      
      router.back();
    } catch (error) {
      // Error is handled by the centralized error handler in useApi
    }
  };

  return (
    <div className="min-h-screen bg-medical-lightBlue/10">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-medical-darkGray" />
            </button>
            <h1 className="text-xl font-semibold text-medical-darkGray">Reset Password</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-medical-darkGray mb-6 text-center">
            Reset Your Password
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-medical-darkGray mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-medical-darkGray mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Submit'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <ProtectedLayout>
      <ResetPassword />
    </ProtectedLayout>
  );
}
