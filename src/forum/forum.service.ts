// src/forum/forum.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateTopicDto, UpdateTopicDto } from "./dto/topic.dto";
import { CreateReplyDto, UpdateReplyDto } from "./dto/reply.dto";

@Injectable()
export class ForumService {
  private readonly logger = new Logger(ForumService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // ==================== CATEGORIES ====================

  async getAllCategories() {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("is_active", true)
      .order("order_number", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch categories: ${error.message}`,
      );
    }

    // Get topic count for each category
    const categoriesWithCounts = await Promise.all(
      (data || []).map(async (category) => {
        const { count } = await supabase
          .from("forum_topics")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);

        return { ...category, topic_count: count || 0 };
      }),
    );

    return categoriesWithCounts;
  }

  async getCategoryById(categoryId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Category not found");
    }

    return data;
  }

  // ==================== TOPICS ====================

  async createTopic(userId: string, createTopicDto: CreateTopicDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Resolve a category: use the one provided, or fall back to the first active category
    let categoryId = createTopicDto.category_id;
    if (!categoryId) {
      const { data: defaultCategory } = await supabase
        .from("forum_categories")
        .select("id")
        .eq("is_active", true)
        .order("order_number", { ascending: true })
        .limit(1)
        .maybeSingle();
      categoryId = defaultCategory?.id;
    }

    if (!categoryId) {
      throw new BadRequestException(
        "No forum category available. Please create a category first.",
      );
    }

    const { data, error } = await supabase
      .from("forum_topics")
      .insert({
        ...createTopicDto,
        category_id: categoryId,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create topic: ${error.message}`);
    }

    return data;
  }

