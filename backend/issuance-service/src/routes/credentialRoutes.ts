import { Router, Request, Response } from 'express';
import { credentialService } from '../services/credentialService';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'issuance-service',
    workerId: credentialService.getWorkerId(),
    timestamp: new Date().toISOString()
  });
});

// Issue credential endpoint
router.post('/issue', (req: Request, res: Response) => {
  try {
    const { credentialData } = req.body;

    // Validate request
    if (!credentialData || typeof credentialData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: credentialData is required and must be an object'
      });
    }

    // Issue credential
    const result = credentialService.issueCredential({ credentialData });

    const statusCode = result.alreadyIssued ? 200 : 201;
    
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error issuing credential:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while issuing credential'
    });
  }
});

// Get worker info
router.get('/worker', (req: Request, res: Response) => {
  res.json({
    workerId: credentialService.getWorkerId(),
    timestamp: new Date().toISOString()
  });
});

export default router;