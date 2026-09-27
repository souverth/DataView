# OrcaQ on Docker

All Docker definitions live in this folder. Every command runs from the **repo root**.

```
docker-compose.yml              ← entry point (includes docker/compose.yml + demo DBs)
docker/
├── Dockerfile                  ← production image (multi-stage, non-root, ~Node 22 Alpine)
├── Dockerfile.dev              ← dev image (nuxt dev, hot reload)
├── compose.yml                 ← production app service
├── compose.dev.yml             ← dev environment (+ demo DBs)
├── compose.demo-db.yml         ← demo databases, opt-in via profiles
└── scripts/
    └── create-runtime-package.mjs  ← picks runtime DB drivers from package.json
```

Copy `.env.example` to `.env` to override ports and credentials.

## Production

```sh
docker compose up -d --build        # http://localhost:9432
docker compose logs -f orcaq
docker compose down
```

Build or run the image without Compose:

```sh
docker build -f docker/Dockerfile -t orcaq .
docker run -d --name orcaq -p 9432:9432 orcaq
```

### How the image is built

| Stage          | Purpose                                                                                |
| -------------- | -------------------------------------------------------------------------------------- |
| `builder`      | `npm ci` + `nuxt build` → `.output`                                                    |
| `runtime-deps` | Installs only the DB drivers (pg, mysql2, sqlite3, oracledb, …), compiled for musl     |
| `runner`       | `.output` + drivers + DB CLIs (`pg_dump`, `mysqldump`, `sqlite3`), runs as `node` user |

The driver list lives in `docker/scripts/create-runtime-package.mjs`; versions are
pinned to `package-lock.json`. **If you add a new server-side DB driver, add it to that list.**

Low-memory Docker hosts can lower the build heap:
`docker build -f docker/Dockerfile --build-arg NODE_MAX_OLD_SPACE_SIZE=4096 -t orcaq .`

### SQLite files

The compose files mount `./data/sqlite` (host) to `/data/sqlite` (container).
Copy a database there, then create a SQLite connection with the path
`/data/sqlite/<file>.sqlite`. Use `ORCAQ_SQLITE_DIR` in `.env` to mount another folder.

- On Linux hosts the container runs as user `node` (uid 1000): the folder and files
  must be readable — and writable if you edit data — by that uid.
- Set `NUXT_PUBLIC_SQLITE3_CONNECTIONS_ENABLED=false` to disable file connections
  on shared deployments.

## Development (hot reload)

```sh
docker compose -f docker/compose.dev.yml up --build                     # http://localhost:3000
docker compose -f docker/compose.dev.yml --profile postgres up --build  # + demo PostgreSQL
```

- Source is bind-mounted; `node_modules`, `.nuxt`, `.output` stay inside the container.
- After changing `package.json` / `package-lock.json`:
  `docker compose -f docker/compose.dev.yml up --build --renew-anon-volumes`
- File watching uses polling (`CHOKIDAR_USEPOLLING`) so it works on Windows/macOS bind mounts.

## Demo databases

Nothing starts unless you pick a profile. Data is seeded with the Sakila sample
shared with `test/fixtures`.

| Profile    | Service    | Inside Docker (host in OrcaQ) | From your machine | Database |
| ---------- | ---------- | ----------------------------- | ----------------- | -------- |
| `postgres` | PostgreSQL | `postgres:5432`               | `localhost:15432` | `pagila` |
| `mysql`    | MySQL 8.4  | `mysql:3306`                  | `localhost:13306` | `sakila` |
| `mariadb`  | MariaDB 11 | `mariadb:3306`                | `localhost:13307` | `sakila` |
| `redis`    | Redis 7.4  | `redis:6379`                  | `localhost:16379` | —        |
| `mongodb`  | MongoDB 7  | `mongodb:27017`               | `localhost:27018` | —        |

Groups: `sql` = postgres + mysql + mariadb, `demo` = everything.
Default credentials: `orcaq` / `orcaq` (root password `root`).

Example connection string from OrcaQ running in Docker:
`postgresql://orcaq:orcaq@postgres:5432/pagila`

```sh
docker compose --profile demo up -d       # start all demo DBs + OrcaQ
docker compose --profile demo down -v     # stop and wipe demo data
```

> Demo DBs are separate from the test fixtures (`npm run test:fixtures:up`), which use
> their own compose project and default ports (5432, 3306, …).
