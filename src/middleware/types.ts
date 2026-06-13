export type NextFunction = () => void;

export interface BodyParserOptions {
  limit?: number; // Size limit in bytes
  type?: string | string[]; // Content types to parse
}