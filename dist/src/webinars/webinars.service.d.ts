import { SupabaseService } from "../../supabase.service";
import { CreateWebinarDto, UpdateWebinarDto, RegisterForWebinarDto, SubmitWebinarFeedbackDto, SendChatMessageDto } from "./dto/webinar.dto";
export declare class WebinarsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getSupabaseClient(): import("@supabase/supabase-js/dist/index.cjs").SupabaseClient<any, "public", "public", any, any>;
    createWebinar(createWebinarDto: CreateWebinarDto): Promise<any>;
    getAllWebinars(filters?: {
        status?: string;
        course_id?: string;
        instructor_id?: string;
        from_date?: Date;
        to_date?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        webinars: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getWebinarById(webinarId: string): Promise<any>;
    updateWebinar(webinarId: string, instructorId: string, updateWebinarDto: UpdateWebinarDto): Promise<any>;
    deleteWebinar(webinarId: string, instructorId: string): Promise<{
        message: string;
    }>;
    registerForWebinar(registerDto: RegisterForWebinarDto): Promise<{
        success: boolean;
        message: string;
        registration: any;
        webinar_title: any;
    }>;
    markAttendance(webinarId: string, userId: string, attended: boolean): Promise<any>;
    updateAttendanceDuration(webinarId: string, userId: string, durationMinutes: number): Promise<any>;
    getUserRegistrations(userId: string): Promise<any[]>;
    getWebinarRegistrations(webinarId: string, instructorId: string): Promise<any[]>;
    submitFeedback(feedbackDto: SubmitWebinarFeedbackDto): Promise<{
        success: boolean;
        message: string;
        feedback: any;
    }>;
    getWebinarFeedback(webinarId: string): Promise<{
        feedback: {
            feedback_rating: any;
            feedback_comment: any;
            user: {
                full_name: any;
                profile_picture: any;
            }[];
        }[];
        average_rating: number;
        total_reviews: number;
    }>;
    sendChatMessage(chatDto: SendChatMessageDto): Promise<any>;
    getChatMessages(webinarId: string, limit?: number): Promise<any[]>;
    getUpcomingWebinars(userId?: string, limit?: number): Promise<any[]>;
    getLiveWebinars(): Promise<{
        success: boolean;
        webinars: any[];
        count: number;
    }>;
}
