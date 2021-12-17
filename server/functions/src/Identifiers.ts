const SERVICE_IDENTIFIER={
    UserService: Symbol.for("IUserService"),
    UserRepository: Symbol.for("IUserRepository"),
    // QuestionService: Symbol.for("IQuestionService"),
    // QuestionRepository: Symbol.for("IQuestionRepository"),
    // VisitService: Symbol.for("IVisitService"),
    // VisitRepository: Symbol.for("IVisitRepository"),
    AuthenticationService: Symbol.for("IAuthenticationService"),
    NotificationRepository: Symbol.for("INotificationRepository"),
    NotificationService: Symbol.for("INotificationService"),
    // CategoryService: Symbol.for("ICategoryService"),
    // CategoryRepository: Symbol.for("ICategoryRepository"),

} 

export default SERVICE_IDENTIFIER;