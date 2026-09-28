// src/webinars/webinars.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  CreateWebinarDto,
  UpdateWebinarDto,
  RegisterForWebinarDto,
  SubmitWebinarFeedbackDto,
  SendChatMessageDto,
} from "./dto/webinar.dto";

@Injectable()
export class WebinarsService {
  private readonly logger = new Logger(WebinarsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // ==================== WEBINAR MANAGEMENT ====================
  getSupabaseClient() {
    return this.supabaseService.getClient();
  }
  async createWebinar(createWebinarDto: CreateWebinarDto) {
    const supabase = this.supabaseService.getClient();

    // Calculate duration
    const start = new Date(createWebinarDto.start_time);
    const end = new Date(createWebinarDto.end_time);
    const durationMinutes = Math.round(
      (end.getTime() - start.getTime()) / 60000,
    );

    const { data, error } = await supabase
      .from("webinars")
      .insert({
        ...createWebinarDto,
        duration_minutes: durationMinutes,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to create webinar: ${error.message}`,
      );
    }

    return data;
  }

  async getAllWebinars(filters?: {
    status?: string;
    course_id?: string;
    instructor_id?: string;
    from_date?: Date;
    to_date?: Date;
    page?: number;
    limit?: number;
  }) {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from("webinars").select(`
        *,
        instructor:instructor_id(id, full_name, email, profile_picture),
        course:course_id(id, title),
        analytics:webinar_analytics(*)
      `);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.course_id) {
      query = query.eq("course_id", filters.course_id);
    }
    if (filters?.instructor_id) {
      query = query.eq("instructor_id", filters.instructor_id);
    }
    if (filters?.from_date) {
      query = query.gte("start_time", filters.from_date.toISOString());
    }
    if (filters?.to_date) {
      query = query.lte("end_time", filters.to_date.toISOString());
    }

    // Sorting
    query = query.order("start_time", { ascending: true });

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException(
        `Failed to fetch webinars: ${error.message}`,
      );
    }

    return {
      webinars: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getWebinarById(webinarId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: webinar, error } = await supabase
      .from("webinars")
      .select(
        `
        *,
        instructor:instructor_id(id, full_name, email, profile_picture, about_me),
        course:course_id(id, title, slug),
        analytics:webinar_analytics(*),
        recent_messages:webinar_chat_messages(
          id,
          message,
          created_at,
          user:user_id(id, full_name, profile_picture)
        )
      `,
      )
      .eq("id", webinarId)
      .single();

    if (error || !webinar) {
      throw new NotFoundException("Webinar not found");
    }

    // Get registrations count
    const { count: registrationsCount } = await supabase
      .from("webinar_registrations")
      .select("*", { count: "exact", head: true })
      .eq("webinar_id", webinarId);

    // Get attendees count
    const { count: attendeesCount } = await supabase
      .from("webinar_registrations")
      .select("*", { count: "exact", head: true })
      .eq("webinar_id", webinarId)
      .eq("attended", true);

    return {
      ...webinar,
      registrations_count: registrationsCount || 0,
      attendees_count: attendeesCount || 0,
      recent_messages: (webinar.recent_messages || []).slice(-20), // Last 20 messages
    };
  }

  async updateWebinar(
    webinarId: string,
    instructorId: string,
    updateWebinarDto: UpdateWebinarDto,
  ) {
    const supabase = this.supabaseService.getClient();

    // Verify ownership
    const { data: webinar } = await supabase
      .from("webinars")
      .select("instructor_id")
      .eq("id", webinarId)
      .single();

    if (!webinar) {
      throw new NotFoundException("Webinar not found");
    }

    if (webinar.instructor_id !== instructorId) {
      throw new BadRequestException("You can only update your own webinars");
    }

    const { data, error } = await supabase
      .from("webinars")
      .update({
        ...updateWebinarDto,
        updated_at: new Date(),
      })
      .eq("id", webinarId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update webinar: ${error.message}`,
      );
    }

    return data;
  }

  async deleteWebinar(webinarId: string, instructorId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: webinar } = await supabase
      .from("webinars")
      .select("instructor_id")
      .eq("id", webinarId)
      .single();

    if (!webinar) {
      throw new NotFoundException("Webinar not found");
    }

    if (webinar.instructor_id !== instructorId) {
      throw new BadRequestException("You can only delete your own webinars");
    }

    const { error } = await supabase
      .from("webinars")
      .delete()
      .eq("id", webinarId);

    if (error) {
      throw new BadRequestException(
        `Failed to delete webinar: ${error.message}`,
      );
    }

    return { message: "Webinar deleted successfully" };
  }

