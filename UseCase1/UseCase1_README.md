# UseCase1 - Order Processor API (Dockerized Node.js/Express App)

This folder contains a simple Node.js application running Express, dockerized for easy deployment.

## Project Structure

- `Dockerfile` - Docker image build instructions
- `package.json` - Node.js project dependencies and scripts
- `server.js` - Main application file, serves HTTP endpoints

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- (Optional) [Node.js](https://nodejs.org/) installed, if you want to run locally without Docker

## How to Build and Run with Docker

1. **Clone this repository (if you have not):**
   ```sh
   git clone https://github.com/Sunitha82/Docker-UseCase.git
   cd Docker-UseCase/UseCase1
   ```

2. **Build the Docker image:**
   ```sh
   docker build -t order-processor:latest .
   ```

3. **Run the container:**
   ```sh
   docker run -p 3000:3000 order-processor:latest
   ```
   This maps port 3000 of your local machine to port 3000 inside the container.

4. **Access the API:**
   - Open your browser or use curl/Postman:
     - Main endpoint: [http://localhost:3000/](http://localhost:3000/) – should return `{"message":"Order Processor API is running!"}`
     - Health check: [http://localhost:3000/health](http://localhost:3000/health) – should return `{"status":"healthy"}`

## How it Works

- The `Dockerfile` uses `node:18-alpine` as the base image.
- It installs dependencies from `package.json` and sets up the work directory.
- The container exposes port 3000 and starts the app with `npm start`.

## Local Development (without Docker)

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the app:**
   ```sh
   npm start
   ```

3. **API is available at:** [http://localhost:3000/](http://localhost:3000/)

## Application Endpoints

- `GET /` — Returns `{ message: "Order Processor API is running!" }`
- `GET /health` — Returns `{ status: "healthy" }`

## Example Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

---

Feel free to modify and extend this use case as needed!