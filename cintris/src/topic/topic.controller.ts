import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiBody, ApiHeader } from "@nestjs/swagger";
import { TopicService } from "./topic.service";
import { SalesforceTopicDto } from "./DTOs/create-salesforce-topic.dto";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";
import { TransformInterceptor } from "src/shared/interceptors/transform.interceptor";

@ApiTags("Topic")
@Controller("salesforce/topic")
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @UseInterceptors(TransformInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  @ApiBody({ type: SalesforceTopicDto })
  create(@Body() salesforceTopic: SalesforceTopicDto) {
    console.log(
      "🚀 ~ TopicController ~ create ~ salesforceTopic controller body:",
      salesforceTopic
    );
    return this.topicService.create(salesforceTopic);
  }
}
