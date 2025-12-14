import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Toaster } from '@/components/ui/toaster';
import { useApi } from '@/hooks/useApi';
import { useUser, UserSession } from '@/contexts/UserContext';

const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser, user, hydrated } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { execute, isLoading } = useApi();

  // Redirect if already logged in
  useEffect(() => {
    if (hydrated && user?.token) {
      // If user has token, redirect to patient page or patient-selection
      const patientId = user.user_id;
      if (patientId) {
        router.push(`/patient?patientId=${patientId}`);
      } else {
        router.push('/patient-selection');
      }
    }
  }, [hydrated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await execute<any>('post', '/v1/login/patient', {
        email,
        password
      }, {
        onSuccess: (data) => {
          // Ensure the response has all required fields for UserSession
          const userSession = {
            token: data.token || data.access_token || '',
            user_id: data.user_id || data.id || data.patient_id || 0,
            business_date: data.business_date || new Date().toISOString().split('T')[0],
            user_name: data.user_name || data.name || data.patient_name || email,
            logo: data.logo || data.photo || '',
            organisation: data.organisation || null,
            role: data.role || { name: 'Patient', code: 'PATIENT' },
            department_id: data.department_id || 0,
            photo: data.photo || data.logo || '',
          };
          
          // Validate token exists
          if (!userSession.token) {
            toast({
              title: "Login Error",
              description: "Token not received from server",
              variant: "destructive",
            });
            return;
          }
          
          setUser(userSession);
          toast({
            title: "Login successful!",
            description: "Redirecting...",
          });
          // Get patient ID from response (could be patient_id, id, or user_id)
          const patientId = data.patient_id || data.id || data.user_id;
          if (patientId) {
            router.push(`/patient?patientId=${patientId}`);
          } else {
            // Fallback to patient-selection if no patient ID found
            router.push('/patient-selection');
          }
        },
        showSuccessToast: false,
      });
    } catch (error) {
      // Error is handled by the centralized error handler
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-medical-lightBlue p-4">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-medical-darkGray mb-2">
               Client Login
              </h1>
              <p className="text-medical-text">Sign in to your account</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-medical-darkGray mb-1">
                    Client ID / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 py-2 sm:text-sm border border-gray-200 rounded-md focus:ring-medical-teal focus:border-medical-teal"
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-medical-darkGray mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 py-2 sm:text-sm border border-gray-200 rounded-md focus:ring-medical-teal focus:border-medical-teal"
                    />
                  </div>
                </div>
                
                
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full primary-button py-3 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-medical-text">
                Don't have an account?{' '}
                <a href="#" className="text-medical-blue hover:text-medical-teal transition-colors">
                  Contact your administrator
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default LoginPage;


