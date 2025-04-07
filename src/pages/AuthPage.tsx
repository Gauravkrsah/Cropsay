
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, User, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

// Form validation schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().optional(),
});

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });
  
  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      if (isSignIn) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "You have successfully logged in",
        });
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName || '',
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "Your account has been created successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-[#10141E]">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E2735] flex-col justify-center items-center p-10">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6 text-white">Welcome to Cropsay</h1>
          <p className="text-lg text-gray-300 mb-8">
            The smart farming platform that connects farmers with expert advice, quality products, and a supportive community.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2A3143] p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-400">Expert Advice</h3>
              <p className="text-sm text-gray-400">Connect with agricultural experts for personalized guidance on your crops</p>
            </div>
            <div className="bg-[#2A3143] p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-400">Quality Products</h3>
              <p className="text-sm text-gray-400">Shop for verified seeds, fertilizers, and equipment for your farm</p>
            </div>
            <div className="bg-[#2A3143] p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-400">Community</h3>
              <p className="text-sm text-gray-400">Join a network of farmers sharing knowledge and experiences</p>
            </div>
            <div className="bg-[#2A3143] p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-400">Market Access</h3>
              <p className="text-sm text-gray-400">Sell your produce directly to buyers at fair prices</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="p-0 mb-4 hover:bg-transparent hover:text-green-500"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} className="mr-2" /> Back to Home
            </Button>
            <h2 className="text-2xl font-bold mb-2">
              {isSignIn ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="text-gray-400">
              {isSignIn 
                ? 'Enter your credentials to access your account' 
                : 'Sign up to start using Cropsay'}
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <FormControl>
                          <Input
                            placeholder="Full Name"
                            className="bg-[#1E2735] border-[#2A3143] pl-10 h-12"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          className="bg-[#1E2735] border-[#2A3143] pl-10 h-12"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <FormControl>
                        <Input
                          placeholder="Password"
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
              
              {isSignIn && (
                <div className="text-right">
                  <Button variant="link" className="text-green-500 hover:text-green-400 p-0" asChild>
                    <a href="#forgot-password">Forgot password?</a>
                  </Button>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? 
                  "Processing..." : 
                  isSignIn ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <Button 
                variant="link" 
                className="text-green-500 hover:text-green-400 p-0" 
                onClick={() => setIsSignIn(!isSignIn)}
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
