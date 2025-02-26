import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserWebCreatorRequest } from "@Web/UserWeb/Domain/UserWebCreatorRequest";
import { UserWebCreator } from "@Web/UserWeb/Domain/UserWebCreator";
import { SignupUserEvent } from "src/Shared/Domain/Event/User/SignupUserEvent";
import {v4} from 'uuid';

@Injectable()
export class CreateUserWebOnSharedUserCreated {

  constructor(
    @Inject('UserWebCreator') private userWebCreator: UserWebCreator
  ) {}

  @OnEvent('shared.user.signup', { async: true }) 
  async handleSignupUserEvent(event: SignupUserEvent) {

    await this.userWebCreator.create(
      new UserWebCreatorRequest(
        event.aggregateId,
        event.email,
        event.name
      )
    );

  }

}