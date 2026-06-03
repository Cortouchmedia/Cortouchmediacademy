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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumController = void 0;
const common_1 = require("@nestjs/common");
const forum_service_1 = require("./forum.service");
const topic_dto_1 = require("./dto/topic.dto");
const reply_dto_1 = require("./dto/reply.dto");
let ForumController = class ForumController {
    constructor(forumService) {
        this.forumService = forumService;
    }
    async getAllCategories() {
        return this.forumService.getAllCategories();
    }
    async getCategoryById(id) {
        return this.forumService.getCategoryById(id);
    }
    async createTopic(createTopicDto, userId) {
        return this.forumService.createTopic(userId, createTopicDto);
    }
    async getAllTopics(category_id, course_id, search, sort, page, limit) {
        return this.forumService.getAllTopics({
            category_id,
            course_id,
            search,
            sort,
            page: page ? +page : 1,
            limit: limit ? +limit : 20,
        });
    }
    async getTopicById(id, userId) {
        return this.forumService.getTopicById(id, userId);
    }
    async updateTopic(id, updateTopicDto, userId) {
        return this.forumService.updateTopic(id, userId, updateTopicDto);
    }
    async deleteTopic(id, userId) {
        return this.forumService.deleteTopic(id, userId);
    }
    async likeTopic(id, userId) {
        return this.forumService.likeTopic(id, userId);
    }
    async bookmarkTopic(id, userId) {
        return this.forumService.bookmarkTopic(id, userId);
    }
    async getUserBookmarks(userId) {
        return this.forumService.getUserBookmarks(userId);
    }
    async createReply(topicId, createReplyDto, userId) {
        return this.forumService.createReply(topicId, userId, createReplyDto);
    }
    async updateReply(id, updateReplyDto, userId) {
        return this.forumService.updateReply(id, userId, updateReplyDto);
    }
    async deleteReply(id, userId) {
        return this.forumService.deleteReply(id, userId);
    }
    async likeReply(id, userId) {
        return this.forumService.likeReply(id, userId);
    }
    async markAsSolution(topicId, replyId, userId) {
        return this.forumService.markAsSolution(replyId, topicId, userId);
    }
};
exports.ForumController = ForumController;
__decorate([
    (0, common_1.Get)("categories"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.Get)("categories/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "getCategoryById", null);
__decorate([
    (0, common_1.Post)("topics"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [topic_dto_1.CreateTopicDto, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "createTopic", null);
__decorate([
    (0, common_1.Get)("topics"),
    __param(0, (0, common_1.Query)("category_id")),
    __param(1, (0, common_1.Query)("course_id")),
    __param(2, (0, common_1.Query)("search")),
    __param(3, (0, common_1.Query)("sort")),
    __param(4, (0, common_1.Query)("page")),
    __param(5, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "getAllTopics", null);
__decorate([
    (0, common_1.Get)("topics/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "getTopicById", null);
__decorate([
    (0, common_1.Put)("topics/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, topic_dto_1.UpdateTopicDto, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "updateTopic", null);
__decorate([
    (0, common_1.Delete)("topics/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "deleteTopic", null);
__decorate([
    (0, common_1.Post)("topics/:id/like"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "likeTopic", null);
__decorate([
    (0, common_1.Post)("topics/:id/bookmark"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "bookmarkTopic", null);
__decorate([
    (0, common_1.Get)("users/:userId/bookmarks"),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "getUserBookmarks", null);
__decorate([
    (0, common_1.Post)("topics/:topicId/replies"),
    __param(0, (0, common_1.Param)("topicId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reply_dto_1.CreateReplyDto, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "createReply", null);
__decorate([
    (0, common_1.Put)("replies/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reply_dto_1.UpdateReplyDto, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "updateReply", null);
__decorate([
    (0, common_1.Delete)("replies/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "deleteReply", null);
__decorate([
    (0, common_1.Post)("replies/:id/like"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "likeReply", null);
__decorate([
    (0, common_1.Post)("topics/:topicId/replies/:replyId/solution"),
    __param(0, (0, common_1.Param)("topicId")),
    __param(1, (0, common_1.Param)("replyId")),
    __param(2, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ForumController.prototype, "markAsSolution", null);
exports.ForumController = ForumController = __decorate([
    (0, common_1.Controller)("api/forum"),
    __metadata("design:paramtypes", [forum_service_1.ForumService])
], ForumController);
//# sourceMappingURL=forum.controller.js.map