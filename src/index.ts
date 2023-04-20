import YAML from "yaml";
import fs from "fs";
import { IPSb, IPify, CloudFlareClient } from "./apis";
import { IGetIP } from "./interfaces";
import { LogLevel, Logger } from "./logger";
import { getSha1Hash } from "./utils";
import { LogLevelString } from "./logger";

type TargetRecords = {
  [zone in string]: {
    id: string | undefined;
    records: {
      name: string;
      id: string | undefined;
      value: string | undefined;
    }[];
  };
};

let token: string;
let interval: number = 0;
let targetRecords: TargetRecords = {};
let client: CloudFlareClient;
let checkIPTimer: NodeJS.Timeout;
let logger: Logger = new Logger(LogLevel.DISABLE, "");

function reloadConfig() {
  logger.i("Reloading config...");
  const config = YAML.parse(fs.readFileSync("config.yml", "utf8"));

  const logLevelIndex = LogLevelString.indexOf(
    config["log_level"] ?? LogLevelString[LogLevel.DISABLE]
  );
  const logLevel: LogLevel =
    logLevelIndex <= 4 && logLevelIndex >= 0
      ? (logLevelIndex as LogLevel)
      : LogLevel.DISABLE;
  const logDir = config["logs"] ?? "";
  logger.setLogLevel(logLevel);
  logger.setOutput(logDir);
  logger.i(
    `Log level is set to ${LogLevelString[logLevel]}, logs will be saved to ${logDir}`
  );

  let tokenValue = config["token"];

  if (typeof tokenValue !== "string") {
    // throw new Error("Invalid cloudflare's token");
    logger.e("Invalid cloudflare's token, Only a string is allowed");
    tokenValue = "";
  }

  if (tokenValue.length != 40)
    logger.w("Length of the token is not 40, the token may be invalid");
  token = tokenValue;

  getSha1Hash(token)
    .then((hash) => {
      logger.i(
        `Cloudflare's token has been set, the SHA1 of the token is: ${hash}`
      );
    })
    .catch((err) => {
      logger.w(`Failed to get SHA1 of the token, ${err}`);
    });

  const intervalValue = config["interval"];
  interval =
    typeof intervalValue === "number" && intervalValue > 0
      ? intervalValue
      : 120;
  logger.i(`The interval for checking IP is set to ${interval} seconds`);

  const givenRecords = config["records"];
  const newRecords: TargetRecords = {};
  Object.keys(givenRecords).forEach((zone) => {
    newRecords[zone] = {
      id: undefined,
      records: givenRecords[zone].map((record: string) => {
        return {
          name: record === "@" ? zone : `${record}.${zone}`,
          id: undefined,
          value: undefined,
        };
      }),
    };
  });
  targetRecords = newRecords;

  client = new CloudFlareClient(token, logger);

  if (checkIPTimer) clearInterval(checkIPTimer);
  checkIPTimer = setInterval(checkAndUpdateIP, interval * 1000);
  logger.i("DDNS process is running");
}

function syncRecords(zone: string, id: string) {
  if (!client) return;
  if (!targetRecords[zone]) return;
  logger.i(`Syncing records of zone ${zone}`);
  client
    .listDNSRecords(id)
    .then((returnedRecords) => {
      targetRecords[zone].records.forEach((targetRecord) => {
        const returnedRecord = returnedRecords.find(
          (r) => r.record === targetRecord.name
        );
        if (returnedRecord) {
          targetRecord.id = returnedRecord.id;
          logger.i(
            `Found record ${targetRecord.name}, set cache to: ${targetRecord.value} -> ${returnedRecord.content}`
          );
          targetRecord.value = returnedRecord.content;
        }
      });
    })
    .catch((err) => {
      logger.e(`Failed to list records of zone ${zone}, ${err}`);
    });
}

async function syncZones() {
  if (!client) return;
  logger.i("Syncing zones...");
  client
    .listZones()
    .then((zones) => {
      zones.forEach((zone) => {
        if (!targetRecords[zone.name]) return;
        logger.i(`Found zone ${zone.name}`);
        targetRecords[zone.name].id = zone.id;
        syncRecords(zone.name, zone.id);
      });
    })
    .catch((err) => {
      logger.e(`Failed to list zones, ${err}`);
    });
}

async function checkAndUpdateIP() {
  const getters: IGetIP[] = [new IPSb(), new IPify()];

  logger.i("Checking IP...");

  for (const getter of getters) {
    try {
      const ip = await getter.getIP();
      logger.i(`Got IP: ${ip}`);
      Object.keys(targetRecords).forEach((zone) => {
        if (!targetRecords[zone].id) return;
        targetRecords[zone].records.forEach((record) => {
          if (!record.id) return;
          if (record.value === ip) return;
          logger.i(`Updating ${record.name} to ${record.value} -> ${ip}`);
          client
            .patchDNSRecord(targetRecords[zone].id!, record.id, {
              content: ip,
              comment: `Updated by ts-ddns at ${new Date().toLocaleString()}`,
            })
            .then((newRecord) => {
              record.value = newRecord.content;
            })
            .catch((err) => {
              logger.e(`Failed to update ${record.name}, ${err}`);
            });
        });
      });
      break;
    } catch (err) {
      logger.w(`Failed to get IP from ${getter.constructor.name}, ${err}`);
    }
  }
}

reloadConfig();

syncZones();

fs.watchFile("config.yml", () => {
  logger.i("Config file changed, reloading...");
  reloadConfig();
  syncZones();
});

// sync every 30 minutes
setInterval(syncZones, 30 * 60 * 1000);
logger.i("Syncing zones every 30 minutes");
