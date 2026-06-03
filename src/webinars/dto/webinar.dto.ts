// src/webinars/dto/webinar.dto.ts
export class CreateWebinarDto {
  title: string;
  description: string;
  instructor_id: string;
  course_id?: string;
  start_time: Date;
  end_time: Date;
  platform?: string;
  max_attendees?: number;
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
  tags?: string[];
}

export class UpdateWebinarDto {
  title?: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
  status?: "scheduled" | "live" | "completed" | "cancelled";
  meeting_url?: string;
  recording_url?: string;
  slides_url?: string;
  resources?: any[];
  max_attendees?: number;
}

export class RegisterForWebinarDto {
  webinar_id: string;
  user_id: string;
}

export class SubmitWebinarFeedbackDto {
  webinar_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}

export class SendChatMessageDto {
  webinar_id: string;
  user_id: string;
  message: string;
}
