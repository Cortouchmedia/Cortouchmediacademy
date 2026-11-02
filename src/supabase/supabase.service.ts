import {
    Injectable,
    Logger,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { createClient, SupabaseClient } from '@supabase/supabase-js';
  
  @Injectable()
  export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private readonly supabase: SupabaseClient;
    private readonly supabaseAdmin: SupabaseClient;
  
    constructor(private readonly configService: ConfigService) {
      const url = this.getRequired('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
      const anonKey = this.getRequired(
        'SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
      );
      const serviceKey = this.configService.get<string>(
        'SUPABASE_SERVICE_ROLE_KEY',
      );
  
      this.supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
  
      if (serviceKey) {
        this.supabaseAdmin = createClient(url, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        this.logger.log('Supabase clients initialized (anon + admin)');
      } else {
        this.logger.warn(
          'SUPABASE_SERVICE_ROLE_KEY missing — admin client falls back to anon. RLS-protected writes will fail.',
        );
        this.supabaseAdmin = this.supabase;
      }
    }
  
    private getRequired(...keys: string[]): string {
      for (const key of keys) {
        const value = this.configService.get<string>(key);
        if (value && value.trim().length > 0) return value;
      }
      throw new InternalServerErrorException(
        `Missing required Supabase env var (tried: ${keys.join(', ')})`,
      );
    }
  
    getClient(): SupabaseClient {
      return this.supabase;
    }
  
    getAdminClient(): SupabaseClient {
      return this.supabaseAdmin;
    }
  }
