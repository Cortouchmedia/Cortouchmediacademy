// supabase.service.ts - Fix the error handling
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Try multiple naming conventions for flexibility
    const supabaseUrl =
      this.configService.get<string>("SUPABASE_URL") ||
      this.configService.get<string>("NEXT_PUBLIC_SUPABASE_URL");

    const supabaseKey =
      this.configService.get<string>("SUPABASE_ANON_KEY") ||
      this.configService.get<string>(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      );

    const supabaseServiceKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    // DEBUGGING: Log what we found (without exposing full keys)
    this.logger.log(`SUPABASE_URL: ${supabaseUrl ? "✅ Found" : "❌ Missing"}`);
    this.logger.log(
      `SUPABASE_ANON_KEY: ${supabaseKey ? "✅ Found" : "❌ Missing"}`,
    );
    this.logger.log(
      `SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✅ Found (length: " + supabaseServiceKey.length + ")" : "❌ Missing"}`,
    );

    if (supabaseServiceKey) {
      this.logger.log(
        `Service key prefix: ${supabaseServiceKey.substring(0, 30)}...`,
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error("Supabase credentials are missing!");
      this.logger.error(
        "Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env",
      );
      throw new Error("Supabase configuration is incomplete");
    }

    // Regular client with anon key
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    this.logger.log("Supabase client initialized successfully");

    // Admin client with service role key (bypasses RLS)
    if (
      supabaseServiceKey &&
      supabaseServiceKey !== "your-service-role-key-here"
    ) {
      try {
        this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.logger.log("✅ Supabase admin client initialized successfully");
      } catch (error: any) {
        // Fixed: Use 'any' type for error
        this.logger.error(
          `Failed to create admin client: ${error?.message || error}`,
        );
        // Fallback to regular client
        this.supabaseAdmin = this.supabase;
      }
    } else {
      this.logger.warn(
        "SUPABASE_SERVICE_ROLE_KEY not provided or is placeholder. Admin operations will fail.",
      );
      // As a fallback, use regular client for admin operations (if RLS is disabled)
      this.supabaseAdmin = this.supabase;
      this.logger.warn(
        "⚠️ Using regular client as fallback for admin operations",
      );
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error(
        "Supabase client not initialized. Check your configuration.",
      );
    }
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      // Fallback to regular client instead of throwing error
      this.logger.warn(
        "Admin client not available, falling back to regular client",
      );
      return this.getClient();
    }
    return this.supabaseAdmin;
  }
}
