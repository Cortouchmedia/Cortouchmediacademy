import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';
import { InstructorGuard } from '../auth/instructor.guard';
import { AdminGuard } from '../auth/admin.guard';
import { SuperAdminGuard } from '../auth/superadmin.guard';

@Global()
@Module({
  providers: [
    SupabaseService,
    SupabaseAuthGuard,
    OptionalSupabaseAuthGuard,
    InstructorGuard,
    AdminGuard,
    SuperAdminGuard,
  ],
  exports: [
    SupabaseService,
    SupabaseAuthGuard,
    OptionalSupabaseAuthGuard,
    InstructorGuard,
    AdminGuard,
    SuperAdminGuard,
  ],
})
export class SupabaseModule {}