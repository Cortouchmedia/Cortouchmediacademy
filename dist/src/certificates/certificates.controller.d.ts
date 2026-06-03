import { CertificatesService } from "./certificates.service";
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    getMyCertificates(userId: string): Promise<any[]>;
    getCertificateByCourse(userId: string, courseId: string): Promise<any>;
    verifyCertificate(code: string): Promise<{
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
    generateCertificate(userId: string, courseId: string, grade?: string): Promise<any>;
    getCertificateById(id: string): Promise<any>;
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
}
