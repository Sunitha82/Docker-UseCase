# Use Case 2: Setting Up a Development Database with Docker

## Overview

This guide will help you quickly spin up a PostgreSQL database for development purposes using Docker—without installing PostgreSQL directly on your system.

---

## Use Case

**Scenario:**  
You need a PostgreSQL database for development or testing, but you don't want to install it locally. Using Docker, you can launch a fully functional database in seconds.

---

## Prerequisites

- **None!**  
  Docker will automatically download the PostgreSQL image for you if you don't already have it.

---

## Steps

### 1. Run a PostgreSQL Container

This command will:
- Download the PostgreSQL 15 image (if not present)
- Create a database named `myapp`
- Set the `postgres` user's password to `mysecretpassword`
- Expose the database on port `5432`

```bash
docker run --name dev-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -d postgres:15
```

---

### 2. Connect to the Database

Open a shell inside the running PostgreSQL container and connect to the `myapp` database:

```bash
docker exec -it dev-postgres psql -U postgres -d myapp
```

---

### 3. (Optional) Enable Data Persistence with a Docker Volume

To persist your data between container restarts, use a Docker volume:

```bash
docker run --name dev-postgres-persistent \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=myapp \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  -d postgres:15
```

---

### 4. Stop and Remove the Container

When you're done, you can stop and remove the container:

```bash
docker stop dev-postgres
docker rm dev-postgres
```

**If you used a persistent volume and want to remove it as well:**

```bash
docker volume rm postgres_data
```

---

## Notes

- Replace `mysecretpassword` and `myapp` with your own values as needed.
- Make sure Docker is installed and running on your system.
- The default PostgreSQL port is `5432`. If this port is in use, update the `-p` flag accordingly.

---

Happy developing!