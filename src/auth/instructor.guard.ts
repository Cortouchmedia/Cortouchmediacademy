import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { RoleGuard } from "./role.guard";

@Injectable()
export class InstructorGuard extends RoleGuard {
  constructor(supabase: SupabaseService) {
    super(supabase, ["INSTRUCTOR", "ADMIN", "SUPERADMIN"]);
  }
}