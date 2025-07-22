import { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert('./firebase-service-account.json')
  });
}

export interface AuthenticatedRequest extends Request {
    userId?: string;
    user?: any;
}

export const verifyFirebaseToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided or invalid format. Expected: Bearer <token>' 
      });
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = await getAuth().verifyIdToken(token);

    req.userId = decodedToken.uid;
    req.user = decodedToken;

    next();
  } catch (error: any) { 
    console.error('Token verification error:', error);

    if (error?.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    if (error?.code === 'auth/argument-error') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    return res.status(401).json({ 
      message: 'Invalid token',
      error: error?.message || 'Unknown error'
    });
  }
};