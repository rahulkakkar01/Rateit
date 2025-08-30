import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
  secretOrKey: process.env.SECRET_KEY || 'yourSecretKey',
    });
  }

  validate(payload: any): any {
    console.log('jwtstrategy validate', payload);
    return payload;
  }
}
