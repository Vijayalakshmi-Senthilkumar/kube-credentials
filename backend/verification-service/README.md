# Credential Verification Service

A microservice responsible for verifying digital credentials by communicating with the issuance service. This service is part of a distributed credential management system and is designed to run in a Kubernetes environment.

## Features

- Verify credential authenticity with the issuance service
- Track verification history
- Generate deterministic credential IDs (matching issuance service)
- Support for worker ID tracking (useful in distributed environments)
- Health check endpoint for monitoring
- In-memory verification record storage

## API Endpoints

### 1. Health Check
```
GET /api/verification/health
```
Returns the health status of the service, including:
- Service status
- Service name
- Worker ID (pod name in Kubernetes)
- Timestamp

### 2. Verify Credential
```
POST /api/verification/verify
```
Verifies a credential by checking with the issuance service.

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
- `200` - Verification completed (with valid/invalid status)
- `400` - Invalid request format
- `503` - Issuance service unavailable
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

- `PORT` - Port number (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `ISSUANCE_SERVICE_URL` - URL of the issuance service (default: http://localhost:3000)

## Development

The service is built with:
- TypeScript
- Express.js
- Jest for testing
- node-fetch for HTTP requests
- nodemon for development

## Docker Support

A Dockerfile is included for containerization. Build and run using:

```bash
docker build -t verification-service .
docker run -p 3001:3001 verification-service
```

## Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- Credential verification
- Integration with issuance service
- Error handling
- Health check endpoint
- API validation

## Integration with Issuance Service

This service depends on the issuance service for credential verification. It:
- Communicates with the issuance service via HTTP
- Maintains its own verification records
- Uses the same credential ID generation algorithm for consistency