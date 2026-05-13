import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from './users.service';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import {
  AdminUpdateUserDto,
  QueryUsersDto,
  UpdateProfileDto,
  UserIdParamDto,
} from './dto/user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { memoryStorage } from 'multer';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  getMe(@GetCurrentUser('sub') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  updateMe(
    @GetCurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(userId, dto);
  }

  @Patch('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadMyAvatar(
    @GetCurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadMyAvatar(userId, file);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param() params: UserIdParamDto) {
    return this.usersService.findOne(params.id);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @Patch(':id/restore')
  restore(@Param() params: UserIdParamDto) {
    return this.usersService.restore(params.id);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @Patch(':id')
  updateByAdmin(
    @Param() params: UserIdParamDto,
    @GetCurrentUser('sub') currentAdminId: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.updateByAdmin(params.id, currentAdminId, dto);
  }

  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @Delete(':id')
  softDelete(
    @Param() params: UserIdParamDto,
    @GetCurrentUser('sub') currentAdminId: string,
  ) {
    return this.usersService.softDelete(params.id, currentAdminId);
  }
}
