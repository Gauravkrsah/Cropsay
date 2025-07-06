import React, { useState } from 'react';
import { X, MessageCircle, Phone, Mail, Send, Facebook, Twitter, Instagram, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface SupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportPopup: React.FC<SupportPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/9779814789009', '_blank');
  };

  const handlePhoneCall = () => {
    window.open('tel:+9779814789009', '_blank');
  };

  const handleEmailSupport = () => {
    window.open('mailto:support@cropsay.com', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[90%] mx-auto bg-[#10141E] text-gray-100 border border-[#2A3143] max-h-[85vh] p-5">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-green-400" />
            Contact Support
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Get help from our support team
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="space-y-4">
            {/* Contact Information */}
            <div className="bg-[#1E2735] rounded-lg p-3 border border-[#2A3143]">
              <h3 className="font-semibold mb-2 text-green-400 text-sm">CropsayAI Contact Info</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3 w-3 text-blue-400 flex-shrink-0" />
                  <span>+977 9814789009</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span>support@cropsay.com</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-red-400 flex-shrink-0" />
                  <span>Kathmandu, Nepal</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                  <span>24/7 Support Available</span>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="flex gap-1.5 mt-3">
                <Button
                  onClick={handleWhatsAppSupport}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  WhatsApp
                </Button>

                <Button
                  onClick={handlePhoneCall}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-8 text-xs"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>

                <Button
                  onClick={handleEmailSupport}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 h-8 text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-[#1E2735] rounded-lg p-3 border border-[#2A3143]">
              <h3 className="font-semibold mb-2 text-green-400 text-sm">Follow Us</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-8 w-8 p-0"
                  onClick={() => window.open('https://facebook.com/cropsayai', '_blank')}
                >
                  <Facebook className="h-3 w-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 h-8 w-8 p-0"
                  onClick={() => window.open('https://twitter.com/cropsayai', '_blank')}
                >
                  <Twitter className="h-3 w-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 h-8 w-8 p-0"
                  onClick={() => window.open('https://instagram.com/cropsayai', '_blank')}
                >
                  <Instagram className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#1E2735] rounded-lg p-3 border border-[#2A3143]">
              <h3 className="font-semibold mb-2 text-green-400 text-sm">Send us a Message</h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="name" className="text-xs text-gray-300">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-[#10141E] border-[#2A3143] text-white h-8 text-xs"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-[#10141E] border-[#2A3143] text-white h-8 text-xs"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-xs text-gray-300">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="bg-[#10141E] border-[#2A3143] text-white h-8 text-xs"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-xs text-gray-300">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-[#10141E] border-[#2A3143] text-white min-h-[60px] text-xs"
                    placeholder="Describe your issue or question..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-1" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 mt-3 border-t border-[#2A3143]">
          <Button onClick={onClose} variant="outline" className="flex-1 h-9 text-sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
