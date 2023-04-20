export type CloudFlareZone = {
  id: string;
  name: string;
  status: string | "active";
  paused: boolean;
  type: string | "full";
  developmentMode: number | 0;
  nameServers: string[];
  modifiedOn: Date;
  createdOn: Date;
  activatedOn: Date;
  owner: {
    id: string;
    type: string | "user";
    email: string;
  };
  account: {
    id: string;
    name: string;
  };
  permissions: string[];
};
