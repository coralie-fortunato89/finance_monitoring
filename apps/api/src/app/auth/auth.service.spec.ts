jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue('access-token'),
  })),
}));

const bcryptMock = {
  hash: jest.fn(async (password: string, rounds: number) => {
    if (password === '__timing_dummy__') {
      return 'dummy-hash';
    }
    return `hashed:${password}:${rounds}`;
  }),
  compare: jest.fn(async (password: string, hash: string) => {
    if (hash === 'dummy-hash') {
      return false;
    }
    return hash === `hashed:${password}:12`;
  }),
};

jest.mock('bcrypt', () => bcryptMock);

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const jwt = {
    sign: jest.fn().mockReturnValue('access-token'),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('access-token');
    service = new AuthService(prisma as never, jwt as never);
  });

  it('hashes passwords with bcrypt cost 12 on register', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@b.co',
      firstName: 'A',
      lastName: 'B',
      passwordHash: 'hash',
    });
    prisma.refreshToken.create.mockResolvedValue({});

    await service.register({
      firstName: 'A',
      lastName: 'B',
      email: 'A@B.CO',
      password: 'Password1ab',
    });

    expect(bcryptMock.hash).toHaveBeenCalledWith('Password1ab', 12);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'a@b.co' }),
      }),
    );
  });

  it('maps Prisma P2002 to ConflictException', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.user.create.mockRejectedValue(err);

    await expect(
      service.register({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.co',
        password: 'Password1ab',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects bad password on login', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.co',
      firstName: 'A',
      lastName: 'B',
      passwordHash: 'hashed:Password1ab:12',
    });

    await expect(
      service.login({ email: 'a@b.co', password: 'WrongPass1a' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('still runs bcrypt when email is unknown', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@b.co', password: 'Password1ab' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(bcryptMock.compare).toHaveBeenCalled();
  });
});
