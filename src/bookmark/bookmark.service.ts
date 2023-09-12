import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmark, UpdateBookmark } from './bookmark.typedef';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });
  }

  async createBookmarks(userId: number, values: CreateBookmark) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...values,
      },
    });

    return bookmark;
  }

  async updateBookmarkById(
    userId: number,
    bookmarkId: number,
    values: UpdateBookmark,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...values,
      },
    });
  }

  async deleteBookmarks(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
