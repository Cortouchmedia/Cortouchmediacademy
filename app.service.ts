import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { AuthError } from '@supabase/supabase-js';
import { error, profile } from 'node:console';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getHello(): string {
    return 'Hello from NestJS Backend!';
  }

  async getCourses() {
    const supabase = this.supabaseService.getClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('courses')
      .select('*');

    if (error) {
      console.error('Error fetching courses from Supabase:', error);
      return [];
    }

    return data;
  }

    // Sign up new user (creates auth user + profile)

  async signup(full_name: string, email: string, password: string, location?: string, website?: string, role: string = 'STUDENT') {
    const supabase = this.supabaseService.getClient();
    if (!supabase) return { error: 'supabase not iniatialized' };

    // create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name,
          role: role,
        }
      }
    });

    if (AuthError) return { error: authError.message };
    if (!authData.user) return { error: 'user creation failed' };

    // create user profile in profiles table

    const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user.id,
        email:email,
        full_name: full_name,
        role: role,
        location: location || null,
        website: website || null,
        avatar_url: null,
        about_me: null
      }
    ])
    .select()
    .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);

    }
    return { user: authData.user, profile: profileData };

  }

// login user

async login(email: string, password: string) {
  const  supabase = this.supabaseService.getClient();
  if (!supabase) return { error: 'supabase client not initialized' };

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email,
    password,
});

if (error) return { error: error.message };
return data;
}

//sign out user

async signOut() {
  const supabase = this.supabaseService.getClient();
  if (!supabase) return { error: 'Supabase client is not initialized' };

  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return { message: 'Signed out successful'};
}

//GEt user profile by Id

async getUserProfile(userId: string) {
  const supabase = this.supabaseService.getClient();
  if (!supabase) return { error: 'supabase client not initialized' };
  const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

  if (error) return { error: error.message};
  return data;
}

// get current user profile
async currentUSerProfile() {
  const supabase = this.supabaseService.getClient();
  if (!supabase) return { error: 'Supabase client is not initialized' };

  // get current session
  const { data: { user },  error: userError} = await supabase.auth.getUser();

  if (userError) return { error: userError.message };
  if (!user) return { error: 'No user logged in'};

  // get profile
  const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

  if (profileError) return { error: profileError.message };
  return profile;
}

}
