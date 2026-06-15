import { Request } from '@core/request';
import { Response } from '@core/response';
import { BodyParserOptions, NextFunction } from './types';

const defaultOptions: BodyParserOptions = {
  limit: 1024 * 1024, // 1MB default
  type: ['application/json', 'application/x-www-form-urlencoded']
};

// JSON Parser middleware
export function jsonParser(options: BodyParserOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if content type is JSON
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/json')) {
      return next();
    }
    
    // Check content length
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > opts.limit!) {
      res.status(413).json({ error: 'Request entity too large' });
      return;
    }
    
    await parseBody(req, opts);
    next();
  };
}

// URL-Encoded parser middleware
export function urlencodedParser(options: BodyParserOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/x-www-form-urlencoded')) {
      return next();
    }
    
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > opts.limit!) {
      res.status(413).json({ error: 'Request entity too large' });
      return;
    }
    
    await parseBody(req, opts);
    next();
  };
}

// Text parser middleware
export function textParser(options: BodyParserOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('text/plain')) {
      return next();
    }
    
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > opts.limit!) {
      res.status(413).json({ error: 'Request entity too large' });
      return;
    }
    
    await parseBody(req, opts);
    next();
  };
}

// Raw body parser (for binary data, webhooks, etc.)
export function rawParser(options: BodyParserOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > opts.limit!) {
      res.status(413).json({ error: 'Request entity too large' });
      return;
    }
    
    await parseBody(req, opts);
    next();
  };
}

// Combined body parser (tries to detect based on content-type)
export function bodyParser(options: BodyParserOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'] || '';
    
    // Check content length
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > opts.limit!) {
      res.status(413).json({ error: 'Request entity too large' });
      return;
    }
    
    await parseBody(req, opts);
    next();
  };
}

// Core parsing logic
async function parseBody(req: Request, options: BodyParserOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let _body = '';
    let _chunks: Buffer[] = [];
    let _totalSize = 0;

    req.on('data', (chunk: Buffer) => {
      _totalSize += chunk.length;
      
      if (options.limit && _totalSize > options.limit) {
        reject(new Error('Body size exceeds limit'));
        return;
      }
      
      _chunks.push(chunk);
    });
    
    req.on('end', () => {
      _body = Buffer.concat(_chunks).toString();
      
      const contentType = req.headers['content-type'] || '';
      
      // Parse based on content type
      if (contentType.includes('application/json')) {
        try {
          req.body = _body ? JSON.parse(_body) : {};
        } catch (error) {
          req.body = {};
          // Don't throw, just set empty body
        }
      } 
      else if (contentType.includes('application/x-www-form-urlencoded')) {
        req.body = parseUrlEncoded(_body);
      }
      else if (contentType.includes('text/plain')) {
        req.body = _body;
      }
      else {
        // For other types, store raw body as buffer
        req.rawBody = Buffer.concat(_chunks);
        req.body = _body;
      }
      
      resolve();
    });
    
    req.on('error', (error: any) => {
      reject(error);
    });
  });
}

// Helper to parse URL-encoded data
function parseUrlEncoded(data: string): Record<string, any> {
  const result: Record<string, any> = {};
  
  if (!data) return result;
  
  const pairs = data.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      const decodedKey = decodeURIComponent(key);
      const decodedValue = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      
      // Handle array syntax (key[])
      if (decodedKey.endsWith('[]')) {
        const arrayKey = decodedKey.slice(0, -2);
        if (!result[arrayKey]) result[arrayKey] = [];
        result[arrayKey].push(decodedValue);
      } 
      // Handle nested objects (key[subkey])
      else if (decodedKey.includes('[')) {
        const match = decodedKey.match(/(\w+)\[(\w+)\]/);
        if (match) {
          const [_, parent, child] = match;
          if (!result[parent]) result[parent] = {};
          result[parent][child] = decodedValue;
        }
      }
      else {
        result[decodedKey] = decodedValue;
      }
    }
  }
  
  return result;
}

// Multipart/form-data parser (basic version)
export function multipartParser(options: BodyParserOptions & { 
  fields?: number; // Max number of fields
  files?: number; // Max number of files
} = {}) {
  const opts = { ...defaultOptions, fields: 20, files: 5, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('multipart/form-data')) {
      return next();
    }
    
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > opts.limit!) {
      res.status(413).json({ error: 'Request entity too large' });
      return;
    }
    
    try {
      req.body = await parseMultipart(req, contentType, opts);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Failed to parse multipart data' });
    }
  };
}

// Basic multipart parser (simplified)
async function parseMultipart(req: Request, contentType: string, options: BodyParserOptions & { fields?: number; files?: number }): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const boundary = getBoundary(contentType);
    if (!boundary) {
      reject(new Error('No boundary found in multipart content-type'));
      return;
    }
    
    let data = '';
    let chunks: Buffer[] = [];
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const result: Record<string, any> = {};
      
      // Simple boundary parsing (for basic use cases)
      const parts = buffer.toString().split(`--${boundary}`);
      
      for (const part of parts) {
        if (part === '--\r\n' || part === '' || part === '--') continue;
        
        // Extract name from Content-Disposition
        const nameMatch = part.match(/name="([^"]+)"/);
        if (nameMatch) {
          const name = nameMatch[1];
          const valueStart = part.indexOf('\r\n\r\n') + 4;
          let value = part.slice(valueStart);
          
          // Remove trailing \r\n
          if (value.endsWith('\r\n')) {
            value = value.slice(0, -2);
          }
          
          result[name] = value;
        }
      }
      
      resolve(result);
    });
    
    req.on('error', reject);
  });
}

function getBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=([^;]+)/);
  return match ? match[1] : null;
}

// Convenience middleware that combines common parsers
export function defaultBodyParser() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      await jsonParser()(req, res, next);
    } 
    else if (contentType.includes('application/x-www-form-urlencoded')) {
      await urlencodedParser()(req, res, next);
    }
    else if (contentType.includes('multipart/form-data')) {
      await multipartParser()(req, res, next);
    }
    else {
      await textParser()(req, res, next);
    }
  };
}