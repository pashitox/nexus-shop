import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}




export {}; // ⚡ Obligatorio para que TS lo trate como módulo
