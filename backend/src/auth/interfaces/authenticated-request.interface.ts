import { Request } from 'express';
import { SafeUser } from 'src/database/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: SafeUser,
}