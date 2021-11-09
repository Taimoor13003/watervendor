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
import { CategoryService } from "./services/implementations/category-service"
import { ICategoryService } from "./services/interfaces/icategory-service"
import { CategoryRepository } from "./repositories/implementations/category-repository"
import { ICategoryRepository} from "./repositories/interfaces/icategory-repository"
import { QuestionRepository } from "./repositories/implementations/question-repository";
import { IQuestionRepository } from "./repositories/interfaces/iquestion-repository";
import { QuestionService } from "./services/implementations/question-service";
import { IQuestionService } from "./services/interfaces/iquestion-service";
import { VisitRepository } from "./repositories/implementations/visit-repository";
import { IVisitRepository } from "./repositories/interfaces/ivisit-repository";
import { VisitService } from "./services/implementations/visit-service";
import { IVisitService } from "./services/interfaces/ivisit-service";


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
  
  container
  .bind<IQuestionService>(SERVICE_IDENTIFIER.QuestionService)
  .to(QuestionService);

  container
  .bind<IQuestionRepository>(SERVICE_IDENTIFIER.QuestionRepository) 
  .to(QuestionRepository);

  container
  .bind<IVisitService>(SERVICE_IDENTIFIER.VisitService)
  .to(VisitService);

  container
  .bind<IVisitRepository>(SERVICE_IDENTIFIER.VisitRepository) 
  .to(VisitRepository);

  container
  .bind<ICategoryService>(SERVICE_IDENTIFIER.CategoryService) 
  .to(CategoryService);

  container
  .bind<ICategoryRepository>(SERVICE_IDENTIFIER.CategoryRepository) 
  .to(CategoryRepository);


export function resolve<T>(type: symbol): T {
  return container.get<T>(type);
}
