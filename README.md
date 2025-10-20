# 🐳 Dockerized Node.js Service — CI/CD via GitHub Actions

A simple Node.js service with Basic Auth, dockerized and automatically deployed to a remote Linux server using GitHub Actions and Docker Compose.

---

## 📁 Project Structure

```
dockerized-node-service/
├─ app/
│  ├─ server.js          # Node.js service (with Basic Auth)
│  ├─ package.json       # npm config
│  ├─ .env.example       # sample environment variables (no secrets)
├─ Dockerfile            # builds the container image
├─ docker-compose.yml    # runtime config for server deployment
├─ .dockerignore         # excludes secrets and build junk
├─ .gitignore            # protects envs, keys, and node_modules
└─ .github/
   └─ workflows/
      └─ deploy.yml      # GitHub Actions CI/CD workflow
```

---

## 🧠 Features

- Simple Node.js HTTP service:
  - `/` → returns `Hello, world!`
  - `/secret` → protected by Basic Auth (env-based credentials)
- Uses `.env` for runtime secrets (not baked into image)
- Dockerized for easy deployment
- GitHub Actions workflow:
  - Builds Docker image
  - Pushes to GitHub Container Registry (GHCR)
  - SSH deploys to EC2 (or any Linux host) via Docker Compose
  - Auto-restarts on new commits

---

## 🚀 Local Development

```bash
cd app
cp .env.example .env
npm install
npm start
```

Test endpoints:

```bash
curl http://localhost:3000/
curl -u admin:supersecret http://localhost:3000/secret
```

---

## 🐳 Run with Docker (Locally)

```bash
docker build -t my-node-service .
docker run --rm -p 3000:3000 --env-file app/.env my-node-service
```

Test again:

```bash
curl http://localhost:3000/
curl -u admin:supersecret http://localhost:3000/secret
```

---

## ☁️ Deploying to a Remote Server

### Prerequisites

- Ubuntu server (tested on 22.04 LTS)
- Docker + Docker Compose plugin installed
- Port **80** (or your `$APP_PORT`) open in security group and UFW
- Directory `/opt/node-service` available
- Public SSH key for GitHub Actions added to `~/.ssh/authorized_keys`

---

## 🔐 GitHub Secrets (for CI/CD)

| Name             | Example Value           | Description                                 |
|------------------|------------------------|---------------------------------------------|
| SERVER_HOST      | 18.141.xx.xx           | Public IP / DNS of EC2                      |
| SERVER_USER      | ubuntu                 | SSH username                                |
| SERVER_SSH_KEY   | (private key content)  | Private key for deploy access               |
| SERVER_SSH_PORT  | 22                     | (optional) SSH port                         |
| APP_PORT         | 80                     | Host port exposed by container              |
| SECRET_MESSAGE   | The eagle has landed.  | Message returned by `/secret`               |
| USERNAME         | admin                  | Basic Auth username                         |
| PASSWORD         | supersecret            | Basic Auth password                         |

---

## ⚙️ CI/CD Flow (`.github/workflows/deploy.yml`)

1. **Build & Push**
   - Builds Docker image from repo
   - Pushes to GHCR as:
     - `ghcr.io/al-fatah/dockerized-node-service:<commit-sha>`
     - `ghcr.io/al-fatah/dockerized-node-service:latest`
2. **Deploy**
   - SSHes into remote server
   - Writes `.env` from GitHub Secrets
   - Uploads `docker-compose.yml` pinned to that SHA
   - Runs:
     ```bash
     docker compose pull
     docker compose up -d
     ```
   - Cleans old images

---

## 🧩 Useful Commands

```bash
# On server (manual restart)
cd /opt/node-service
docker compose pull && docker compose up -d

# View logs
docker compose logs -f

# Stop container
docker compose down

# Clean old images
docker image prune -af
```

---

## 🧪 Testing Deployment

After GitHub Actions completes:

```bash
curl http://<SERVER_HOST>/
curl -u <USERNAME>:<PASSWORD> http://<SERVER_HOST>/secret
```

---

## 🛡 Security Notes

- `.env` is **never committed** or included in the Docker image.
- Secrets are managed through **GitHub Actions → Repository Secrets**.
- Container runs as a non-root user inside Docker.
- Use HTTPS (reverse proxy like Nginx/Caddy/Traefik) for production.

---

## 🩵 Troubleshooting

| Issue                                               | Fix                                                                 |
|-----------------------------------------------------|---------------------------------------------------------------------|
| `ssh: unable to authenticate`                       | Ensure correct `SERVER_USER` and deploy key is in `authorized_keys` |
| `denied: requested access to the resource is denied`| Ensure image path is lowercase and workflow logs in to GHCR         |
| Port in use                                         | Change `APP_PORT` secret or free port on server                     |
| Server can't pull from GHCR                         | Verify `docker login ghcr.io` in SSH step works                     |
| `.env` missing                                      | Check workflow wrote `/opt/node-service/.env`                       |

---

## 🧾 License

MIT © [al-fatah](https://github.com/al-fatah)
