import { ConflictException, UnauthorizedException } from '@nestjs/common';

export class EmailAlreadyExistsError extends ConflictException {
  constructor() {
    super('A user with this email already exists.');
  }
}

export class InvalidCredentialsError extends UnauthorizedException {
  constructor() {
    super('Email or password is incorrect.');
  }
}

export class InvalidJwtError extends UnauthorizedException {
  constructor() {
    super('Jwt is invalid.');
  }
}