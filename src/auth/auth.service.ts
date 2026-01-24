import { Injectable, UnauthorizedException } from '@nestjs/common';
import AuthDto from './dto/auth.dto';
import { PrismaClient } from 'generated/prisma/client';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  async login(auth: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: auth.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario e/ou senha inválidos');
    }

    const isPasswordValid = await compare(auth.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario e/ou senha inválidos');
    }

    const { password, ...resUser } = user;
    return { access_token: await this.jwtService.signAsync({ ...resUser }) };
  }

  async validateToken(token: string) {
    try {
      const decodedToken = await this.jwtService.decode(token);

      if (!decodedToken) {
        throw new UnauthorizedException('Token inválido');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: decodedToken.id,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }

      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
