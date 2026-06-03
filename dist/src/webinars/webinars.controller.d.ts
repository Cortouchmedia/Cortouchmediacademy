import { WebinarsService } from "./webinars.service";
import { CreateWebinarDto, UpdateWebinarDto, RegisterForWebinarDto, SubmitWebinarFeedbackDto, SendChatMessageDto } from "./dto/webinar.dto";
export declare class WebinarsController {
    private readonly webinarsService;
    constructor(webinarsService: WebinarsService);
    createWebinar(createWebinarDto: CreateWebinarDto): Promise<any>;
    getAllWebinars(status?: string, course_id?: string, instructor_id?: string, page?: number, limit?: number): Promise<{
        webinars: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUpcomingWebinars(userId?: string, limit?: number): Promise<any[]>;
    getLiveWebinars(): Promise<{
        success: boolean;
        webinars: any[];
        count: number;
    }>;
    getWebinarById(id: string): Promise<any>;
    updateWebinar(id: string, instructorId: string, updateWebinarDto: UpdateWebinarDto): Promise<any>;
    deleteWebinar(id: string, instructorId: string): Promise<{
        message: string;
    }>;
    registerForWebinar(registerDto: RegisterForWebinarDto): Promise<{
        success: boolean;
        message: string;
        registration: any;
        webinar_title: any;
    }>;
    getUserRegistrations(userId: string): Promise<any[]>;
    getWebinarRegistrations(webinarId: string, instructorId: string): Promise<any[]>;
    markAttendance(webinarId: string, userId: string, attended: boolean): Promise<any>;
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
    testFeedback(body: any): Promise<{
        received: any;
        webinar_id: any;
        user_id: any;
        rating: any;
        comment: any;
    }>;
    getUserStatus(webinarId: string, userId: string): Promise<{
        is_registered: boolean;
        registration_data: any;
        attended: any;
        error: string;
    }>;
    debugAllWebinars(): Promise<{
        total: number;
        webinars: any[];
        live_count: number;
        statuses: {
            id: any;
            title: any;
            status: any;
        }[];
    }>;
    debugLiveCheck(): Promise<{
        result: {
            success: boolean;
            webinars: any[];
            count: number;
        };
        hasLiveWebinars: boolean;
        message: string;
    }>;
}
