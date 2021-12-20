export enum MediaType {
  Video = 1,
  Image = 2,
  file = 3,
}

export enum OptionType {
  select = "select",
  input = "input",
}

export enum QuestionType {
  mcq = "mcq",
  list = "list",
}

export enum GenderType {
  male = "male",
  female = "female"
}

export enum LoginSource {
  facebook = "facebook",
  google = "google",
  apple = "apple",
  default = "default",
}

export enum VisitStatus {
  inProgress = "inProgress",
  complete = "complete"
}

// export enum PrismaModel {
//   "user",
//   "post",
//  "profile"
// }
export enum PrismaModel {
  user = "user",
  post = "post",
  profile = "profile"
}