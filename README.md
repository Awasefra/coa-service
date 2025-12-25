# COA Service (Change of Authorization)

Service ini digunakan untuk mengirim **RADIUS CoA / Disconnect-Request** ke NAS (Mikrotik / BRAS) secara **asynchronous**, **terkontrol**, dan **ter-log dengan baik**.

## Features
- Express API
- RADIUS CoA (UDP 3799)
- Queue dengan concurrency control
- Grouping per NAS
- Delay antar user
- Logging harian

## Struktur Folder
```
src/
├── index.js
├── app.js
├── routes/coa.routes.js
├── services/coa.service.js
├── queues/coa.queue.js
├── utils/logger.js
├── utils/delay.js
├── logs/
```

## Install
```bash
npm install
```

## Run
```bash
npm run dev
```

## Endpoint
POST /coa/kick-per-nas  
POST /coa/kick-multi-nas

## Logging
Log tersimpan per hari:
```
src/logs/DDMMYYYY.log
```

## Catatan
Gunakan IP whitelist / token untuk keamanan production.
