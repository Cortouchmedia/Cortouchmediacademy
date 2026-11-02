// src/certificates/certificates.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserCertificates(userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("certificates")
      .select(
        `
        *,
        course:courses(id, title, level, category, instructor_id),
        user:user_id(id, full_name, email)
      `,
      )
      .eq("user_id", userId)
      .order("issue_date", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch certificates: ${error.message}`,
      );
    }

    return data || [];
  }

  async getCertificateById(certificateId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("certificates")
      .select(
        `
        *,
        course:courses(*),
        user:user_id(id, full_name, email)
      `,
      )
      .eq("id", certificateId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Certificate not found");
    }

    return data;
  }

  async getCertificateByCourse(userId: string, courseId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Certificate not found for this course");
    }

    return data;
  }

  async verifyCertificate(verificationCode: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("certificates")
      .select(
        `
        *,
        user:user_id(id, full_name, email),
        course:courses(id, title)
      `,
      )
      .eq("verification_code", verificationCode)
      .single();

    if (error || !data) {
      throw new NotFoundException("Invalid certificate verification code");
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

  async generateManualCertificate(
    userId: string,
    courseId: string,
    grade?: string,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // Check if course is completed
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select("progress_percentage, completed_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (enrollmentError || !enrollment) {
      throw new BadRequestException("User is not enrolled in this course");
    }

    if (enrollment.progress_percentage < 100) {
      throw new BadRequestException(
        `Course not completed. Progress: ${enrollment.progress_percentage}%`,
      );
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // Get course and user details
    const [courseResult, userResult] = await Promise.all([
      supabase.from("courses").select("title").eq("id", courseId).single(),
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single(),
    ]);

    // Generate certificate
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
      throw new BadRequestException(
        `Failed to create certificate: ${error.message}`,
      );
    }

    return data;
  }

    /**
   * Issues a certificate when the student has:
   *   1. 100% lesson progress, AND
   *   2. All projects in the course approved (status = 'graded')
   *
   * Courses with no projects complete on lesson progress alone.
   * Idempotent — safe to call repeatedly.
   */
     async maybeIssueCertificate(userId: string, courseId: string) {
      const supabase = this.supabaseService.getAdminClient();
  
      // 1. Check lesson completion
      const { data: enrollment } = await supabase
        .from("course_enrollments")
        .select("progress_percentage")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();
  
      if (!enrollment || Number(enrollment.progress_percentage) < 100) {
        return null; // not fully completed yet
      }
  
      // 2. Get all projects for this course
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("course_id", courseId);
  
      const projectIds = (projects || []).map((p: any) => p.id);
  
      // 3. If the course has projects, all must have a graded submission
      if (projectIds.length > 0) {
        const { data: submissions } = await supabase
          .from("project_submissions")
          .select("project_id, status")
          .eq("student_id", userId)
          .in("project_id", projectIds);
  
        const approvedProjects = new Set<string>();
        (submissions || []).forEach((s: any) => {
          if (s.status === "graded") approvedProjects.add(s.project_id);
        });
  
        const allApproved = projectIds.every((pid: string) =>
          approvedProjects.has(pid),
        );
  
        if (!allApproved) return null; // some projects still pending
      }
  
      // 4. Idempotent — return existing if already issued
      const { data: existing } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();
  
      if (existing) return existing;
  
      // 5. Generate identifiers
      const certificateNumber = `CERT-${new Date().getFullYear()}-${this.generateHash(
        userId + courseId,
      ).substring(0, 6)}`;
  
      const verificationCode = this.generateHash(userId + courseId + Date.now())
        .substring(0, 8)
        .toUpperCase();
  
      // 6. Fetch course + user for metadata
      const [courseResult, userResult] = await Promise.all([
        supabase.from("courses").select("title").eq("id", courseId).single(),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single(),
      ]);
  
      // 7. Insert (upsert protects against race conditions)
      const { data, error } = await supabase
        .from("certificates")
        .upsert(
          {
            user_id: userId,
            course_id: courseId,
            certificate_number: certificateNumber,
            issue_date: new Date(),
            verification_code: verificationCode,
            completed_at: new Date(),
            metadata: {
              course_title: courseResult.data?.title,
              user_name: userResult.data?.full_name,
              grade: "PASS",
              generated_by: "auto",
            },
          },
          { onConflict: "user_id,course_id", ignoreDuplicates: true },
        )
        .select()
        .maybeSingle();
  
      if (error) {
        this.logger.error(
          `Certificate insert failed (user=${userId}, course=${courseId}): ${error.message}`,
        );
        return null;
      }
  
      if (data) {
        this.logger.log(
          `Certificate issued to ${userId} for course ${courseId} (${certificateNumber})`,
        );
      }
  
      return data;
    }

  async getAllCertificates(limit = 50, offset = 0) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from("certificates")
      .select(
        `
        *,
        user:user_id(id, full_name, email),
        course:courses(id, title)
      `,
      )
      .order("issue_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch certificates: ${error.message}`,
      );
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
      throw new BadRequestException(`Failed to fetch stats: ${error.message}`);
    }

    const totalCertificates = data?.length || 0;
    const uniqueCourses = new Set(data?.map((c) => c.course_id)).size;
    const uniqueUsers = new Set(data?.map((c) => c.user_id)).size;

    // Certificates by month
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

  private generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
