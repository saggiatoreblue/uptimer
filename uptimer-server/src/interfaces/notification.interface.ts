export interface INotificationDocument {
  id?: Number;
  userId: number;
  groupName: string;
  emails: string;
  createdAt?: Date;
}

export interface IEmailLocals {
  sender?: string;
  appLink: string;
  appIcon: string;
  appName: string;
  subject?: string;
  username?: string;
}
