export type ProblemCategory = 
  | 'Electricity'
  | 'Water'
  | 'Cleanliness'
  | 'Internet'
  | 'Classroom';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  author: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: ProblemCategory;
  description: string;
  location: string;
  specificArea?: string;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  reportedAt: string;
  reportedBy: string;
  studentId?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  assignedStaff?: string;
  resolutionNote?: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
}

export type UserRole = 'student' | 'facilities_staff';
