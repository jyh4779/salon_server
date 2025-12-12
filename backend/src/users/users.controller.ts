import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll(@Query('search') search: string) {
        // BigInt 처리는 글로벌 인터셉터나 파이프에서 처리되기를 기대하지만, 
        // 여기서는 간단히 JSON 변환 시 BigInt 문제를 방지하기 위해 서비스 레벨에서 string conversion을 하거나,
        // NestJS 직렬화 설정을 따릅니다.
        // 현재 프로젝트 설정상 BigInt 이슈가 발생할 수 있으므로, 서비스에서 반환된 값을 그대로 리턴하되,
        // main.ts의 BigInt JSON 처리가 되어있다고 가정합니다.
        return this.usersService.findAll(search);
    }
}
