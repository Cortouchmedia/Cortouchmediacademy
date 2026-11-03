import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get() 
  getRoot(): string {
    return 'Backend API is running';
  }

  @Get('info') 
  getApiInfo() {
    return {
      message: 'Backend API Information',
      endpoints: {
        root: '/api',
        hello: '/api/hello',
        courses: '/api/courses',
        auditLogs: '/api/admin/audit-logs',
        auth: {
          signup: '/api/auth/signup',
          signin: '/api/auth/signin',
          signout: '/api/auth/signout',
          profile: '/api/auth/profile',
          users: '/api/auth/users'
        }
      }
    };
  }

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/audit-logs')
  @UseGuards(AuthGuard('jwt'))
  async getAuditLogs() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}