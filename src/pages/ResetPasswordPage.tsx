import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

// Form validation schema
const formSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  // Check if we have a valid reset token in the URL
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // Check if we have a valid session from the password reset link
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        // If no session or no access token, the reset link is invalid
        if (!data.session) {
  
          console.log('No active session found');
          setError('Invalid or expired password reset link. Please request a new one.');
        }
      } catch (error: any) {
        console.error('Error checking reset token:', error);
        setError('Invalid or expired password reset link. Please request a new one.');
      }

    };
    checkResetToken();
  }, []);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) throw error;
      
      // Show success state
      setIsSuccess(true);
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset",
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
      console.error('Error resetting password:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-[#10141E]">
      <div className="w-full flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="p-0 mb-4 hover:bg-transparent hover:text-green-500"
              onClick={() => navigate('/auth')}
            >
              <ArrowLeft size={20} className="mr-2" /> Back to Login
            </Button>
            <h2 className="text-2xl font-bold mb-2">Reset your password</h2>
            <p className="text-gray-400">
              Create a new password for your account
            </p>
          </div>
          
          {error ? (
            <div className="bg-red-900/20 border border-red-800 p-4 rounded-md mb-6">
              <p className="text-red-400">{error}</p>
              <Button 
                className="mt-4 bg-green-500 hover:bg-green-600"
                onClick={() => navigate('/auth')}
              >
                Return to Login
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="py-6 flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Password Reset Successful</h3>
              <p className="text-gray-400 mb-4">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <Button 
                onClick={() => navigate('/auth')} 
                className="mt-2 bg-green-500 hover:bg-green-600"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <FormControl>
                          <Input
                            placeholder="New Password"
                            type={showPassword ? "text" : "password"}
                            className="bg-[#1E2735] border-[#2A3143] pl-10 pr-10 h-12"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <FormControl>
                          <Input
                            placeholder="Confirm New Password"
                            type={showConfirmPassword ? "text" : "password"}
                            className="bg-[#1E2735] border-[#2A3143] pl-10 pr-10 h-12"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-500 hover:bg-green-600 h-12 text-base font-medium mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;