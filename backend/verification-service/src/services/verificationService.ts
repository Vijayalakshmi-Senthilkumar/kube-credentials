import { db, VerificationRecord } from '../database/db';
import * as crypto from 'crypto';
import * as os from 'os';
import fetch from 'node-fetch';

export interface VerificationRequest {
  credentialData: Record<string, any>;
}

export interface VerificationResponse {
  success: boolean;
  status: 'valid' | 'invalid';
  message: string;
  verifiedBy: string;
  verifiedAt: string;
  credentialId?: string;
  issuedBy?: string;
  issuedAt?: string;
}

export class VerificationService {
  private workerId: string;
  private issuanceServiceUrl: string;

  constructor() {
    this.workerId = this.generateWorkerId();
    // In Kubernetes, this will be the service name
    // For local development, use localhost
    this.issuanceServiceUrl = process.env.ISSUANCE_SERVICE_URL || 'http://localhost:3001';
  }

  private generateWorkerId(): string {
    const hostname = os.hostname();
    return hostname;
  }

  public getWorkerId(): string {
    return this.workerId;
  }

  private generateCredentialId(data: Record<string, any>): string {
    // Generate same deterministic ID as issuance service
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  public async verifyCredential(request: VerificationRequest): Promise<VerificationResponse> {
    const verifiedAt = new Date().toISOString();
    const credentialId = this.generateCredentialId(request.credentialData);

    try {
      // Check with issuance service if credential exists
      const issuanceCheck = await this.checkWithIssuanceService(request.credentialData);

      const verificationRecord: VerificationRecord = {
        credentialId,
        verifiedBy: this.workerId,
        verifiedAt,
        status: issuanceCheck.exists ? 'valid' : 'invalid',
        issuedBy: issuanceCheck.issuedBy,
        issuedAt: issuanceCheck.issuedAt
      };

      // Save verification record
      db.saveVerification(verificationRecord);

      if (issuanceCheck.exists) {
        return {
          success: true,
          status: 'valid',
          message: `Credential is valid. Originally issued by ${issuanceCheck.issuedBy}`,
          verifiedBy: this.workerId,
          verifiedAt,
          credentialId,
          issuedBy: issuanceCheck.issuedBy,
          issuedAt: issuanceCheck.issuedAt
        };
      } else {
        return {
          success: true,
          status: 'invalid',
          message: 'Credential not found or invalid',
          verifiedBy: this.workerId,
          verifiedAt,
          credentialId
        };
      }
    } catch (error) {
      console.error('Verification error:', error);
      throw new Error(`Failed to verify credential: ${error}`);
    }
  }

  private async checkWithIssuanceService(credentialData: Record<string, any>): Promise<{
    exists: boolean;
    issuedBy?: string;
    issuedAt?: string;
  }> {
    try {
      // Try to issue the credential - if it already exists, we'll get that info back
      const response = await fetch(`${this.issuanceServiceUrl}/api/credentials/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credentialData }),
      });

      if (!response.ok) {
        console.error('Issuance service returned error:', response.status);
        return { exists: false };
      }

      const data: any = await response.json();

      if (data.success && data.credential) {
        return {
          exists: true,
          issuedBy: data.credential.issuedBy,
          issuedAt: data.credential.issuedAt
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error checking with issuance service:', error);
      // If we can't reach issuance service, we can't verify
      throw new Error('Unable to connect to issuance service');
    }
  }
}

export const verificationService = new VerificationService();