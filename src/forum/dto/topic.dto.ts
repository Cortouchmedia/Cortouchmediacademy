// src/forum/dto/topic.dto.ts
export class CreateTopicDto {
  title: string;
  content: string;
  category_id: string;
  course_id?: string;
  tags?: string[];
}

export class UpdateTopicDto {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
}
