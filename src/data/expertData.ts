export interface Expert {
  id: string;
  name: string;
  role: string;
  experience: string;
  languages: string[];
  image?: string;
  rating: number;
}

export const experts: Expert[] = [
  {
    id: "1",
    name: "Dr. Anya Sharma",
    role: "Lead Agronomist",
    experience: "15+ years",
    languages: ["English", "Hindi"],
    image: "/avatars/anya.jpg", 
    rating: 4.9,
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    role: "Soil Health Specialist",
    experience: "12+ years",
    languages: ["English", "Punjabi"],
    image: "/avatars/rajesh.jpg",
    rating: 4.7,
  },
  {
    id: "3",
    name: "Priya Singh",
    role: "Pest Control Advisor",
    experience: "10+ years",
    languages: ["English", "Marathi"],
    rating: 4.8,
  },
  {
    id: "4",
    name: "Dr. Sarah Chen",
    role: "Senior Agronomist",
    experience: "14+ years",
    languages: ["English", "Mandarin", "Hindi"],
    image: "/assets/experts/sarah-chen.png",
    rating: 4.9,
  },
  {
    id: "5",
    name: "Amit Patel",
    role: "Crop Disease Specialist",
    experience: "8+ years",
    languages: ["English", "Gujarati", "Hindi"],
    rating: 4.6,
  },
  {
    id: "6",
    name: "Dr. Vijay Reddy",
    role: "Soil Scientist",
    experience: "18+ years",
    languages: ["English", "Telugu", "Tamil"],
    image: "/avatars/vijay.jpg",
    rating: 4.8,
  }
];
