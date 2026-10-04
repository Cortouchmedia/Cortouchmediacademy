// src/forum/forum.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import type { Request } from "express";
import { ForumService } from "./forum.service";
import { CreateTopicDto, UpdateTopicDto } from "./dto/topic.dto";
import { CreateReplyDto, UpdateReplyDto } from "./dto/reply.dto";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { OptionalSupabaseAuthGuard } from "../auth/optional-supabase-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

type AuthUser = { id: string; email?: string };

@Controller("api/forum")
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // ==================== CATEGORIES (public) ====================

  @Get("categories")
  async getAllCategories() {
    return this.forumService.getAllCategories();
  }

  @Get("categories/:id")
  async getCategoryById(@Param("id") id: string) {
    return this.forumService.getCategoryById(id);
  }

  // ==================== TOPICS ====================

  @Post("topics")
  @UseGuards(SupabaseAuthGuard)
  async createTopic(
    @Body() createTopicDto: CreateTopicDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.createTopic(user.id, createTopicDto);
  }

  @Get("topics")
  async getAllTopics(
    @Query("category_id") category_id?: string,
    @Query("course_id") course_id?: string,
    @Query("search") search?: string,
    @Query("sort") sort?: "newest" | "oldest" | "most_replies" | "most_views",
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.forumService.getAllTopics({
      category_id,
      course_id,
      search,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get("topics/:id")
  @UseGuards(OptionalSupabaseAuthGuard)
  async getTopicById(
    @Param("id") id: string,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.forumService.getTopicById(id, req.user?.id);
  }

  @Put("topics/:id")
  @UseGuards(SupabaseAuthGuard)
  async updateTopic(
    @Param("id") id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.updateTopic(id, user.id, updateTopicDto);
  }

  @Delete("topics/:id")
  @UseGuards(SupabaseAuthGuard)
  async deleteTopic(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.deleteTopic(id, user.id);
  }

  @Post("topics/:id/like")
  @UseGuards(SupabaseAuthGuard)
  async likeTopic(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.likeTopic(id, user.id);
  }

  @Post("topics/:id/bookmark")
  @UseGuards(SupabaseAuthGuard)
  async bookmarkTopic(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.bookmarkTopic(id, user.id);
  }

  @Get("users/:userId/bookmarks")
  @UseGuards(SupabaseAuthGuard)
  async getUserBookmarks(
    @Param("userId") userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (userId !== user.id) {
      throw new ForbiddenException("You can only view your own bookmarks");
    }
    return this.forumService.getUserBookmarks(userId);
  }

  // ==================== REPLIES ====================

  @Post("topics/:topicId/replies")
  @UseGuards(SupabaseAuthGuard)
  async createReply(
    @Param("topicId") topicId: string,
    @Body() createReplyDto: CreateReplyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.createReply(topicId, user.id, createReplyDto);
  }

  @Put("replies/:id")
  @UseGuards(SupabaseAuthGuard)
  async updateReply(
    @Param("id") id: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.updateReply(id, user.id, updateReplyDto);
  }

  @Delete("replies/:id")
  @UseGuards(SupabaseAuthGuard)
  async deleteReply(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.deleteReply(id, user.id);
  }

  @Post("replies/:id/like")
  @UseGuards(SupabaseAuthGuard)
  async likeReply(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.likeReply(id, user.id);
  }

  @Post("topics/:topicId/replies/:replyId/solution")
  @UseGuards(SupabaseAuthGuard)
  async markAsSolution(
    @Param("topicId") topicId: string,
    @Param("replyId") replyId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.markAsSolution(replyId, topicId, user.id);
  }
}