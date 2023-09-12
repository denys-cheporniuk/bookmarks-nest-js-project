import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthSignUp } from '../src/auth/auth.typedef';
import { UpdateUser } from '../src/user/user.typedef';
import { CreateBookmark } from '../src/bookmark/bookmark.typedef';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    let dto: AuthSignUp;

    beforeAll(() => {
      dto = {
        email: 'test@gmail.com',
        password: '123',
      };
    });

    describe('sign up', () => {
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error if body not provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('sign in', () => {
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error if body not provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('get current user', () => {
      it('should return user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('update user', () => {
      it('should update user', () => {
        const updateValues: UpdateUser = {
          firstName: 'test name',
        };

        return pactum
          .spec()
          .patch('/users/update')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(updateValues)
          .expectStatus(200)
          .expectBodyContains(updateValues.firstName);
      });
    });
  });

  describe('Bookmark', () => {
    describe('should return empty bookmark', () => {
      it('should return bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('create bookmarks', () => {
      it('should create bookmark', () => {
        const createValues: CreateBookmark = {
          title: 'New Bookmark',
          link: 'https://test',
          description: 'test bookmark description',
        };

        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(createValues)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('get bookmarks', () => {
      it('should return bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('get bookmark by id', () => {
      it('should return bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('update bookmark by id', () => {
      it('should update bookmark', () => {
        const updateValues = {
          title: 'new title',
          link: 'http://test1',
          description: 'new description text',
        };

        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(updateValues)
          .expectStatus(200)
          .expectBodyContains(updateValues.title)
          .expectBodyContains(updateValues.link)
          .expectBodyContains(updateValues.description);
      });
    });

    describe('delete bookmarks', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
