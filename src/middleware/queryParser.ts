import { Request } from '@core/request';
import { Response } from '@core/response';
import url from 'url';
import { NextFunction } from './types';

/**
 * Configuration options for the query string parser middleware
 */
export interface QueryParserOptions {
  allowDots?: boolean;      // Convert dot notation to nested objects (user.name → { user: { name } })
  allowArrays?: boolean;    // Parse array syntax (ids[]=1&ids[]=2 → { ids: [1,2] })
  parseNumbers?: boolean;   // Auto-convert numeric strings to numbers
  parseBooleans?: boolean;  // Auto-convert 'true'/'false' to booleans
  decodeURIComponent?: boolean; // Decode URI components
}

const defaultOptions: QueryParserOptions = {
  allowDots: true,
  allowArrays: true,
  parseNumbers: true,
  parseBooleans: true,
  decodeURIComponent: true
};

/**
 * Creates a middleware that parses and transforms URL query parameters
 * Supports nested objects, arrays, type conversion, and URI decoding
 * 
 * @param options - Configuration options for query parsing
 * @returns Middleware function that processes query parameters and attaches them to req.query
 */
export function queryParser(options: QueryParserOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return (req: Request, _: Response, next: NextFunction) => {
    if (req.url) {
      const parsed = url.parse(req.url, true);
      let query = parsed.query as Record<string, any>;

      if (opts.decodeURIComponent) {
        query = decodeQueryValues(query);
      }

      if (opts.parseNumbers) {
        query = parseNumbers(query);
      }

      if (opts.parseBooleans) {
        query = parseBooleans(query);
      }

      if (opts.allowDots) {
        query = expandDotNotation(query);
      }

      if (opts.allowArrays) {
        query = parseArrays(query);
      }

      req.query = query;
    } else {
      req.query = {};
    }

    next();
  };
}

/**
 * Creates a simple query parser middleware that only parses the URL query string
 * without any transformations (no type conversion, dot notation, or arrays)
 * 
 * @returns Middleware function that parses query parameters and attaches them to req.query as strings
 */
export function simpleQueryParser() {
  return (req: Request, _: Response, next: NextFunction) => {
    if (req.url) {
      const parsed = url.parse(req.url, true);
      req.query = parsed.query as Record<string, string>;
    } else {
      req.query = {};
    }
    next();
  };
}

// Helper: Decode URI encoded values
function decodeQueryValues(query: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    const decodedKey = decodeURIComponent(key);

    if (Array.isArray(value)) {
      result[decodedKey] = value.map(v =>
        typeof v === 'string' ? decodeURIComponent(v) : v
      );
    } else if (typeof value === 'string') {
      result[decodedKey] = decodeURIComponent(value);
    } else {
      result[decodedKey] = value;
    }
  }

  return result;
}

// Helper: Convert numeric strings to numbers
function parseNumbers(query: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      result[key] = value.map(v => tryParseNumber(v));
    } else if (typeof value === 'string') {
      result[key] = tryParseNumber(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function tryParseNumber(value: string): any {
  const num = Number(value);
  return isNaN(num) ? value : num;
}

// Helper: Convert 'true'/'false' strings to booleans
function parseBooleans(query: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      result[key] = value.map(v => tryParseBoolean(v));
    } else if (typeof value === 'string') {
      result[key] = tryParseBoolean(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function tryParseBoolean(value: string): any {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

// Helper: Expand dot notation (user.name → { user: { name } })
function expandDotNotation(query: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }

      current[parts[parts.length - 1]] = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Helper: Parse array syntax (ids[]=1&ids[]=2)
function parseArrays(query: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!result[arrayKey]) {
        result[arrayKey] = [];
      }

      if (Array.isArray(value)) {
        result[arrayKey].push(...value);
      } else {
        result[arrayKey].push(value);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
