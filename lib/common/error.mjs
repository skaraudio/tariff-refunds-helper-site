export class ErrorWithDetails extends Error {
   constructor(msg, details) {
      super(msg);
      this.details = details;
   }
}

export class ErrorWithStatus extends Error {
   constructor(msg, code) {
      super(msg);
      this.statusCode = code;
   }
}

export function myInvariant(check, message) {
   if (!check) {
      throw new Error(message);
   }
}
