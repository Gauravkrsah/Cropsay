import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface RatingComponentProps {
  productId: string | number;
  onSubmit?: (productId: string | number, rating: number, review: string) => Promise<void>;
  onCancel?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review?: string | null;
  };
}

const RatingComponent: React.FC<RatingComponentProps> = ({ productId, onSubmit, onCancel, existingReview }) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [review, setReview] = useState<string>(existingReview?.review || '');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating: number) => {
    setHoveredRating(hoveredRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(productId, rating, review);
      }
      toast({
        title: 'Rating Submitted',
        description: 'Thank you for your feedback!',
      });
      if (onCancel) onCancel();
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Could not submit your review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1c232d] rounded-lg p-4 border border-[#2A3143]">
      <h3 className="font-medium text-white mb-4">Rate this product</h3>
      
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <div 
            key={star}
            className="cursor-pointer p-1"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => handleRatingHover(star)}
            onMouseLeave={() => handleRatingHover(0)}
          >
            <Star
              size={24}
              className={(hoveredRating || rating) >= star
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-400"
              }
            />
          </div>
        ))}
      </div>
      
      <textarea
        className="w-full bg-[#232936] border border-[#2A3143] rounded-md p-3 text-white mb-4 min-h-[100px]"
        placeholder="Write your review (optional)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : existingReview ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </div>
    </div>
  );
};

export default RatingComponent;
