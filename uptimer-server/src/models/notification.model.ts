import { INotificationDocument } from "@app/interfaces/notification.interface";
import { sequelize } from "@app/server/database";
import { Optional, ModelDefined, DataTypes } from "sequelize";

import { UserModel } from "./user.model";

type NotificationCreationAttributes = Optional<
  INotificationDocument,
  "id" | "createdAt"
>;

const NotificationModel: ModelDefined<
  INotificationDocument,
  NotificationCreationAttributes
> = sequelize.define(
  "notifications",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emails: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["userId"],
      },
    ],
  }
) as ModelDefined<INotificationDocument, NotificationCreationAttributes>;

export { NotificationModel };
