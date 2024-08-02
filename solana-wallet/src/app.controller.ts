import { Body, Controller, Get ,Post} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('checkBalance')
  checkBalance(@Body() pubKey) 
  {
    return  this.appService.checkBalance(pubKey);
  }

  @Post('airdrop')
  airdrop(@Body() pubKey) 
  {
    return  this.appService.airdrop(pubKey);
  }

  @Post('sendSolana')
  sendSolana(@Body() TransferDetails) 
  {
    return  this.appService.sendSolana(TransferDetails);
  }

  @Get('generateKeyPair')
  generateKeyPair() 
  {
    return  this.appService.generateKeyPair();
  }



  
}
