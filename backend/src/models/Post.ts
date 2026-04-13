import mongoose, { Schema, Document, Model } from "mongoose";

export enum PostStatus {
  OPEN        = "open",
  IN_REVIEW   = "in_review",
  IN_PROGRESS = "in_progress",
  RESOLVED    = "resolved",
  CLOSED      = "closed",
  REJECTED    = "rejected",
}

export enum PostPriority {
  LOW    = "low",
  MEDIUM = "medium",
  HIGH   = "high",
}

// Interface 
export interface IPost extends Document {
  userId:        mongoose.Types.ObjectId;
  assignedTo?:   mongoose.Types.ObjectId;
  title:         string;
  body?:         string;
  category:      string;
  status:        PostStatus;
  priority:      PostPriority;
  tags:          string[];
  upvotes:       number;
  downvotes:     number;
  isAnonymous:   boolean;
  createdAt:     Date;
  updatedAt:     Date;
}

// Schema 
const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.OPEN,
    },
    priority: {
      type: String,
      enum: Object.values(PostPriority),
      default: PostPriority.MEDIUM,
    },
    tags: {
      type: [String],
      default: [],
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// Indexes 
PostSchema.index({ status: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ userId: 1 });
PostSchema.index({ createdAt: -1 });

// Model 
export const PostModel: Model<IPost> = mongoose.model<IPost>("Post", PostSchema);