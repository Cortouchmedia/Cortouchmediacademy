import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  getHello(): string {
    return 'Hello from NestJS Backend!';
  }

  async getCourses() {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.from('courses').select('*');

    if (error) {
      this.logger.error(`Error fetching courses: ${error.message}`);
      return [];
    }

    return data;
  }

  async signup(
    full_name: string,
    email: string,
    password: string,
    location?: string,
    website?: string,
    role: string = 'STUDENT',
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role },
      },
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: 'User creation failed' };

    // Create user profile in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name,
          role,
          location: location || null,
          website: website || null,
          avatar_url: null,
          about_me: null,
        },
      ])
      .select()
      .single();

    if (profileError) {
      this.logger.error(`Error creating profile: ${profileError.message}`);
    }

    return { user: authData.user, profile: profileData };
  }

  async login(email: string, password: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    return data;
  }

  async signOut() {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { message: 'Signed out successfully' };
  }

  async getUserProfile(userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return { error: error.message };
    return data;
  }

  async currentUserProfile() {
    const supabase = this.supabaseService.getAdminClient();

    // Get current session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { error: userError.message };
    if (!user) return { error: 'No user logged in' };

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) return { error: profileError.message };
    return profile;
  }
}
