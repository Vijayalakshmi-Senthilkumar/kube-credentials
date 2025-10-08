import axios, { AxiosError } from 'axios';

const ISSUANCE_API_URL = process.env.REACT_APP_ISSUANCE_API_URL || 'http://localhost:3001';
const VERIFICATION_API_URL = process.env.REACT_APP_VERIFICATION_API_URL || 'http://localhost:3002';

export interface CredentialData {
  [key: string]: any;
}

export interface Credential {
  id: string;
  data: CredentialData;
  issuedBy: string;
  issuedAt: string;
}

export interface IssuanceResponse {
  success: boolean;
  message: string;
  credential?: Credential;
  alreadyIssued?: boolean;
  error?: string;
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
  error?: string;
}

class ApiService {
  async issueCredential(credentialData: CredentialData): Promise<IssuanceResponse> {
    try {
      const response = await axios.post<IssuanceResponse>(
        `${ISSUANCE_API_URL}/api/credentials/issue`,
        { credentialData },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<IssuanceResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
        throw new Error(axiosError.message || 'Failed to issue credential');
      }
      throw error;
    }
  }

  async verifyCredential(credentialData: CredentialData): Promise<VerificationResponse> {
    try {
      const response = await axios.post<VerificationResponse>(
        `${VERIFICATION_API_URL}/api/verification/verify`,
        { credentialData },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<VerificationResponse>;
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
        throw new Error(axiosError.message || 'Failed to verify credential');
      }
      throw error;
    }
  }

  async checkHealth(service: 'issuance' | 'verification'): Promise<any> {
    try {
      const url = service === 'issuance' 
        ? `${ISSUANCE_API_URL}/api/credentials/health`
        : `${VERIFICATION_API_URL}/api/verification/health`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`${service} service is unavailable`);
    }
  }
}

export const apiService = new ApiService();