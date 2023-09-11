import { Injectable } from '@nestjs/common';
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

  getBookmarkById(userId: number, bookmarkId: number) {
    console.log({
      userId,
      id: bookmarkId,
    });

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

  updateBookmarkById(
    userId: number,
    bookmarkId: number,
    values: UpdateBookmark,
  ) {

  }

  deleteBookmarks(userId: number, bookmarkId: number) {}
}
