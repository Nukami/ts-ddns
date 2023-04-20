import axios from "axios";
import { CloudFlareRecord, CloudFlareZone } from "./types";
import { Logger } from "../../logger";

export type CloudFlareToken = string;

export type CloudFlareOptions = {
  zone: { name: string } | { id: string };
};

export class CloudFlareClient {
  private __token: CloudFlareToken;
  private __logger: Logger | undefined;
  constructor(token: CloudFlareToken, logger?: Logger) {
    this.__token = token;
    this.__logger = logger;
  }

  async verify(): Promise<boolean> {
    this.__logger?.d("Verifying Cloudflare token");
    const resp = await axios.get(
      "https://api.cloudflare.com/client/v4/user/tokens/verify",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.__token,
        },
      }
    );
    this.__logger?.d("Finish verifying request", resp.data);
    return resp.data?.result?.status === "active";
  }

  async listZones(): Promise<CloudFlareZone[]> {
    this.__logger?.d("Listing zones");
    const resp = await axios.get("https://api.cloudflare.com/client/v4/zones", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.__token,
      },
    });
    this.__logger?.d("Finish listing request", resp.data);
    const result = resp.data?.result;
    if (!result) throw new Error("No result");
    const zones: CloudFlareZone[] = [];
    for (const item of result) {
      zones.push({
        id: item.id,
        name: item.name,
        status: item.status,
        paused: item.paused,
        type: item.type,
        developmentMode: item.development_mode,
        nameServers: item.name_servers,
        modifiedOn: new Date(item.modified_on),
        createdOn: new Date(item.created_on),
        activatedOn: new Date(item.activated_on),
        owner: {
          id: item.owner.id ?? "",
          type: item.owner.type ?? "",
          email: item.owner.email ?? "",
        },
        account: {
          id: item.account.id,
          name: item.account.name,
        },
        permissions: item.permissions,
      });
    }
    return zones;
  }

  async listDNSRecords(zoneId: string): Promise<CloudFlareRecord[]> {
    this.__logger?.d("Listing DNS records");
    const resp = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.__token,
        },
      }
    );
    this.__logger?.d("Finish listing request", resp.data);
    const result = resp.data?.result;
    if (!result) throw new Error("No result");
    const records: CloudFlareRecord[] = [];
    for (const item of result) {
      records.push({
        id: item.id,
        zoneId: item.zone_id,
        zone: item.zone_name,
        record: item.name,
        type: item.type,
        content: item.content,
        proxiable: item.proxiable,
        proxied: item.proxied,
        ttl: item.ttl,
        locked: item.locked,
        comment: item.comment ?? "",
        tags: item.tags,
        createdOn: new Date(item.created_on),
        modifiedOn: new Date(item.modified_on),
      });
    }
    return records;
  }

  async patchDNSRecord(
    zoneId: string,
    recordId: string,
    record: {
      content?: string;
      comment?: string;
      ttl?: number;
    }
  ): Promise<CloudFlareRecord> {
    const payload: { [key in string]: any } = {};
    if (record.content) payload.content = record.content;
    if (record.comment) payload.comment = record.comment;
    if (record.ttl) payload.ttl = record.ttl;
    this.__logger?.d("Updating DNS record");
    const resp = await axios.patch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.__token,
        },
      }
    );
    this.__logger?.d("Finish updating request", resp.data);
    const result = resp.data?.result;
    if (!result) throw new Error("No result");
    return {
      id: result.id,
      zoneId: result.zone_id,
      zone: result.zone_name,
      record: result.name,
      type: result.type,
      content: result.content,
      proxiable: result.proxiable,
      proxied: result.proxied,
      ttl: result.ttl,
      locked: result.locked,
      comment: result.comment ?? "",
      tags: result.tags,
      createdOn: new Date(result.created_on),
      modifiedOn: new Date(result.modified_on),
    };
  }
}
