export type UserRole = 'client' | 'freelancer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  company?: string;
  title?: string;
  avatar: string; // SVG or Lucide descriptor/icon name
  bio: string;
  rating: number;
  completedJobs: number;
}

export interface JobPost {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  tags: string[];
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Proposal {
  id: string;
  jobPostId: string;
  freelancerId: string;
  bidAmount: number;
  coverLetter: string;
  estimatedDays: number;
  status: 'pending' | 'accepted' | 'declined';
  freelancer?: User; // Joined freelancer info
  jobTitle?: string; // Joined job info
}

export interface ChatRoom {
  id: string;
  clientId: string;
  freelancerId: string;
  jobPostId?: string;
  jobTitle?: string;
  clientName: string;
  freelancerName: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  text: string;
  attachments?: { name: string; url: string; size?: string }[];
  timestamp: string;
}

// Global SSE events we pay attention to for real-time reactivity
export type RealTimeEvent = 
  | { type: 'message_created'; payload: Message }
  | { type: 'job_created'; payload: JobPost }
  | { type: 'job_updated'; payload: JobPost }
  | { type: 'proposal_created'; payload: Proposal }
  | { type: 'proposal_updated'; payload: Proposal }
  | { type: 'room_created'; payload: ChatRoom };
