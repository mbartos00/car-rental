import { JwtPayload } from "@/types";
import { decodeJwt } from "jose";

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    return decodeJwt<JwtPayload>(token);
  } catch {
    return null;
  }
};

export default decodeJwtPayload;
