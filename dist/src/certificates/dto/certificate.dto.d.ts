export declare class CertificateDto {
    id: string;
    user_id: string;
    course_id: string;
    certificate_number: string;
    issue_date: Date;
    verification_code: string;
    completed_at: Date;
    metadata: {
        course_title?: string;
        user_name?: string;
        grade?: string;
    };
}
export declare class VerifyCertificateDto {
    verification_code: string;
}
