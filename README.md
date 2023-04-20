# ts-ddns

ts-ddns is a DDNS service based on cloudflare.

It helps you to detect the changes of public IP address and update new IP to the records on cloudflare in time to ensure your domain is always pointed to your public IP.

# Usage

To use ts-ddns, following the steps below (based on ubuntu 22.04):

## 1. Prepare DDNS domain

1. Go to [Cloudflare dashboard](https://dash.cloudflare.com/)
2. Click `Add a site` to add an existing domain to cloudflare zones, or skip this step if you already have a zone added
   - You can purchase a new domain on cloudflare or some other domain name registrar such as [namecheap](https://www.namecheap.com/) and [GoDaddy](https://www.godaddy.com/) if you don't have any domain
3. Click an existing zone, for example, `example.com`, to enter the overview of this zone
4. Click `DNS`-`Records` to enter the DNS Records panel
5. Click `Add record` to add a record for our DDNS service. Let's use `ddns.example.com` as an example
   1. Select `A` in `Type` list
   2. In `Name (required)`, enter the prefix of your subdomain, we use `ddns` here
   3. In `IPv4 address (required)`, enter any IPv4 address value, such as `12.34.56.78`, it will be overwrote by ts-ddns
   4. Switch off the `Proxy`
   5. In `TTL`, select `1 min`
   6. Click `Save`
   7. Now, we have successfully created a record for the subdomain `ddns.example.com` under the zone `example.com`

## 2. Create API Tokens

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) page.
2. Click `Create Token`
3. Create Custom Token
4. In `Create Custom Token` page, enter the name of the token
5. In `Permissions` section, Add `Zone:Zone:Read` and `Zone:DNS:Edit`
6. Create Token
7. Now you get a 40-byte-token like `9nLuODKqFleQF71PZOikRrjzgQzJft2AbYQkdJfG`

## 3. Prepare Node.js enviroment

1. `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
2. `sudo apt install nodejs build-essential -y`
3. `corepack enable`

## 4. Setup ts-ddns

1. Clone ts-ddns: `git clone https://github.com/Nukami/ts-ddns.git`
2. Assuming that we have cloned ts-ddns to `/git/ts-ddns`: `cd /git/ts-ddns`
3. `yarn install && yarn ncc`
4. Now we will get `/git/ts-ddns/dist/index.js` and `/git/ts-ddns/dist/config.yml`
5. Edit `config.yml`, for more information, go to [Configuration](#configuration)
6. Launch ts-ddns: `node /git/ts-ddns/dist/index.js`

## 5. Keep ts-ddns alive

ts-ddns can be launched by many ways.

We could also simply append `node /git/ts-ddns/dist/index.js &` to the end of `/etc/rc.local`, so that ts-ddns will automatically start on everytime we reboot.

But here, I would suggest using [PM2](https://pm2.keymetrics.io/), which can automatically start ts-ddns every time the system runs, and also automatically restart it in case of unexpected crashes

1. Install PM2: `sudo npm install pm2 -g`
2. Create PM2 startup script: `sudo pm2 startup`
   - You need to enable the startup script manually: `sudo systemctl enable pm2-root`
   - You also have to start pm2 service: `sudo systemctl start pm2-root`
3. Start ts-ddns: `pm2 start /git/ts-ddns/dist/index.js --name ts-ddns --watch`
4. Update your app list: `pm2 save`

# Configuration

The configuration file `config.yml` should be placed under the same directory as `index.js`

It should looks like:

```yaml
# Create from https://dash.cloudflare.com/profile/api-tokens
token: long-long-long-long-long-long-long-token
# Domains and names of their A records you want to update
records:
  example-a.com:
    # example-a.com
    - "@"
    # ddns.example-a.com
    - ddns
  example-b.com:
    # a.example-b.com
    - a
    # c.example-b.com
    - c
# Interval (in seconds) between two ip checking
interval: 120
# DISABLE, ERROR, WARN, INFO, DEBUG
log_level: INFO
# Path to the dir of logs files
logs: /var/log/ts-ddns
```

## 1. token

A 40-byte-string to access the api of cloudflare. See [2. Create API Tokens](#2-create-api-tokens)

## 2. records

ts-ddns supports multiple records of multiple zones.

In records field, you could specify numbers of zones(domain names), and numbers of prefixes of their subdomain.

You should list each domain name as a key, and its value should be the list of prefixes of subdomains

`ddns.example.com` as example:

```yaml
records:
  example.com:
    - "ddns"
```

## 3. interval

Specify how many seconds between two IP checks. Default to `120` seconds.

## 4. log_level

There are 5 levels of log:

1. DISABLE - Disable any log
2. ERROR - Record error only
3. WARN - Record error and warning messages
4. INFO - Record error, warning and information messages
5. DEBUG - Record error, warning, information and debug messages. Also dump objects of HTTP requests for debugging

## 5. logs

The directory where logs files should be outputed

Although ts-ddns can create directories automatically, if you encounter "permission denied" errors, you may need to create the directory manually.

Leave it empty or delete this field to disable the output of logs files

# Thanks

1. [Cloudflare](https://www.cloudflare.com/)
   - We obtained FREE and powerful domain name resolving service from Cloudflare
2. [IP Address Lookup - IP.SB](https://ip.sb/)
   - We detect the changes of our public IP address by requesting ip.sb periodically
3. [ipify](https://www.ipify.org/)
   - We use ipify as a backup when we are unable to access ip.sb in somehow
