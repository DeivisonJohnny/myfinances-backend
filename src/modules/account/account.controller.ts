import { Body, Controller, Post } from '@nestjs/common';
import AccountCreateDto from './dto/account-create.dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {

    constructor(private readonly accountService: AccountService) {}

    @Post()
    async create(@Body() body: AccountCreateDto) {  
        return this.accountService.create(body);
    }

}
