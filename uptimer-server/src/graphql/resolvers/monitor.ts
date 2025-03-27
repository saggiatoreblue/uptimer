import {
  AppContext,
  IMonitorArgs,
  IMonitorDocument,
} from "@app/interfaces/monitor.interface";
import {
  createMonitor,
  deleteSingleMonitor,
  getHeartbeats,
  getMonitorById,
  getUserActiveMonitors,
  getUserMonitors,
  startCreatedMonitors,
  toggleMonitor,
  updateSingleMonitor,
} from "@app/services/monitor.service";
import { getSingleNotificationGroup } from "@app/services/notification.service";
import { startSingleJob, stopSingleBackgroundJob } from "@app/utils/jobs";
import {
  appTimeZone,
  authenticateGraphQLRoute,
  resumeMonitors,
  uptimePercentage,
} from "@app/utils/utils";
import { some, toLower } from "lodash";
import { PubSub } from "graphql-subscriptions";
import { IHeartbeat } from "@app/interfaces/heartbeats.interface";

export const pubSub: PubSub = new PubSub();

export const MonitorResolver = {
  Query: {
    async getSingleMonitor(
      _: undefined,
      { monitorId }: { monitorId: number },
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);

      const monitor = await getMonitorById(monitorId!);
      return {
        monitors: [monitor],
      };
    },
    async getUserMonitors(
      _: undefined,
      { userId }: { userId: number },
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);

      const monitors = await getUserMonitors(userId!);
      return {
        monitors,
      };
    },

    async autoRefresh(
      _: undefined,
      { userId, refresh }: { userId: number; refresh: boolean },
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      if (refresh) {
        req.session = {
          ...req.session!,
          enableAutomaticRefresh: true,
        };
        startSingleJob(
          `${toLower(req.currentUser?.username)}`,
          appTimeZone,
          10,
          async () => {
            const monitors: IMonitorDocument[] =
              await getUserActiveMonitors(userId);
            pubSub.publish("MONITORS_UPDATED", {
              monitorsUpdated: {
                userId,
                monitors,
              },
            });
          }
        );
      } else {
        req.session = {
          ...req.session!,
          enableAutomaticRefresh: false,
        };
        stopSingleBackgroundJob(`${toLower(req.currentUser?.username)}`);
      }
      return {
        refresh,
      };
    },
  },
  Mutation: {
    async createMonitor(
      _: undefined,
      args: IMonitorArgs,
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);

      const body: IMonitorDocument = args.monitor!;
      const monitor: IMonitorDocument = await createMonitor(body);

      if (body.active && monitor?.active) {
        startCreatedMonitors(monitor, toLower(body.name), body.type);
      }

      return {
        monitors: [monitor],
      };
    },

    async toggleMonitor(
      _: undefined,
      args: IMonitorArgs,
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const { monitorId, userId, name, active } = args.monitor!;

      const results: IMonitorDocument[] = await toggleMonitor(
        monitorId!,
        userId,
        active as boolean
      );

      const hasActiveMonitors: boolean = some(
        results,
        (monitor: IMonitorDocument) => monitor.active
      );

      //stop autorefresh if there are no active monitors for user
      if (!hasActiveMonitors) {
        req.session = {
          ...req.session!,
          enableAutomaticRefresh: false,
        };
        stopSingleBackgroundJob(`${toLower(req.currentUser?.username)}`);
      }

      if (!active) {
        stopSingleBackgroundJob(name, monitorId);
      } else {
        resumeMonitors(monitorId!);
      }

      return {
        monitors: results,
      };
    },

    async updateMonitor(
      _: undefined,
      args: IMonitorArgs,
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const { monitorId, userId, monitor } = args!;
      const monitors: IMonitorDocument[] = await updateSingleMonitor(
        monitorId!,
        userId!,
        monitor!
      );
      return {
        monitors,
      };
    },

    async deleteMonitor(
      _: undefined,
      args: IMonitorArgs,
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const { monitorId, userId, type } = args!;
      await deleteSingleMonitor(monitorId!, userId!, type!);
      return {
        id: monitorId,
      };
    },
  },
  MonitorResult: {
    lastChanged: (monitor: IMonitorDocument) =>
      JSON.stringify(monitor.lastChanged),
    responseTime: (monitor: IMonitorDocument) =>
      monitor.responseTime
        ? parseInt(`${monitor.responseTime}`)
        : monitor.responseTime,
    notifications: (monitor: IMonitorDocument) =>
      getSingleNotificationGroup(monitor.notificationId!),

    heartbeats: async (monitor: IMonitorDocument): Promise<IHeartbeat[]> => {
      const heartbeats = await getHeartbeats(monitor.type, monitor.id!, 24);
      return heartbeats.slice(0, 16);
    },

    uptime: async (monitor: IMonitorDocument): Promise<number> => {
      const heartbeats: IHeartbeat[] = await getHeartbeats(
        monitor.type,
        monitor.id!,
        24
      );

      return uptimePercentage(heartbeats);
    },
  },

  Subscription: {
    monitorsUpdated: {
      subscribe: () => pubSub.asyncIterableIterator(["MONITORS_UPDATED"]),
    },
  },
};
