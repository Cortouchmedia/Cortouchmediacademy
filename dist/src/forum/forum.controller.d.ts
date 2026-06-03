import { ForumService } from "./forum.service";
import { CreateTopicDto, UpdateTopicDto } from "./dto/topic.dto";
import { CreateReplyDto, UpdateReplyDto } from "./dto/reply.dto";
export declare class ForumController {
    private readonly forumService;
    constructor(forumService: ForumService);
    getAllCategories(): Promise<any[]>;
    getCategoryById(id: string): Promise<any>;
    createTopic(createTopicDto: CreateTopicDto, userId: string): Promise<any>;
    getAllTopics(category_id?: string, course_id?: string, search?: string, sort?: "newest" | "oldest" | "most_replies" | "most_views", page?: number, limit?: number): Promise<{
        topics: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTopicById(id: string, userId?: string): Promise<any>;
    updateTopic(id: string, updateTopicDto: UpdateTopicDto, userId: string): Promise<any>;
    deleteTopic(id: string, userId: string): Promise<{
        message: string;
    }>;
    likeTopic(id: string, userId: string): Promise<{
        liked: boolean;
        message: string;
    }>;
    bookmarkTopic(id: string, userId: string): Promise<{
        bookmarked: boolean;
        message: string;
    }>;
    getUserBookmarks(userId: string): Promise<any[][]>;
    createReply(topicId: string, createReplyDto: CreateReplyDto, userId: string): Promise<any>;
    updateReply(id: string, updateReplyDto: UpdateReplyDto, userId: string): Promise<any>;
    deleteReply(id: string, userId: string): Promise<{
        message: string;
    }>;
    likeReply(id: string, userId: string): Promise<{
        liked: boolean;
    }>;
    markAsSolution(topicId: string, replyId: string, userId: string): Promise<any>;
}
