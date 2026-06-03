import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogPostsService } from '../services/blog-posts.service';
import { CreateBlogPostDto } from '../dto/create-blog-post.dto';
import { UpdateBlogPostDto } from '../dto/update-blog-post.dto';
import { QueryBlogPostDto } from '../dto/query-blog-post.dto';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { BlogCategory } from '../schemas/blog-post.schema';
import { ApiTags } from '@nestjs/swagger';
import { CreateBlogPostApiDoc } from '../api-docs/create-blog-post.api-doc';
import { FindAllBlogPostsApiDoc } from '../api-docs/find-all-blog-posts.api-doc';
import { GetBlogPostsStatisticsApiDoc } from '../api-docs/get-statistics-blog-posts.api-doc';
import { FindFeaturedBlogPostsApiDoc } from '../api-docs/find-featured-blog-posts.api-doc';
import { FindBlogPostsByCategoryApiDoc } from '../api-docs/find-by-category-blog-posts.api-doc';
import { FindBlogPostsByTagApiDoc } from '../api-docs/find-by-tag-blog-posts.api-doc';
import { FindOneBlogPostApiDoc } from '../api-docs/find-one-blog-post.api-doc';
import { UpdateBlogPostApiDoc } from '../api-docs/update-blog-post.api-doc';
import { RemoveBlogPostApiDoc } from '../api-docs/remove-blog-post.api-doc';

@ApiTags('blog-posts')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) { }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @Post()
  @CreateBlogPostApiDoc()
  create(@Body() createBlogPostDto: CreateBlogPostDto) {
    return this.blogPostsService.create(createBlogPostDto);
  }

  @Get()
  @FindAllBlogPostsApiDoc()
  findAll(@Query() queryDto: QueryBlogPostDto) {
    return this.blogPostsService.findAll(queryDto);
  }

  @Get('statistics')
  @GetBlogPostsStatisticsApiDoc()
  getStatistics() {
    return this.blogPostsService.getStatistics();
  }

  @Get('featured')
  @FindFeaturedBlogPostsApiDoc()
  findFeatured(@Query() queryDto: QueryBlogPostDto) {
    return this.blogPostsService.findFeatured(queryDto);
  }

  @Get('category/:category')
  @FindBlogPostsByCategoryApiDoc()
  findByCategory(
    @Param('category') category: BlogCategory,
    @Query() queryDto: QueryBlogPostDto,
  ) {
    return this.blogPostsService.findByCategory(category, queryDto);
  }

  @Get('tag/:tag')
  @FindBlogPostsByTagApiDoc()
  findByTag(@Param('tag') tag: string, @Query() queryDto: QueryBlogPostDto) {
    return this.blogPostsService.findByTag(tag, queryDto);
  }

  @Get(':id')
  @FindOneBlogPostApiDoc()
  findOne(@Param('id') id: string) {
    return this.blogPostsService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UpdateBlogPostApiDoc()
  update(
    @Param('id') id: string,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
  ) {
    return this.blogPostsService.update(id, updateBlogPostDto);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @RemoveBlogPostApiDoc()
  remove(@Param('id') id: string) {
    return this.blogPostsService.remove(id);
  }
} 