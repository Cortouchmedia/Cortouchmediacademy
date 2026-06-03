export interface Course {
    id: string;
    instructor_id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    level: string;
    status: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}
export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    description: string;
    order_number: number;
    course?: Course;
}
export interface ModuleWithCourse {
    id: string;
    course_id: string;
    title: string;
    description: string;
    order_number: number;
    course: {
        instructor_id: string;
    };
}
