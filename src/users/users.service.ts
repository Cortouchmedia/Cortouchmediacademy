import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    try {
      const supabase = this.supabaseService.getAdminClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        this.logger.error(
          `Failed to fetch profiles: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          `Failed to fetch profiles: ${error.message}`,
        );
      }

      this.logger.log(`Retrieved ${data?.length || 0} profiles`);
      return data || [];
    } catch (error) {
      // Fixed: Type guard for error
      if (error instanceof Error) {
        this.logger.error(`Unexpected error in findAll: ${error.message}`);
      } else {
        this.logger.error(`Unexpected error in findAll: ${String(error)}`);
      }
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const supabase = this.supabaseService.getAdminClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        this.logger.error(
          `Database error for ID ${id}: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
      }

      if (!data) {
        this.logger.warn(`Profile with ID ${id} not found`);
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }

      this.logger.log(`Found profile for ID: ${id}`);
      return data;
    } catch (error) {
      // Fixed: Type guard for error
      if (error instanceof Error) {
        this.logger.error(`Error in findOne for ID ${id}: ${error.message}`);
      } else {
        this.logger.error(`Error in findOne for ID ${id}: ${String(error)}`);
      }
      throw error;
    }
  }

  async findOneOrCreate(id: string, defaultData?: any) {
    try {
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.log(`Profile not found for ID ${id}, creating new profile`);
        return await this.create(id, defaultData);
      }
      throw error;
    }
  }

  async create(id: string, userData?: any) {
    try {
      const supabase = this.supabaseService.getAdminClient();

      const defaultProfile = {
        id: id,
        full_name: userData?.full_name || "",
        email: userData?.email || "",
        location: userData?.location || "",
        website: userData?.website || "",
        about_me: userData?.about_me || "",
        profile_picture: userData?.profile_picture || "",
        role: "STUDENT",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert(defaultProfile)
        .select()
        .maybeSingle();

      if (error) {
        this.logger.error(`Failed to create profile: ${error.message}`);
        throw new InternalServerErrorException(
          `Failed to create profile: ${error.message}`,
        );
      }

      if (!data) {
        throw new InternalServerErrorException(
          "Failed to create profile: No data returned",
        );
      }

      this.logger.log(`Successfully created profile for ID: ${id}`);
      return data;
    } catch (error) {
      // Fixed: Type guard for error
      if (error instanceof Error) {
        this.logger.error(`Error in create for ID ${id}: ${error.message}`);
      } else {
        this.logger.error(`Error in create for ID ${id}: ${String(error)}`);
      }
      throw error;
    }
  }

  async update(id: string, updates: any) {
    try {
      const supabase = this.supabaseService.getAdminClient();

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        this.logger.error(
          `Update error for ID ${id}: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          `Update failed: ${error.message}`,
        );
      }

      if (!data) {
        this.logger.warn(`Profile with ID ${id} not found for update`);
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }

      this.logger.log(`Successfully updated profile for ID: ${id}`);
      return data;
    } catch (error) {
      // Fixed: Type guard for error
      if (error instanceof Error) {
        this.logger.error(`Error in update for ID ${id}: ${error.message}`);
      } else {
        this.logger.error(`Error in update for ID ${id}: ${String(error)}`);
      }
      throw error;
    }
  }

  async adminFindAll() {
    try {
      const supabaseAdmin = this.supabaseService.getAdminClient();
      const { data, error } = await supabaseAdmin.from("profiles").select("*");

      if (error) {
        this.logger.error(`Admin fetch failed: ${error.message}`);
        throw new InternalServerErrorException(
          `Admin fetch failed: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      // Fixed: Type guard for error
      if (error instanceof Error) {
        this.logger.error(`Error in adminFindAll: ${error.message}`);
      } else {
        this.logger.error(`Error in adminFindAll: ${String(error)}`);
      }
      throw error;
    }
  }

  async adminUpdate(id: string, updates: any) {
    try {
      const supabaseAdmin = this.supabaseService.getAdminClient();
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        this.logger.error(`Admin update error: ${error.message}`);
        throw new InternalServerErrorException(
          `Admin update failed: ${error.message}`,
        );
      }

      if (!data) {
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }

      return data;
    } catch (error) {
      // Fixed: Type guard for error
      if (error instanceof Error) {
        this.logger.error(`Error in adminUpdate: ${error.message}`);
      } else {
        this.logger.error(`Error in adminUpdate: ${String(error)}`);
      }
      throw error;
    }
  }
}
