import { PostModel, IPost, PostStatus, PostPriority } from "../models/Post";
import { ValidityScoreModel } from "../models/ValidityScore";
import mongoose from "mongoose";

interface CreatePostDTO {
  userId: string;
  title: string;
  body?: string;
  category: string;
  priority?: PostPriority;
  tags?: string[];
  isAnonymous?: boolean;
}

interface UpdatePostDTO {
  title?:    string;
  body?:     string;
  category?: string;
  priority?: PostPriority;
  tags?:     string[];
}

const voteTracker = new Map<string, Set<string>>(); 

export class PostService {

  // CREATE

  async createPost(dto: CreatePostDTO): Promise<IPost> {
    const post = await PostModel.create({
      userId:      new mongoose.Types.ObjectId(dto.userId),
      title:       dto.title,
      body:        dto.body,
      category:    dto.category,
      priority:    dto.priority ?? PostPriority.MEDIUM,
      tags:        dto.tags ?? [],
      isAnonymous: dto.isAnonymous ?? false,
      status:      PostStatus.OPEN,
    });

    // Create a blank validity score document linked to this post
    await ValidityScoreModel.create({ postId: post._id });

    return post;
  }

  // READ

  async getPostById(postId: string): Promise<IPost> {
    const post = await PostModel.findById(postId);
    if (!post) throw new Error(`Post ${postId} not found`);
    return post;
  }

  async getAllPosts(): Promise<IPost[]> {
    return PostModel.find().sort({ createdAt: -1 });
  }

  async getPostsByUser(userId: string): Promise<IPost[]> {
    return PostModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getPostsByCategory(category: string): Promise<IPost[]> {
    return PostModel.find({ category: new RegExp(`^${category}$`, "i") });
  }

  async getPostsByStatus(status: PostStatus): Promise<IPost[]> {
    return PostModel.find({ status });
  }

  async getValidityScore(postId: string) {
    return ValidityScoreModel.findOne({ postId });
  }

  // UPDATE

  async updatePost(postId: string, dto: UpdatePostDTO, requestingUserId: string): Promise<IPost> {
    const post = await this.getPostById(postId);

    if (post.userId.toString() !== requestingUserId) {
      throw new Error("Unauthorized: you can only edit your own posts");
    }

    const updated = await PostModel.findByIdAndUpdate(
      postId,
      { $set: dto },
      { new: true, runValidators: true }
    );

    if (!updated) throw new Error(`Post ${postId} not found`);
    return updated;
  }

  async changeStatus(postId: string, newStatus: PostStatus): Promise<IPost> {
    const updated = await PostModel.findByIdAndUpdate(
      postId,
      { $set: { status: newStatus } },
      { new: true }
    );
    if (!updated) throw new Error(`Post ${postId} not found`);
    return updated;
  }

  async assignPost(postId: string, staffId: string): Promise<IPost> {
    const updated = await PostModel.findByIdAndUpdate(
      postId,
      {
        $set: {
          assignedTo: new mongoose.Types.ObjectId(staffId),
          status: PostStatus.IN_PROGRESS,
        },
      },
      { new: true }
    );
    if (!updated) throw new Error(`Post ${postId} not found`);
    return updated;
  }

  // VOTES 

  async upvote(postId: string, userId: string) {
    const voters = voteTracker.get(postId) ?? new Set<string>();
    if (voters.has(userId)) throw new Error("You have already voted on this post");

    const post = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!post) throw new Error(`Post ${postId} not found`);

    voters.add(userId);
    voteTracker.set(postId, voters);

    const vs = await this.refreshValidityScore(post);
    return { post, validityScore: vs };
  }

  async downvote(postId: string, userId: string) {
    const voters = voteTracker.get(postId) ?? new Set<string>();
    if (voters.has(userId)) throw new Error("You have already voted on this post");

    const post = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { downvotes: 1 } },
      { new: true }
    );
    if (!post) throw new Error(`Post ${postId} not found`);

    voters.add(userId);
    voteTracker.set(postId, voters);

    const vs = await this.refreshValidityScore(post);
    return { post, validityScore: vs };
  }

  private async refreshValidityScore(post: IPost) {
    const vs = await ValidityScoreModel.findOne({ postId: post._id });
    if (!vs) throw new Error("ValidityScore not found for post");
    await vs.recalculate(post.upvotes, post.downvotes);
    return vs;
  }

  // DELETE 

  async deletePost(postId: string, requestingUserId: string, isAdmin: boolean): Promise<void> {
    const post = await this.getPostById(postId);

    if (!isAdmin && post.userId.toString() !== requestingUserId) {
      throw new Error("Unauthorized: cannot delete another user's post");
    }

    await PostModel.findByIdAndDelete(postId);
    await ValidityScoreModel.deleteOne({ postId });
    voteTracker.delete(postId);
  }
}

export const postService = new PostService();