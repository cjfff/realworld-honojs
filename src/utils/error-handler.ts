import { ZodError } from 'zod';

export function formatZodError(error: ZodError): { errors: { body: string[] } } {
  const errorMessages = error.errors.map((err) => {
    const path = err.path.at(-1)
    let message = err.message.toLowerCase();
    
    // Format common validation messages
    if (message.includes('required')) {
      return `${path} can't be empty`;
    }
    if (message.includes('invalid')) {
      return `${path} is invalid`;
    }
    if (message.includes('too small')) {
      return `${path} is too short`;
    }
    
    // Default: combine path and message
    return `${path} ${message}`;
  });

  return {
    errors: {
      body: errorMessages,
    },
  };
}

export function formatError(message: string): { errors: { body: string[] } } {
  return {
    errors: {
      body: [message],
    },
  };
}

