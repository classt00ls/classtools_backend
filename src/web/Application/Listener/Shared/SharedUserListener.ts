import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SignupUserEvent } from "src/Shared/Domain/Event/User/SignupUserEvent";
import { UserWebCreatorRequest } from "../../Request/UserWeb/UserWebCreatorRequest";
import {v4} from 'uuid';
import { UserWebCreator } from "src/Web/Application/Service/UserWeb/UserWebCreator";

@Injectable()
export class SharedUserListener {

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