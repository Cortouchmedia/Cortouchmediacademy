export class RegisterDto {
  full_name: string;
  email: string;
  password: string;
  role: "STUDENT" | "INSTRUCTOR";
}
