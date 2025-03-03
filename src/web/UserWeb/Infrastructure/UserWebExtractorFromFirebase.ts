import { Injectable } from "@nestjs/common";
import { EventEmitter2, EventEmitterReadinessWatcher } from "@nestjs/event-emitter";
import { DomainEvent } from "@Shared/Domain/Event/DomainEvent";
import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";
import { UserWebId } from "@Web/UserWeb/Domain/UserWebId";
import * as admin from 'firebase-admin';
import * as path from 'path';
import { UserWebRepository } from "../Domain/UserWebRepository";

@Injectable()
export class UserWebExtractorFromFirebase {

    constructor(
        private userwebRepo: UserWebRepository,
        private eventEmitter: EventEmitter2,
		private eventEmitterReadinessWatcher: EventEmitterReadinessWatcher
    ) {

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(
              path.resolve(__dirname, '../../../../../misc/firebase.json') // Ruta a tu archivo JSON
            ),
          });
        }
      }

    public async execute(token: string): Promise<UserWeb> {

        let uid, email;
        const decodedToken = await admin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
        email = decodedToken.email || null; // El email puede ser null si no está configurado

        // Comprobar si el usuario ya existe
        const existingUser = await this.userwebRepo.search(new UserWebId(uid));

        if(!existingUser) {
          console.log('No tenemos user, lo creamos')
          const newUser = UserWeb.create(
              uid,
              email,
              ''
          );

          console.log('No tenemos user, lo guardamos')
          this.userwebRepo.save(newUser);

          // Publicamos los eventos de dominio desde el caso de uso
          const events = newUser.pullDomainEvents();
          await this.eventEmitterReadinessWatcher.waitUntilReady();
          await Promise.all(
            events.map(async (event: DomainEvent) => {
              await this.eventEmitter.emit(
                event.eventName,
                event.toPrimitives()
              );
            })
          );
        }

        console.log('enviamos existingUser')
        return UserWeb.create(
            uid,
            email,
            ''
        );
    }
}