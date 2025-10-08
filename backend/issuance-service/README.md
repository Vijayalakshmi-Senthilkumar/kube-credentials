# Credential Issuance Service

A microservice responsible for issuing and managing digital credentials. This service is part of a distributed credential management system and is designed to run in a Kubernetes environment.

## Features

- Issue new digital credentials with unique identifiers
- Prevent duplicate credential issuance
- Generate deterministic credential IDs based on credential data
- Support for worker ID tracking (useful in distributed environments)
- Health check endpoint for monitoring
- In-memory credential storage

## API Endpoints

### 1. Health Check
```
GET /api/credentials/health
```
Returns the health status of the service, including:
- Service status
- Service name
- Worker ID (pod name in Kubernetes)
- Timestamp

### 2. Issue Credential
```
POST /api/credentials/issue
```
Issues a new credential or returns an existing one if already issued.

Request body:
```json
{
  "credentialData": {
    "name": "John Doe",
    "degree": "Bachelor of Science",
    "university": "Test University",
    "year": 2024
  }
}
```

Responses:
- `201` - New credential issued successfully
- `200` - Credential already exists
- `400` - Invalid request format
- `500` - Internal server error

## Setup and Running

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Start the service:
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

## Environment Variables

- `PORT` - Port number (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Development

The service is built with:
- TypeScript
- Express.js
- Jest for testing
- nodemon for development

## Docker Support

A Dockerfile is included for containerization. Build and run using:

```bash
docker build -t issuance-service .
docker run -p 3000:3000 issuance-service
```

## Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- Credential issuance
- Duplicate detection
- Error handling
- Health check endpoint
- API validation

## Integration with Verification Service

This service works in conjunction with the verification service. The verification service queries this service to validate credentials.