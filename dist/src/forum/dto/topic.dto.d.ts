export declare class CreateTopicDto {
    title: string;
    content: string;
    category_id: string;
    course_id?: string;
    tags?: string[];
}
export declare class UpdateTopicDto {
    title?: string;
    content?: string;
    is_pinned?: boolean;
    is_locked?: boolean;
}
