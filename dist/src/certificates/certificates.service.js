"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CertificatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase.service");
let CertificatesService = CertificatesService_1 = class CertificatesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(CertificatesService_1.name);
    }
    async getUserCertificates(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("certificates")
            .select(`
        *,
        course:courses(id, title, level, category, instructor_id),
        user:user_id(id, full_name, email)
      `)
            .eq("user_id", userId)
            .order("issue_date", { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch certificates: ${error.message}`);
        }
        return data || [];
    }
    async getCertificateById(certificateId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("certificates")
            .select(`
        *,
        course:courses(*),
        user:user_id(id, full_name, email)
      `)
            .eq("id", certificateId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException("Certificate not found");
        }
        return data;
    }
    async getCertificateByCourse(userId, courseId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("certificates")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException("Certificate not found for this course");
        }
        return data;
    }
    async verifyCertificate(verificationCode) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from("certificates")
            .select(`
        *,
        user:user_id(id, full_name, email),
        course:courses(id, title)
      `)
            .eq("verification_code", verificationCode)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException("Invalid certificate verification code");
        }
        return {
            valid: true,
            verified_at: new Date(),
            certificate: {
                number: data.certificate_number,
                issue_date: data.issue_date,
                user_name: data.user?.full_name,
                course_title: data.course?.title,
                verification_code: data.verification_code,
            },
        };
    }
    async generateManualCertificate(userId, courseId, grade) {
        const supabase = this.supabaseService.getAdminClient();
        const { data: enrollment, error: enrollmentError } = await supabase
            .from("course_enrollments")
            .select("progress_percentage, completed_at")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .single();
        if (enrollmentError || !enrollment) {
            throw new common_1.BadRequestException("User is not enrolled in this course");
        }
        if (enrollment.progress_percentage < 100) {
            throw new common_1.BadRequestException(`Course not completed. Progress: ${enrollment.progress_percentage}%`);
        }
        const { data: existing } = await supabase
            .from("certificates")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .maybeSingle();
        if (existing) {
            return existing;
        }
        const [courseResult, userResult] = await Promise.all([
            supabase.from("courses").select("title").eq("id", courseId).single(),
            supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", userId)
                .single(),
        ]);
        const certificateNumber = `CERT-${new Date().getFullYear()}-${this.generateHash(userId + courseId).substring(0, 6)}`;
        const verificationCode = this.generateHash(userId + courseId + Date.now())
            .substring(0, 8)
            .toUpperCase();
        const { data, error } = await supabase
            .from("certificates")
            .insert({
            user_id: userId,
            course_id: courseId,
            certificate_number: certificateNumber,
            issue_date: new Date(),
            verification_code: verificationCode,
            completed_at: new Date(),
            metadata: {
                course_title: courseResult.data?.title,
                user_name: userResult.data?.full_name,
                grade: grade || "PASS",
                generated_by: "manual",
            },
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`Failed to create certificate: ${error.message}`);
        }
        return data;
    }
    async getAllCertificates(limit = 50, offset = 0) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from("certificates")
            .select(`
        *,
        user:user_id(id, full_name, email),
        course:courses(id, title)
      `)
            .order("issue_date", { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch certificates: ${error.message}`);
        }
        return {
            certificates: data || [],
            total: data?.length || 0,
            limit,
            offset,
        };
    }
    async getCertificateStats() {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from("certificates")
            .select("id, issue_date, course_id, user_id");
        if (error) {
            throw new common_1.BadRequestException(`Failed to fetch stats: ${error.message}`);
        }
        const totalCertificates = data?.length || 0;
        const uniqueCourses = new Set(data?.map((c) => c.course_id)).size;
        const uniqueUsers = new Set(data?.map((c) => c.user_id)).size;
        const byMonth = data?.reduce((acc, cert) => {
            const month = new Date(cert.issue_date).toLocaleString("default", {
                month: "long",
                year: "numeric",
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
        return {
            total_certificates: totalCertificates,
            unique_courses: uniqueCourses,
            unique_users: uniqueUsers,
            by_month: byMonth,
        };
    }
    generateHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = CertificatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map