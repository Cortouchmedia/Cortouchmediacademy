"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ForumService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase.service");
let ForumService = ForumService_1 = class ForumService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(ForumService_1.name);
    }
    async getAllCategories() {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("forum_categories")
            .select("*")
            .eq("is_active", true)
            .order("order_number", { ascending: true });
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch categories: ${error.message}`);
        }
        const categoriesWithCounts = await Promise.all((data || []).map(async (category) => {
            const { count } = await supabase
                .from("forum_topics")
                .select("*", { count: "exact", head: true })
                .eq("category_id", category.id);
            return { ...category, topic_count: count || 0 };
        }));
        return categoriesWithCounts;
    }
    async getCategoryById(categoryId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("forum_categories")
            .select("*")
            .eq("id", categoryId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException("Category not found");
        }
        return data;
    }
    async createTopic(userId, createTopicDto) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("forum_topics")
            .insert({
            ...createTopicDto,
            user_id: userId,
            created_at: new Date(),
            updated_at: new Date(),
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to create topic: ${error.message}`);
        }
        return data;
    }
    async getAllTopics(filters) {
        const supabase = this.supabaseService.getClient();
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
            query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }
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
            default:
                query = query.order("created_at", { ascending: false });
        }
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const start = (page - 1) * limit;
        const end = start + limit - 1;
        query = query.range(start, end);
        const { data, error, count } = await query;
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch topics: ${error.message}`);
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
    async getTopicById(topicId, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: topic, error: topicError } = await supabase
            .from("forum_topics")
            .select(`
      *,
      user:user_id(id, full_name, email, profile_picture),
      category:category_id(*),
      course:course_id(id, title, slug),
      last_reply_user:last_reply_user_id(id, full_name)
    `)
            .eq("id", topicId)
            .single();
        if (topicError || !topic) {
            console.error("Topic not found:", topicError);
            throw new common_1.NotFoundException("Topic not found");
        }
        const currentViews = topic.view_count || 0;
        await supabase
            .from("forum_topics")
            .update({ view_count: currentViews + 1 })
            .eq("id", topicId);
        const { data: replies } = await supabase
            .from("forum_replies")
            .select(`
      *,
      user:user_id(id, full_name, email, profile_picture)
    `)
            .eq("topic_id", topicId)
            .order("created_at", { ascending: true });
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
    async updateTopic(topicId, userId, updateTopicDto) {
        const supabase = this.supabaseService.getClient();
        const { data: topic } = await supabase
            .from("forum_topics")
            .select("user_id")
            .eq("id", topicId)
            .single();
        if (!topic) {
            throw new common_1.NotFoundException("Topic not found");
        }
        if (topic.user_id !== userId) {
            throw new common_1.BadRequestException("You can only update your own topics");
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
            throw new common_1.BadRequestException(`Failed to update topic: ${error.message}`);
        }
        return data;
    }
    async deleteTopic(topicId, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: topic } = await supabase
            .from("forum_topics")
            .select("user_id")
            .eq("id", topicId)
            .single();
        if (!topic) {
            throw new common_1.NotFoundException("Topic not found");
        }
        if (topic.user_id !== userId) {
            throw new common_1.BadRequestException("You can only delete your own topics");
        }
        const { error } = await supabase
            .from("forum_topics")
            .delete()
            .eq("id", topicId);
        if (error) {
            throw new common_1.BadRequestException(`Failed to delete topic: ${error.message}`);
        }
        return { message: "Topic deleted successfully" };
    }
    async likeTopic(topicId, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: existing } = await supabase
            .from("forum_likes")
            .select("id")
            .eq("user_id", userId)
            .eq("topic_id", topicId)
            .maybeSingle();
        if (existing) {
            await supabase.from("forum_likes").delete().eq("id", existing.id);
            await supabase
                .from("forum_topics")
                .update({ like_count: supabase.rpc("decrement", { row_id: topicId }) })
                .eq("id", topicId);
            return { liked: false, message: "Topic unliked" };
        }
        else {
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
    async bookmarkTopic(topicId, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: existing } = await supabase
            .from("forum_bookmarks")
            .select("id")
            .eq("user_id", userId)
            .eq("topic_id", topicId)
            .maybeSingle();
        if (existing) {
            await supabase.from("forum_bookmarks").delete().eq("id", existing.id);
            return { bookmarked: false, message: "Bookmark removed" };
        }
        else {
            await supabase.from("forum_bookmarks").insert({
                user_id: userId,
                topic_id: topicId,
            });
            return { bookmarked: true, message: "Topic bookmarked" };
        }
    }
    async getUserBookmarks(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("forum_bookmarks")
            .select(`
        topic:topic_id(*,
          user:user_id(id, full_name),
          category:category_id(name)
        )
      `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch bookmarks: ${error.message}`);
        }
        return data?.map((item) => item.topic) || [];
    }
    async createReply(topicId, userId, createReplyDto) {
        const supabase = this.supabaseService.getClient();
        const { data: topic } = await supabase
            .from("forum_topics")
            .select("is_locked")
            .eq("id", topicId)
            .single();
        if (topic?.is_locked) {
            throw new common_1.BadRequestException("This topic is locked. Cannot add replies.");
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
            throw new common_1.BadRequestException(`Failed to create reply: ${error.message}`);
        }
        return data;
    }
    async updateReply(replyId, userId, updateReplyDto) {
        const supabase = this.supabaseService.getClient();
        const { data: reply } = await supabase
            .from("forum_replies")
            .select("user_id")
            .eq("id", replyId)
            .single();
        if (!reply) {
            throw new common_1.NotFoundException("Reply not found");
        }
        if (reply.user_id !== userId) {
            throw new common_1.BadRequestException("You can only update your own replies");
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
            throw new common_1.BadRequestException(`Failed to update reply: ${error.message}`);
        }
        return data;
    }
    async deleteReply(replyId, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: reply } = await supabase
            .from("forum_replies")
            .select("user_id")
            .eq("id", replyId)
            .single();
        if (!reply) {
            throw new common_1.NotFoundException("Reply not found");
        }
        if (reply.user_id !== userId) {
            throw new common_1.BadRequestException("You can only delete your own replies");
        }
        const { error } = await supabase
            .from("forum_replies")
            .delete()
            .eq("id", replyId);
        if (error) {
            throw new common_1.BadRequestException(`Failed to delete reply: ${error.message}`);
        }
        return { message: "Reply deleted successfully" };
    }
    async markAsSolution(replyId, topicId, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: topic } = await supabase
            .from("forum_topics")
            .select("user_id")
            .eq("id", topicId)
            .single();
        if (!topic || topic.user_id !== userId) {
            throw new common_1.BadRequestException("Only the topic owner can mark solutions");
        }
        await supabase
            .from("forum_replies")
            .update({ is_solution: false })
            .eq("topic_id", topicId);
        const { data, error } = await supabase
            .from("forum_replies")
            .update({ is_solution: true })
            .eq("id", replyId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to mark solution: ${error.message}`);
        }
        return data;
    }
    async likeReply(replyId, userId) {
        const supabase = this.supabaseService.getClient();
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
        }
        else {
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
    subscribeToTopic(topicId, callback) {
        const supabase = this.supabaseService.getClient();
        return supabase
            .channel(`topic-${topicId}`)
            .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "forum_replies",
            filter: `topic_id=eq.${topicId}`,
        }, (payload) => {
            callback(payload);
        })
            .subscribe();
    }
    subscribeToNewTopics(callback) {
        const supabase = this.supabaseService.getClient();
        return supabase
            .channel("new-topics")
            .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "forum_topics",
        }, (payload) => {
            callback(payload);
        })
            .subscribe();
    }
};
exports.ForumService = ForumService;
exports.ForumService = ForumService = ForumService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ForumService);
//# sourceMappingURL=forum.service.js.map