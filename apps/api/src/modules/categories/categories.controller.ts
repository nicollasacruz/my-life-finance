import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create a category' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(workspaceId, createCategoryDto);
  }

  @ApiOperation({ summary: 'Get all categories in workspace' })
  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.categoriesService.findAll(workspaceId);
  }

  @ApiOperation({ summary: 'Get a specific category' })
  @Get(':id')
  findOne(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.categoriesService.findOne(id, workspaceId);
  }

  @ApiOperation({ summary: 'Update a category' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('workspaceId') workspaceId: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, workspaceId, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete a category' })
  @UseGuards(RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.categoriesService.remove(id, workspaceId);
  }
}
