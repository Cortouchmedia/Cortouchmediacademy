import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service"; // ✅ Add this import
import { userProfileDto } from "./dto/user-profile.dto"; // ✅ Add this import

@Controller("api/auth/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(":id")
  async getUser(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Put(":id")
  async updateUser(
    @Param("id") id: string,
    @Body() updateData: Partial<userProfileDto>,
  ) {
    // Simple validation without guards
    if (
      updateData.role &&
      !["STUDENT", "INSTRUCTOR", "ADMIN"].includes(updateData.role)
    ) {
      throw new BadRequestException(
        "Role must be STUDENT, INSTRUCTOR, or ADMIN",
      );
    }

    return this.usersService.update(id, updateData);
  }

  // Optional: Add this endpoint to test creating profiles
  @Post(":id/create-if-not-exists")
  async getOrCreateUser(
    @Param("id") id: string,
    @Body() userData: Partial<userProfileDto>,
  ) {
    return this.usersService.findOneOrCreate(id, userData);
  }
}