  // ==================== REGISTRATION & ATTENDANCE ====================

  // src/webinars/webinars.service.ts - Replace the registerForWebinar method

  async registerForWebinar(registerDto: RegisterForWebinarDto) {
    const supabase = this.supabaseService.getClient();

    this.logger.log(
      `Registering user ${registerDto.user_id} for webinar ${registerDto.webinar_id}`,
    );

    try {
      // First, check if webinar exists and is available
      const { data: webinar, error: webinarError } = await supabase
        .from("webinars")
        .select("max_attendees, current_attendees, status, title")
        .eq("id", registerDto.webinar_id)
        .single();

      if (webinarError || !webinar) {
        this.logger.error(`Webinar not found: ${registerDto.webinar_id}`);
        throw new NotFoundException("Webinar not found");
      }

      if (webinar.status === "cancelled") {
        throw new BadRequestException("This webinar has been cancelled");
      }

      if (webinar.status === "completed") {
        throw new BadRequestException("This webinar has already ended");
      }

      if (webinar.current_attendees >= webinar.max_attendees) {
        throw new BadRequestException("Webinar is full");
      }

      // Try to insert the registration (plain insert, no conflict handling)
      const { data, error } = await supabase
        .from("webinar_registrations")
        .insert({
          webinar_id: registerDto.webinar_id,
          user_id: registerDto.user_id,
          registration_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate error
        if (error.code === "23505") {
          // PostgreSQL unique violation code
          throw new BadRequestException(
            "You are already registered for this webinar",
          );
        }
        this.logger.error(`Registration error: ${error.message}`);
        throw new BadRequestException(`Failed to register: ${error.message}`);
      }

      // Update the attendee count
      await supabase
        .from("webinars")
        .update({ current_attendees: webinar.current_attendees + 1 })
        .eq("id", registerDto.webinar_id);

      this.logger.log(
        `Successfully registered user ${registerDto.user_id} for webinar ${registerDto.webinar_id}`,
      );

      return {
        success: true,
        message: "Successfully registered for webinar",
        registration: data,
        webinar_title: webinar.title,
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error: ${error.message}`);
      throw new BadRequestException(`Failed to register: ${error.message}`);
    }
  }

  async markAttendance(webinarId: string, userId: string, attended: boolean) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("webinar_registrations")
      .update({
        attended: attended,
        joined_at: attended ? new Date() : null,
        attendance_duration_minutes: attended ? 0 : null,
      })
      .eq("webinar_id", webinarId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to mark attendance: ${error.message}`,
      );
    }

    return data;
  }

  async updateAttendanceDuration(
    webinarId: string,
    userId: string,
    durationMinutes: number,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("webinar_registrations")
      .update({
        attendance_duration_minutes: durationMinutes,
        left_at: new Date(),
      })
      .eq("webinar_id", webinarId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Failed to update attendance duration: ${error.message}`,
      );
    }

    return data;
  }

  async getUserRegistrations(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("webinar_registrations")
      .select(
        `
        *,
        webinar:webinar_id(*, instructor:instructor_id(id, full_name))
      `,
      )
      .eq("user_id", userId)
      .order("registration_date", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch registrations: ${error.message}`,
      );
    }

    return data || [];
  }

