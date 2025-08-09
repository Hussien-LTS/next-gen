import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { mapToUserEntity } from './users.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userData: any[]): Promise<void> {
    console.log('🚀 ~ UsersService ~ createUser ~ userData:', userData);

    try {
      for (const data of userData) {
        const mappedUser = mapToUserEntity(data);

        console.log('[UsersService] Mapped User:', mappedUser);

        const existingUser = await this.userRepository.findOneBy({
          Id: mappedUser.Id,
        });

        if (existingUser) {
          if (mappedUser.ExternalId) {
            await this.userRepository.update({ Id: mappedUser.Id }, mappedUser);
          }
        } else {
          const newUser = await this.userRepository.insert(mappedUser);
          console.log('🚀 ~ UsersService ~ createUser ~ newUser:', newUser);
        }
      }
    } catch (error) {
      console.log('🚀 ~ UsersService ~ createUser ~ error:', error);
      throw new Error('Failed to save user information.');
    }
  }
}
