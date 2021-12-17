import "reflect-metadata";
import { Container } from "inversify";
import SERVICE_IDENTIFIER from "./identifiers";
import { IUserRepository } from "./repositories/interfaces/iuser-repository";
import { UserService } from "./services/implementations/user-service";
import { UserRepository } from "./repositories/implementations/user-repository";
import { AuthenticationService } from "./services/implementations/authentication-service";
import { IAuthenticationService } from "./services/interfaces/iauthentication-service";
import { IUserService } from "./services/interfaces/iuser-service";
import { NotificationRepository } from "./repositories/implementations/notification-repository";
import { INotificationRepository } from "./repositories/interfaces/inotification-repository";
import { NotificationService } from "./services/implementations/notification-service";
import { INotificationService } from "./services/interfaces/inotification-service";


let container = new Container();

container
  .bind<IUserRepository>(SERVICE_IDENTIFIER.UserRepository)
  .to(UserRepository);

container
  .bind<IUserService>(SERVICE_IDENTIFIER.UserService)
  .to(UserService);

  container
  .bind<IAuthenticationService>(SERVICE_IDENTIFIER.AuthenticationService)
  .to(AuthenticationService);


  container
  .bind<INotificationService>(SERVICE_IDENTIFIER.NotificationService)
  .to(NotificationService);

  container
  .bind<INotificationRepository>(SERVICE_IDENTIFIER.NotificationRepository) 
  .to(NotificationRepository);
  


export function resolve<T>(type: symbol): T {
  return container.get<T>(type);
}
