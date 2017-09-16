# 72Fest CMS

The CMS for the 72Fest Backend

## Setup

Copy `config.json` file from backend app (located [here](https://github.com/72Fest/72FestWebApp/blob/master/server/config.example.json));

*Starting the server*

```bash
npm install
npm start
```

*Launching in the background*

```bash
npm install -g pm2
pm2 start app.config.js
```