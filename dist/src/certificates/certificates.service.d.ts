import { SupabaseService } from "../../supabase.service";
export declare class CertificatesService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getUserCertificates(userId: string): Promise<any[]>;
    getCertificateById(certificateId: string): Promise<any>;
    getCertificateByCourse(userId: string, courseId: string): Promise<any>;
    verifyCertificate(verificationCode: string): Promise<{
        valid: boolean;
        verified_at: Date;
        certificate: {
            number: any;
            issue_date: any;
            user_name: any;
            course_title: any;
            verification_code: any;
        };
    }>;
    generateManualCertificate(userId: string, courseId: string, grade?: string): Promise<any>;
    getAllCertificates(limit?: number, offset?: number): Promise<{
        certificates: any[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getCertificateStats(): Promise<{
        total_certificates: number;
        unique_courses: number;
        unique_users: number;
        by_month: {};
    }>;
    private generateHash;
}
