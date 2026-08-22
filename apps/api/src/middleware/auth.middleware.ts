import { Request, Response, NextFunction } from 'express';
import { auth } from '../auth/better-auth.js';
import { fromNodeHeaders } from 'better-auth/node';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }
    
    (req as any).user = session.user;
    (req as any).session = session.session;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session.',
    });
  }
}
