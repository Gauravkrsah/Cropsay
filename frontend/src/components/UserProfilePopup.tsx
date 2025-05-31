import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const UserProfilePopup = () => {
  const { user, profile, showProfileOnFirstLogin, setShowProfileOnFirstLogin, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    address: '',
  });
  
  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) return;
    
    // Validate required fields
    if (!formData.phone || !formData.address) {
      return; // Don't proceed if required fields are empty
    }
    
    const success = await updateProfile(formData);
    if (success) {
      setShowProfileOnFirstLogin(false);
    }
  };
  
  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <Dialog open={showProfileOnFirstLogin} onOpenChange={setShowProfileOnFirstLogin}>
      <DialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>Please provide your details to enhance your shopping experience</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="w-20 h-20 border border-[#2A3143]">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="bg-green-600 text-white text-2xl">{userInitials}</AvatarFallback>
          </Avatar>
          
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_full_name">Full Name</Label>
              <Input
                id="profile_full_name"
                type="text"
                className="bg-[#1E2735] border-[#2A3143] text-white"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile_phone" className="flex items-center">
                Phone Number <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="profile_phone"
                type="tel"
                className={`bg-[#1E2735] border-[#2A3143] text-white ${!formData.phone ? 'border-red-500' : ''}`}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
                required
              />
              {!formData.phone && (
                <p className="text-red-500 text-xs mt-1">Phone number is required for delivery</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile_address" className="flex items-center">
                Address <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="profile_address"
                className={`bg-[#1E2735] border-[#2A3143] text-white min-h-[80px] ${!formData.address ? 'border-red-500' : ''}`}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter your delivery address"
                required
              />
              {!formData.address && (
                <p className="text-red-500 text-xs mt-1">Address is required for delivery</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile_bio">Bio (Optional)</Label>
              <Textarea
                id="profile_bio"
                className="bg-[#1E2735] border-[#2A3143] text-white min-h-[60px]"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself (optional)"
              />
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 italic">
          <p>Your information will be used to pre-fill checkout forms for a smoother shopping experience.</p>
        </div>
        
        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowProfileOnFirstLogin(false)}
            className="w-full sm:w-auto"
          >
            Skip for Now
          </Button>
          <Button 
            variant="default"
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
            onClick={handleSubmit}
            disabled={!formData.phone || !formData.address}
          >
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
