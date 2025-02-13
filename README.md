# Daiana SafeAI

A Discord bot with AI capabilities, including voice synthesis and social media integration.

## Prerequisites

- Docker and Docker Compose
- Node.js 20.x (for local development)
- pnpm

## Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in the required environment variables in `.env`:
- `DISCORD_APPLICATION_ID`: Your Discord application ID
- `DISCORD_API_TOKEN`: Your Discord bot token
- `VENICE_API_KEY`: Your Venice API key

Optional variables can be configured based on which features you want to enable.

## Deployment

### Using the Deployment Script

The easiest way to deploy is using the provided script:

```bash
./deploy.sh
```

This will:
- Validate your environment
- Build the Docker containers
- Start the services
- Verify the health check

### Manual Deployment

If you prefer to deploy manually:

1. Build the containers:
```bash
docker-compose build
```

2. Start the services:
```bash
docker-compose up -d
```

3. Check the logs:
```bash
docker-compose logs -f
```

## Development

For local development:

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

## Health Check

The service exposes a health check endpoint at:
```
http://localhost:3000/health
```

## Monitoring

- View logs: `docker-compose logs -f`
- Check container status: `docker-compose ps`
- Monitor resources: `docker stats`

## Troubleshooting

If the service fails to start:
1. Check the logs: `docker-compose logs`
2. Verify environment variables are set correctly
3. Ensure required ports (3000, 4173) are available
4. Check the health endpoint: `curl http://localhost:3000/health`
