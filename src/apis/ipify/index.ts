import axios from "axios";
import { validateIPV4 } from "../../utils/validator";
import { IGetIP } from "../../interfaces";
import { Logger } from "../../logger";

export class IPify implements IGetIP {
  private __logger: Logger | undefined;
  constructor(logger?: Logger) {
    this.__logger = logger;
  }

  async getIP(): Promise<string> {
    const uri = "https://api.ipify.org/";
    this.__logger?.d(`Getting IP from ${uri}`);
    const resp = await axios.get(uri);
    this.__logger?.d(`Responded from ${uri}`, resp.data);
    const newIp = resp.data.trim();
    if (!validateIPV4(newIp)) throw new Error(`Invalid IP address: ${newIp}`);
    return newIp;
  }
}
