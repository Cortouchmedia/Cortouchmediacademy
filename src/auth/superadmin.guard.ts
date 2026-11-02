import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { RoleGuard } from "./role.guard";

@Injectable()
export class SuperAdminGuard extends RoleGuard {
  constructor(supabase: SupabaseService) {
    super(supabase, ["SUPERADMIN"]);
  }
}