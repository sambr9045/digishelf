# digishelf

## Docker

Both backend and frontend can be run with Docker Compose and are exposed only on localhost.

- Host binding: `127.0.0.1`
- Backend host port: `8009` -> container `8000`
- Frontend host port: `5173` -> container `5173`

### Start

```bash
docker compose up --build
```

Backend URL:

```text
http://127.0.0.1:8009
```

Frontend URL:

```text
http://127.0.0.1:5173
```

### Stop

```bash
docker compose down
```