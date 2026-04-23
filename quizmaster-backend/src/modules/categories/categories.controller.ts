import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id/permanent')
  async removePermanent(@Param('id') id: string) {
    return await this.categoriesService.removePermanent(id);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.categoriesService.restore(id);
  }
}
