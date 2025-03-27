import { IHeartbeat } from "@app/interfaces/heartbeats.interface";
import {
  IMonitorDocument,
  IMonitorResponse,
} from "@app/interfaces/monitor.interface";
import logger from "@app/server/logger";
import { createMongoDBHeartBeat } from "@app/services/mongo.service";
// import { IEmailLocals } from "@app/interfaces/notification.interface";
import {
  getMonitorById,
  updateMonitorStatus,
} from "@app/services/monitor.service";
import dayjs from "dayjs";
import { mongodbPing } from "./monitors";

class MongoMonitor {
  errorCount: number;
  noSuccessAlert: boolean;
  // emailsLocals: IEmailLocals;

  constructor() {
    this.errorCount = 0;
    this.noSuccessAlert = true;
    // this.emailsLocals
  }

  async start(data: IMonitorDocument): Promise<void> {
    const { monitorId, url } = data;

    try {
      const monitorData: IMonitorDocument = await getMonitorById(monitorId!);

      const response: IMonitorResponse = await mongodbPing(url!);

      if (monitorData.connection !== response.status) {
        this.errorAssertionCheck(response.responseTime, monitorData);
      } else {
        this.successAssertionCheck(response, monitorData);
      }
    } catch (error) {
      const monitorData: IMonitorDocument = await getMonitorById(monitorId!);
      this.mongoDBError(monitorData, error);
    }
  }

  async errorAssertionCheck(
    responseTime: number,
    monitorData: IMonitorDocument
  ): Promise<void> {
    this.errorCount++;
    const timestamp = dayjs.utc().valueOf();
    const heartbeatData: IHeartbeat = {
      monitorId: monitorData.id!,
      status: 1,
      message: "Connection status incorrect",
      timestamp,
      responseTime,
      connection: "refused",
      code: 500,
    };
    await Promise.all([
      updateMonitorStatus(monitorData, timestamp, "failure"),
      createMongoDBHeartBeat(heartbeatData),
    ]);

    if (
      monitorData.alertThreshold > 0 &&
      this.errorCount > monitorData.alertThreshold
    ) {
      this.errorCount = 0;
      this.noSuccessAlert = false;
      // TODO: send error email
    }
    logger.info(
      `HTTP heartbeat failed assertions: Monitor ID ${monitorData.id}`
    );
  }

  async successAssertionCheck(
    response: IMonitorResponse,
    monitorData: IMonitorDocument
  ): Promise<void> {
    const heartbeatData: IHeartbeat = {
      monitorId: monitorData.id!,
      status: 0,
      message: response.message,
      timestamp: dayjs.utc().valueOf(),
      responseTime: response.responseTime,
      connection: response.status,
      code: response.code,
    };
    await Promise.all([
      updateMonitorStatus(monitorData, heartbeatData.timestamp, "success"),
      createMongoDBHeartBeat(heartbeatData),
    ]);

    if (!this.noSuccessAlert) {
      this.errorCount = 0;
      this.noSuccessAlert = true;
      // TODO: send success email
    }
    logger.info(`MongoDB heartbeat success: Monitor ID ${monitorData.id}`);
  }

  async mongoDBError(
    monitorData: IMonitorDocument,
    error: IMonitorResponse
  ): Promise<void> {
    logger.info(`MongoDB heartbeat failed: Monitor ID ${monitorData.id}`);

    this.errorCount += 1;
    const timestamp = dayjs.utc().valueOf();
    const heartbeatData: IHeartbeat = {
      monitorId: monitorData.id!,
      status: 1,
      code: error.code,
      message: error.message ?? "MongoDB connection failed",
      timestamp,
      responseTime: error.responseTime,
      connection: error.status,
    };

    await Promise.all([
      updateMonitorStatus(monitorData, timestamp, "failure"),
      createMongoDBHeartBeat(heartbeatData),
    ]);

    if (
      monitorData.alertThreshold > 0 &&
      this.errorCount > monitorData.alertThreshold
    ) {
      this.errorCount = 0;
      this.noSuccessAlert = false;
      // TODO: send error email
    }
  }
}

export const mongoMonitor: MongoMonitor = new MongoMonitor();
