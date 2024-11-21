import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SignupUserEvent } from "src/Shared/Domain/Event/User/SignupUserEvent";
import { UserWebCreator } from "../../Service/UserWeb/UserWebCreator";
import { UserWebCreatorRequest } from "../../Request/UserWeb/UserWebCreatorRequest";
import {v4} from 'uuid';

@Injectable()
export class SharedUserListener {

  constructor(
    private userWebCreator:UserWebCreator
  ) {}

  @OnEvent('shared.user.SignupUser', { async: true }) 
  async handleSignupUserEvent(event: SignupUserEvent) {

    console.log('Guai !!   ja tenim SignupUserEvent : ', event);

    await this.userWebCreator.create(
      new UserWebCreatorRequest(
        v4(),
        [],
        []
      )
    );

    console.log('Guai !!   ja tenim UserWebCreator : ');

  }

}