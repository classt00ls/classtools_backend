import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SignupUserEvent } from "src/Shared/Domain/Event/User/SignupUserEvent";

@Injectable()
export class SharedUserListener {

  @OnEvent('shared.user.SignupUser', { async: true }) 
  handleSignupUserEvent(event: SignupUserEvent) {
    console.log('Guai !!   ja tenim SignupUserEvent : ', event);
  }

}