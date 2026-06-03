export class userProfileDto {
  id: string;
  full_name: string;
  email: string;
  location: string;
  website: string;
  about_me: string; // ✅ Add this - for bio/description
  profile_picture: string; // ✅ Add this - for avatar/photo URL
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "SUPER ADMIN";
}
