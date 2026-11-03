import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_TYPES = ["user", "course", "auth", "system"] as const;

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async createLog(log: {
    user_id?: string;
    action: string;
    type: (typeof VALID_TYPES)[number];
    details?: string;
  }) {
    if (!VALID_TYPES.includes(log.type)) {
      this.logger.error(`Invalid audit log type: "${log.type}"`);
      return;
    }

    const userId =
      log.user_id && UUID_RE.test(log.user_id) ? log.user_id : null;
    if (log.user_id && !userId) {
      this.logger.warn(`Dropping invalid user_id "${log.user_id}" from audit log`);
    }

    try {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from("audit_logs")
        .insert({
          user_id: userId,
          action: log.action,
          type: log.type,
          details: log.details ?? null,
   
        });

      if (error) {
        this.logger.error(`Audit log failed: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Audit logging error: ${String(error)}`);
    }
  }
}