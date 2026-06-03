// src/webinars/webinars.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { WebinarsService } from "./webinars.service";
import {
  CreateWebinarDto,
  UpdateWebinarDto,
  RegisterForWebinarDto,
  SubmitWebinarFeedbackDto,
  SendChatMessageDto,
} from "./dto/webinar.dto";

@Controller("api/webinars")
export class WebinarsController {
  constructor(private readonly webinarsService: WebinarsService) {}

  // ==================== WEBINAR MANAGEMENT ====================

  @Post()
  async createWebinar(@Body() createWebinarDto: CreateWebinarDto) {
    return this.webinarsService.createWebinar(createWebinarDto);
  }

  @Get()
  async getAllWebinars(
    @Query("status") status?: string,
    @Query("course_id") course_id?: string,
    @Query("instructor_id") instructor_id?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.webinarsService.getAllWebinars({
      status,
      course_id,
      instructor_id,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get("upcoming")
  async getUpcomingWebinars(
    @Query("userId") userId?: string,
    @Query("limit") limit?: number,
  ) {
    return this.webinarsService.getUpcomingWebinars(
      userId,
      limit ? +limit : 10,
    );
  }

  @Get("live")
  async getLiveWebinars() {
    const result = await this.webinarsService.getLiveWebinars();
    return result;
  }

  @Get(":id")
  async getWebinarById(@Param("id") id: string) {
    return this.webinarsService.getWebinarById(id);
  }

  @Put(":id")
  async updateWebinar(
    @Param("id") id: string,
    @Query("instructorId") instructorId: string,
    @Body() updateWebinarDto: UpdateWebinarDto,
  ) {
    return this.webinarsService.updateWebinar(
      id,
      instructorId,
      updateWebinarDto,
    );
  }

  @Delete(":id")
  async deleteWebinar(
    @Param("id") id: string,
    @Query("instructorId") instructorId: string,
  ) {
    return this.webinarsService.deleteWebinar(id, instructorId);
  }

  // ==================== REGISTRATION ====================

  @Post("register")
  async registerForWebinar(@Body() registerDto: RegisterForWebinarDto) {
    if (!registerDto.webinar_id) {
      throw new BadRequestException("webinar_id is required");
    }
    if (!registerDto.user_id) {
      throw new BadRequestException("user_id is required");
    }
    return this.webinarsService.registerForWebinar(registerDto);
  }

  @Get("user/:userId/registrations")
  async getUserRegistrations(@Param("userId") userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }
    return this.webinarsService.getUserRegistrations(userId);
  }

  @Get(":webinarId/registrations")
  async getWebinarRegistrations(
    @Param("webinarId") webinarId: string,
    @Query("instructorId") instructorId: string,
  ) {
    if (!webinarId) {
      throw new BadRequestException("webinarId is required");
    }
    if (!instructorId) {
      throw new BadRequestException("instructorId is required");
    }
    return this.webinarsService.getWebinarRegistrations(
      webinarId,
      instructorId,
    );
  }

  @Post(":webinarId/attendance")
  async markAttendance(
    @Param("webinarId") webinarId: string,
    @Query("userId") userId: string,
    @Body("attended") attended: boolean,
  ) {
    if (!webinarId) {
      throw new BadRequestException("webinarId is required");
    }
    if (!userId) {
      throw new BadRequestException("userId is required");
    }
    if (attended === undefined) {
      throw new BadRequestException("attended field is required");
    }
    return this.webinarsService.markAttendance(webinarId, userId, attended);
  }

  // ==================== FEEDBACK ====================

  @Post("feedback")
  async submitFeedback(@Body() feedbackDto: SubmitWebinarFeedbackDto) {
    if (!feedbackDto) {
      throw new BadRequestException("Request body is required");
    }
    if (!feedbackDto.webinar_id) {
      throw new BadRequestException("webinar_id is required");
    }
    if (!feedbackDto.user_id) {
      throw new BadRequestException("user_id is required");
    }
    if (!feedbackDto.rating) {
      throw new BadRequestException("rating is required");
    }
    if (feedbackDto.rating < 1 || feedbackDto.rating > 5) {
      throw new BadRequestException("rating must be between 1 and 5");
    }
    return this.webinarsService.submitFeedback(feedbackDto);
  }

  @Get(":webinarId/feedback")
  async getWebinarFeedback(@Param("webinarId") webinarId: string) {
    if (!webinarId) {
      throw new BadRequestException("webinarId is required");
    }
    return this.webinarsService.getWebinarFeedback(webinarId);
  }

  // ==================== CHAT ====================

  @Post("chat")
  async sendChatMessage(@Body() chatDto: SendChatMessageDto) {
    if (!chatDto) {
      throw new BadRequestException("Request body is required");
    }
    if (!chatDto.webinar_id) {
      throw new BadRequestException("webinar_id is required");
    }
    if (!chatDto.user_id) {
      throw new BadRequestException("user_id is required");
    }
    if (!chatDto.message) {
      throw new BadRequestException("message is required");
    }
    return this.webinarsService.sendChatMessage(chatDto);
  }

  @Get(":webinarId/chat")
  async getChatMessages(
    @Param("webinarId") webinarId: string,
    @Query("limit") limit?: number,
  ) {
    if (!webinarId) {
      throw new BadRequestException("webinarId is required");
    }
    return this.webinarsService.getChatMessages(webinarId, limit ? +limit : 50);
  }

  // ==================== DEBUG ====================

  @Post("test-feedback")
  async testFeedback(@Body() body: any) {
    return {
      received: body,
      webinar_id: body?.webinar_id,
      user_id: body?.user_id,
      rating: body?.rating,
      comment: body?.comment,
    };
  }

  @Get(":webinarId/user/:userId/status")
  async getUserStatus(
    @Param("webinarId") webinarId: string,
    @Param("userId") userId: string,
  ) {
    const supabase = this.webinarsService.getSupabaseClient();

    const { data: registration, error } = await supabase
      .from("webinar_registrations")
      .select("*")
      .eq("webinar_id", webinarId)
      .eq("user_id", userId)
      .maybeSingle();

    return {
      is_registered: !!registration,
      registration_data: registration,
      attended: registration?.attended || false,
      error: error?.message,
    };
  }

  @Get("debug/all-webinars")
  async debugAllWebinars() {
    const supabase = this.webinarsService.getSupabaseClient();

    const { data, error } = await supabase.from("webinars").select("*");

    return {
      total: data?.length || 0,
      webinars: data,
      live_count: data?.filter((w) => w.status === "live").length || 0,
      statuses: data?.map((w) => ({
        id: w.id,
        title: w.title,
        status: w.status,
      })),
    };
  }

  // Add to your webinars.controller.ts
  @Get("debug/live-check")
  async debugLiveCheck() {
    const result = await this.webinarsService.getLiveWebinars();
    return {
      result,
      hasLiveWebinars: result.count > 0,
      message:
        result.count === 0
          ? "No live webinars found in database"
          : "Live webinars exist",
    };
  }
}