  async getWebinarRegistrations(webinarId: string, instructorId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify instructor owns this webinar
    const { data: webinar } = await supabase
      .from("webinars")
      .select("instructor_id")
      .eq("id", webinarId)
      .single();

    if (!webinar || webinar.instructor_id !== instructorId) {
      throw new BadRequestException(
        "You can only view registrations for your own webinars",
      );
    }

    const { data, error } = await supabase
      .from("webinar_registrations")
      .select(
        `
        *,
        user:user_id(id, full_name, email, profile_picture)
      `,
      )
      .eq("webinar_id", webinarId)
      .order("registration_date", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch registrations: ${error.message}`,
      );
    }

    return data || [];
  }

  // ==================== FEEDBACK & REVIEWS ====================

  // src/webinars/webinars.service.ts - Fix the submitFeedback method

  async submitFeedback(feedbackDto: SubmitWebinarFeedbackDto) {
    const supabase = this.supabaseService.getClient();

    // Add validation
    if (!feedbackDto) {
      throw new BadRequestException("Feedback data is required");
    }

    if (!feedbackDto.webinar_id) {
      throw new BadRequestException("Webinar ID is required");
    }

    if (!feedbackDto.user_id) {
      throw new BadRequestException("User ID is required");
    }

    if (
      !feedbackDto.rating ||
      feedbackDto.rating < 1 ||
      feedbackDto.rating > 5
    ) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    this.logger.log(
      `Submitting feedback for webinar ${feedbackDto.webinar_id} from user ${feedbackDto.user_id}`,
    );

    // Check if user attended
    const { data: registration, error: registrationError } = await supabase
      .from("webinar_registrations")
      .select("attended, id")
      .eq("webinar_id", feedbackDto.webinar_id)
      .eq("user_id", feedbackDto.user_id)
      .maybeSingle();

    if (registrationError) {
      this.logger.error(
        `Error checking registration: ${registrationError.message}`,
      );
      throw new BadRequestException(
        `Failed to verify registration: ${registrationError.message}`,
      );
    }

    if (!registration) {
      throw new BadRequestException("You are not registered for this webinar");
    }

    if (!registration.attended) {
      throw new BadRequestException(
        "You must attend the webinar to leave feedback",
      );
    }

    // Update the feedback
    const { data, error } = await supabase
      .from("webinar_registrations")
      .update({
        feedback_rating: feedbackDto.rating,
        feedback_comment: feedbackDto.comment || null,
      })
      .eq("webinar_id", feedbackDto.webinar_id)
      .eq("user_id", feedbackDto.user_id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to submit feedback: ${error.message}`);
      throw new BadRequestException(
        `Failed to submit feedback: ${error.message}`,
      );
    }

    this.logger.log(
      `Feedback submitted successfully for webinar ${feedbackDto.webinar_id}`,
    );

    return {
      success: true,
      message: "Feedback submitted successfully",
      feedback: data,
    };
  }

  async getWebinarFeedback(webinarId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("webinar_registrations")
      .select(
        `
        feedback_rating,
        feedback_comment,
        user:user_id(full_name, profile_picture)
      `,
      )
      .eq("webinar_id", webinarId)
      .not("feedback_rating", "is", null);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch feedback: ${error.message}`,
      );
    }

    // Calculate average rating
    const ratings =
      data?.filter((r) => r.feedback_rating).map((r) => r.feedback_rating) ||
      [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    return {
      feedback: data || [],
      average_rating: averageRating,
      total_reviews: ratings.length,
    };
  }

  // ==================== CHAT MESSAGES ====================

  async sendChatMessage(chatDto: SendChatMessageDto) {
    const supabase = this.supabaseService.getClient();

    // Check if user is registered
    const { data: registration } = await supabase
      .from("webinar_registrations")
      .select("id")
      .eq("webinar_id", chatDto.webinar_id)
      .eq("user_id", chatDto.user_id)
      .maybeSingle();

    if (!registration) {
      throw new BadRequestException("You must be registered to chat");
    }

    const { data, error } = await supabase
      .from("webinar_chat_messages")
      .insert({
        webinar_id: chatDto.webinar_id,
        user_id: chatDto.user_id,
        message: chatDto.message,
        created_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to send message: ${error.message}`);
    }

    return data;
  }

  async getChatMessages(webinarId: string, limit = 50) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("webinar_chat_messages")
      .select(
        `
        *,
        user:user_id(id, full_name, email, profile_picture)
      `,
      )
      .eq("webinar_id", webinarId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch messages: ${error.message}`,
      );
    }

    return (data || []).reverse(); // Return in chronological order
  }

  // ==================== UPCOMING WEBINARS ====================

  async getUpcomingWebinars(userId?: string, limit = 10) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from("webinars")
      .select(
        `
        *,
        instructor:instructor_id(id, full_name),
        course:course_id(id, title),
        user_registered:webinar_registrations!inner(user_id)
      `,
      )
      .gte("start_time", new Date().toISOString())
      .eq("status", "scheduled")
      .order("start_time", { ascending: true })
      .limit(limit);

    if (userId) {
      query = query.eq("webinar_registrations.user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Failed to fetch upcoming webinars: ${error.message}`,
      );
    }

    return data || [];
  }

  // In your webinars.service.ts, update getLiveWebinars method:

  async getLiveWebinars() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("webinars")
      .select(
        `
      *,
      instructor:instructor_id(id, full_name, email),
      course:course_id(id, title)
    `,
      )
      .eq("status", "live")
      .order("start_time", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch live webinars: ${error.message}`,
      );
    }

    // Return empty array instead of throwing 404
    return {
      success: true,
      webinars: data || [],
      count: data?.length || 0,
    };
  }
}
