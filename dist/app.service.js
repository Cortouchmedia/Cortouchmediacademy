"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("./supabase.service");
const supabase_js_1 = require("@supabase/supabase-js");
let AppService = class AppService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    getHello() {
        return 'Hello from NestJS Backend!';
    }
    async getCourses() {
        const supabase = this.supabaseService.getClient();
        if (!supabase)
            return [];
        const { data, error } = await supabase
            .from('courses')
            .select('*');
        if (error) {
            console.error('Error fetching courses from Supabase:', error);
            return [];
        }
        return data;
    }
    async signup(full_name, email, password, location, website, role = 'STUDENT') {
        const supabase = this.supabaseService.getClient();
        if (!supabase)
            return { error: 'supabase not iniatialized' };
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
        if (supabase_js_1.AuthError)
            return { error: authError.message };
        if (!authData.user)
            return { error: 'user creation failed' };
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
            {
                id: authData.user.id,
                email: email,
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
    async login(email, password) {
        const supabase = this.supabaseService.getClient();
        if (!supabase)
            return { error: 'supabase client not initialized' };
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            return { error: error.message };
        return data;
    }
    async signOut() {
        const supabase = this.supabaseService.getClient();
        if (!supabase)
            return { error: 'Supabase client is not initialized' };
        const { error } = await supabase.auth.signOut();
        if (error)
            return { error: error.message };
        return { message: 'Signed out successful' };
    }
    async getUserProfile(userId) {
        const supabase = this.supabaseService.getClient();
        if (!supabase)
            return { error: 'supabase client not initialized' };
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error)
            return { error: error.message };
        return data;
    }
    async currentUSerProfile() {
        const supabase = this.supabaseService.getClient();
        if (!supabase)
            return { error: 'Supabase client is not initialized' };
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError)
            return { error: userError.message };
        if (!user)
            return { error: 'No user logged in' };
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profileError)
            return { error: profileError.message };
        return profile;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AppService);
//# sourceMappingURL=app.service.js.map