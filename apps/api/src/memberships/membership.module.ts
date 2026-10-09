import { Module } from '@nestjs/common';
import { MemberShipService } from './membership.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './membership.entity';
import { MemberShipsController } from './membership.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Membership])],
  controllers: [MemberShipsController],
  providers: [MemberShipService],
  exports: [MemberShipService],
})
export class MemberShipModule {}
