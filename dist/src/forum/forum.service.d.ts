import { SupabaseService } from "../../supabase.service";
import { CreateTopicDto, UpdateTopicDto } from "./dto/topic.dto";
import { CreateReplyDto, UpdateReplyDto } from "./dto/reply.dto";
export declare class ForumService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getAllCategories(): Promise<any[]>;
    getCategoryById(categoryId: string): Promise<any>;
    createTopic(userId: string, createTopicDto: CreateTopicDto): Promise<any>;
    getAllTopics(filters?: {
        category_id?: string;
        course_id?: string;
        search?: string;
        sort?: "newest" | "oldest" | "most_replies" | "most_views";
        page?: number;
        limit?: number;
    }): Promise<{
        topics: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTopicById(topicId: string, userId?: string): Promise<any>;
    updateTopic(topicId: string, userId: string, updateTopicDto: UpdateTopicDto): Promise<any>;
    deleteTopic(topicId: string, userId: string): Promise<{
        message: string;
    }>;
    likeTopic(topicId: string, userId: string): Promise<{
        liked: boolean;
        message: string;
    }>;
    bookmarkTopic(topicId: string, userId: string): Promise<{
        bookmarked: boolean;
        message: string;
    }>;
    getUserBookmarks(userId: string): Promise<any[][]>;
    createReply(topicId: string, userId: string, createReplyDto: CreateReplyDto): Promise<any>;
    updateReply(replyId: string, userId: string, updateReplyDto: UpdateReplyDto): Promise<any>;
    deleteReply(replyId: string, userId: string): Promise<{
        message: string;
    }>;
    markAsSolution(replyId: string, topicId: string, userId: string): Promise<any>;
    likeReply(replyId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    subscribeToTopic(topicId: string, callback: (payload: any) => void): import("@supabase/realtime-js").RealtimeChannel;
    subscribeToNewTopics(callback: (payload: any) => void): import("@supabase/realtime-js").RealtimeChannel;
}
