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
} from "@nestjs/common";
import { ForumService } from "./forum.service";
import { CreateTopicDto, UpdateTopicDto } from "./dto/topic.dto";
import { CreateReplyDto, UpdateReplyDto } from "./dto/reply.dto";

@Controller("api/forum")
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // ==================== CATEGORIES ====================

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
  async createTopic(
    @Body() createTopicDto: CreateTopicDto,
    @Query("userId") userId: string,
  ) {
    return this.forumService.createTopic(userId, createTopicDto);
  }

  @Get("topics")
  async getAllTopics(
    @Query("category_id") category_id?: string,
    @Query("course_id") course_id?: string,
    @Query("search") search?: string,
    @Query("sort") sort?: "newest" | "oldest" | "most_replies" | "most_views",
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.forumService.getAllTopics({
      category_id,
      course_id,
      search,
      sort,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get("topics/:id")
  async getTopicById(
    @Param("id") id: string,
    @Query("userId") userId?: string,
  ) {
    return this.forumService.getTopicById(id, userId);
  }

  @Put("topics/:id")
  async updateTopic(
    @Param("id") id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @Query("userId") userId: string,
  ) {
    return this.forumService.updateTopic(id, userId, updateTopicDto);
  }

  @Delete("topics/:id")
  async deleteTopic(@Param("id") id: string, @Query("userId") userId: string) {
    return this.forumService.deleteTopic(id, userId);
  }

  @Post("topics/:id/like")
  async likeTopic(@Param("id") id: string, @Query("userId") userId: string) {
    return this.forumService.likeTopic(id, userId);
  }

  @Post("topics/:id/bookmark")
  async bookmarkTopic(
    @Param("id") id: string,
    @Query("userId") userId: string,
  ) {
    return this.forumService.bookmarkTopic(id, userId);
  }

  @Get("users/:userId/bookmarks")
  async getUserBookmarks(@Param("userId") userId: string) {
    return this.forumService.getUserBookmarks(userId);
  }

  // ==================== REPLIES ====================

  @Post("topics/:topicId/replies")
  async createReply(
    @Param("topicId") topicId: string,
    @Body() createReplyDto: CreateReplyDto,
    @Query("userId") userId: string,
  ) {
    return this.forumService.createReply(topicId, userId, createReplyDto);
  }

  @Put("replies/:id")
  async updateReply(
    @Param("id") id: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @Query("userId") userId: string,
  ) {
    return this.forumService.updateReply(id, userId, updateReplyDto);
  }

  @Delete("replies/:id")
  async deleteReply(@Param("id") id: string, @Query("userId") userId: string) {
    return this.forumService.deleteReply(id, userId);
  }

  @Post("replies/:id/like")
  async likeReply(@Param("id") id: string, @Query("userId") userId: string) {
    return this.forumService.likeReply(id, userId);
  }

  @Post("topics/:topicId/replies/:replyId/solution")
  async markAsSolution(
    @Param("topicId") topicId: string,
    @Param("replyId") replyId: string,
    @Query("userId") userId: string,
  ) {
    return this.forumService.markAsSolution(replyId, topicId, userId);
  }
}
