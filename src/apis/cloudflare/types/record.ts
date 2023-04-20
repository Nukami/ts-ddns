export type CloudFlareRecord = {
  id: string;
  zoneId: string;
  zone: string;
  record: string;
  type: string | "A";
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  locked: boolean;
  comment: string;
  tags: any[];
  createdOn: Date;
  modifiedOn: Date;
};
