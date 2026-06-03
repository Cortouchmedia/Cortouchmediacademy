export declare enum CourseLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED"
}
export declare enum CourseStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare class CreateCourseDto {
    title: string;
    slug: string;
    description: string;
    short_description?: string;
    price?: number;
    category?: string;
    level?: CourseLevel;
    image_url?: string;
    status?: CourseStatus;
    is_published?: boolean;
}
