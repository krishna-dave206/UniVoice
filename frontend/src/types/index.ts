export type UserRole = "student" | "faculty" | "admin";

export type PostStatus =
  | "open"
  | "in_review"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected";

export type PostPriority = "low" | "medium" | "high";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  gender: string;
  department: string;
  yearOfStudy: number;
  createdAt: string;
}

export interface User extends AuthUser {
  userId: string;
}

export interface ValidityScore {
  _id?: string;
  postId: string;
  score: number;      
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  calculatedAt: string;
}

export interface Post {
  _id: string;
  postId: string;
  userId: string;
  assignedTo?: string;
  title: string;
  body?: string;
  category: string;
  status: PostStatus;
  priority: PostPriority;
  tags: string[];
  upvotes: number;
  downvotes: number;
  validityScoreData?: ValidityScore;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  /** Alias */
  commentId: string;
  complaintId: string;
  userId: string;
  body: string;
  isInternal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  /** Alias */
  announcementId: string;
  userId: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}