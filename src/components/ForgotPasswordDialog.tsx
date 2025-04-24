import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, AlertCircle, CheckCircle, X } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordDialog = ({ isOpen, onClose }: ForgotPasswordDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Request password reset email from Supabase
      // Create the full URL for the reset page
      const resetUrl = `${window.location.origin}/reset-password`;
      console.log('Reset URL:', resetUrl);
      
      // Send the reset password email
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: resetUrl,
      });
      
      if (error) throw error;
      
      // Show success state
      setIsSuccess(true);
      
      toast({
        title: "Reset email sent",
        description: "Check your email for a password reset link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    // Reset form state when dialog is closed
    form.reset();
    setIsSuccess(false);
    onClose();
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-[#1E2735] text-white border-[#2A3143]">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl">Reset your password</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Check your email</h3>
            <p className="text-gray-400 mb-4">
              We've sent a password reset link to your email address.
              Please check your inbox and follow the instructions.
            </p>
            <Button onClick={handleClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          className="bg-[#10141E] border-[#2A3143] pl-10 h-12"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-[#2A3143] p-3 rounded-md flex items-start">
                <AlertCircle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-sm text-gray-300">
                  You'll receive an email with a link to reset your password. 
                  The link will expire after 24 hours.
                </p>
              </div>
              
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-[#2A3143] text-white hover:bg-[#2A3143]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;