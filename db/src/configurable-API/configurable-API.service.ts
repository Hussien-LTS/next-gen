import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigurableApi } from 'src/entities/configurable-API.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConfigurableApiService {
  @InjectRepository(ConfigurableApi)
  private configurableApiRepository: Repository<ConfigurableApi>;

  getAllApi() {
    try {
      return this.configurableApiRepository.find();
    } catch (error) {
      console.log('🚀 ~ ConfigurableApiService ~ getAllApi ~ error:', error);
      throw new BadRequestException('failed to get configruble API');
    }
  }

  createApi(body: any) {
    try {
      const api = this.configurableApiRepository.create(body);
      return this.configurableApiRepository.save(api);
    } catch (error) {
      console.log('🚀 ~ ConfigurableApiService ~ createApi ~ error:', error);
      throw new BadRequestException('failed to create configruble API by ID');
    }
  }

  async getApiById(id: number) {
    try {
      console.log('🚀 ~ ConfigurableApiService ~ getApiById ~ id:', id);
      return await this.configurableApiRepository.findOne({ where: { id } });
    } catch (error) {
      console.log('🚀 ~ ConfigurableApiService ~ getApiById ~ error:', error);
      throw new BadRequestException('failed to get configruble API by ID');
    }
  }
}