  async getAllTopics(filters?: {
    category_id?: string;
    course_id?: string;
    search?: string;
    sort?: "newest" | "oldest" | "most_replies" | "most_views";
    page?: number;
    limit?: number;
  }) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase.from("forum_topics").select(`
        *,
        user:user_id(id, full_name, email, profile_picture),
        category:category_id(name, slug),
        course:course_id(title, slug),
        last_reply_user:last_reply_user_id(id, full_name)
      `);

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }
    if (filters?.course_id) {
      query = query.eq("course_id", filters.course_id);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`,
      );
    }

    // Sorting
    switch (filters?.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "most_replies":
        query = query.order("reply_count", { ascending: false });
        break;
      case "most_views":
        query = query.order("view_count", { ascending: false });
        break;
      default: // newest
        query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException(`Failed to fetch topics: ${error.message}`);
    }

    return {
      topics: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getTopicById(topicId: string, userId?: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Get topic with basic relations (no required joins)
    const { data: topic, error: topicError } = await supabase
      .from("forum_topics")
      .select(
        `
      *,
      user:user_id(id, full_name, email, profile_picture),
      category:category_id(*),
      course:course_id(id, title, slug),
      last_reply_user:last_reply_user_id(id, full_name)
    `,
      )
      .eq("id", topicId)
      .single();

    if (topicError || !topic) {
      console.error("Topic not found:", topicError);
      throw new NotFoundException("Topic not found");
    }

    // Increment view count - simple update
    const currentViews = topic.view_count || 0;
    await supabase
      .from("forum_topics")
      .update({ view_count: currentViews + 1 })
      .eq("id", topicId);

    // Get all replies for this topic
    const { data: replies } = await supabase
      .from("forum_replies")
      .select(
        `
      *,
      user:user_id(id, full_name, email, profile_picture)
    `,
      )
      .eq("topic_id", topicId)
      .order("created_at", { ascending: true });

    // Check if current user has liked this topic
    let userHasLiked = false;
    if (userId) {
      const { data: like } = await supabase
        .from("forum_likes")
        .select("id")
        .eq("user_id", userId)
        .eq("topic_id", topicId)
        .maybeSingle();
      userHasLiked = !!like;
    }

    return {
      ...topic,
      user_has_liked: userHasLiked,
      replies: replies || [],
      reply_count: replies?.length || 0,
    };
  }

  async updateTopic(
    topicId: string,
    userId: string,
    updateTopicDto: UpdateTopicDto,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // Check if user owns the topic
    const { data: topic } = await supabase
      .from("forum_topics")
      .select("user_id")
      .eq("id", topicId)
      .single();

    if (!topic) {
      throw new NotFoundException("Topic not found");
    }

    if (topic.user_id !== userId) {
      throw new BadRequestException("You can only update your own topics");
    }

    const { data, error } = await supabase
      .from("forum_topics")
      .update({
        ...updateTopicDto,
        updated_at: new Date(),
      })
      .eq("id", topicId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update topic: ${error.message}`);
    }

    return data;
  }

  async deleteTopic(topicId: string, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: topic } = await supabase
      .from("forum_topics")
      .select("user_id")
      .eq("id", topicId)
      .single();

    if (!topic) {
      throw new NotFoundException("Topic not found");
    }

    if (topic.user_id !== userId) {
      throw new BadRequestException("You can only delete your own topics");
    }

    const { error } = await supabase
      .from("forum_topics")
      .delete()
      .eq("id", topicId);

    if (error) {
      throw new BadRequestException(`Failed to delete topic: ${error.message}`);
    }

    return { message: "Topic deleted successfully" };
  }

  async likeTopic(topicId: string, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Check if already liked
    const { data: existing } = await supabase
      .from("forum_likes")
      .select("id")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase.from("forum_likes").delete().eq("id", existing.id);

      await supabase
        .from("forum_topics")
        .update({ like_count: supabase.rpc("decrement", { row_id: topicId }) })
        .eq("id", topicId);

      return { liked: false, message: "Topic unliked" };
    } else {
      // Like
      await supabase.from("forum_likes").insert({
        user_id: userId,
        topic_id: topicId,
      });

      await supabase
        .from("forum_topics")
        .update({ like_count: supabase.rpc("increment", { row_id: topicId }) })
        .eq("id", topicId);

      return { liked: true, message: "Topic liked" };
    }
  }

  async bookmarkTopic(topicId: string, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: existing } = await supabase
      .from("forum_bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .maybeSingle();

    if (existing) {
      // Remove bookmark
      await supabase.from("forum_bookmarks").delete().eq("id", existing.id);
      return { bookmarked: false, message: "Bookmark removed" };
    } else {
      // Add bookmark
      await supabase.from("forum_bookmarks").insert({
        user_id: userId,
        topic_id: topicId,
      });
      return { bookmarked: true, message: "Topic bookmarked" };
    }
  }

  async getUserBookmarks(userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("forum_bookmarks")
      .select(
        `
        topic:topic_id(*,
          user:user_id(id, full_name),
          category:category_id(name)
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch bookmarks: ${error.message}`,
      );
    }

    return data?.map((item) => item.topic) || [];
  }

  // ==================== REPLIES ====================

  async createReply(
    topicId: string,
    userId: string,
    createReplyDto: CreateReplyDto,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // Check if topic is locked
    const { data: topic } = await supabase
      .from("forum_topics")
      .select("is_locked")
      .eq("id", topicId)
      .single();

    if (topic?.is_locked) {
      throw new BadRequestException(
        "This topic is locked. Cannot add replies.",
      );
    }

    const { data, error } = await supabase
      .from("forum_replies")
      .insert({
        topic_id: topicId,
        user_id: userId,
        content: createReplyDto.content,
        created_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create reply: ${error.message}`);
    }

    return data;
  }

  async updateReply(
    replyId: string,
    userId: string,
    updateReplyDto: UpdateReplyDto,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: reply } = await supabase
      .from("forum_replies")
      .select("user_id")
      .eq("id", replyId)
      .single();

    if (!reply) {
      throw new NotFoundException("Reply not found");
    }

    if (reply.user_id !== userId) {
      throw new BadRequestException("You can only update your own replies");
    }

    const { data, error } = await supabase
      .from("forum_replies")
      .update({
        content: updateReplyDto.content,
        updated_at: new Date(),
      })
      .eq("id", replyId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update reply: ${error.message}`);
    }

    return data;
  }

  async deleteReply(replyId: string, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: reply } = await supabase
      .from("forum_replies")
      .select("user_id")
      .eq("id", replyId)
      .single();

    if (!reply) {
      throw new NotFoundException("Reply not found");
    }

    if (reply.user_id !== userId) {
      throw new BadRequestException("You can only delete your own replies");
    }

    const { error } = await supabase
      .from("forum_replies")
      .delete()
      .eq("id", replyId);

    if (error) {
      throw new BadRequestException(`Failed to delete reply: ${error.message}`);
    }

    return { message: "Reply deleted successfully" };
  }

  async markAsSolution(replyId: string, topicId: string, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Check if user is the topic owner
    const { data: topic } = await supabase
      .from("forum_topics")
      .select("user_id")
      .eq("id", topicId)
      .single();

    if (!topic || topic.user_id !== userId) {
      throw new BadRequestException("Only the topic owner can mark solutions");
    }

    // Remove previous solution from this topic
    await supabase
      .from("forum_replies")
      .update({ is_solution: false })
      .eq("topic_id", topicId);

    // Mark new solution
    const { data, error } = await supabase
      .from("forum_replies")
      .update({ is_solution: true })
      .eq("id", replyId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to mark solution: ${error.message}`,
      );
    }

    return data;
  }

  async likeReply(replyId: string, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: existing } = await supabase
      .from("forum_likes")
      .select("id")
      .eq("user_id", userId)
      .eq("reply_id", replyId)
      .maybeSingle();

    if (existing) {
      await supabase.from("forum_likes").delete().eq("id", existing.id);

      await supabase
        .from("forum_replies")
        .update({ like_count: supabase.rpc("decrement", { row_id: replyId }) })
        .eq("id", replyId);

      return { liked: false };
    } else {
      await supabase.from("forum_likes").insert({
        user_id: userId,
        reply_id: replyId,
      });

      await supabase
        .from("forum_replies")
        .update({ like_count: supabase.rpc("increment", { row_id: replyId }) })
        .eq("id", replyId);

      return { liked: true };
    }
  }

  // ==================== REAL-TIME ====================

  subscribeToTopic(topicId: string, callback: (payload: any) => void) {
    const supabase = this.supabaseService.getAdminClient();

    return supabase
      .channel(`topic-${topicId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_replies",
          filter: `topic_id=eq.${topicId}`,
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe();
  }

  subscribeToNewTopics(callback: (payload: any) => void) {
    const supabase = this.supabaseService.getAdminClient();

    return supabase
      .channel("new-topics")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_topics",
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe();
  }
}
