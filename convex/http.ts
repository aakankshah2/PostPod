import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Registers /.well-known/openid-configuration and /api/auth/* routes
// used by @convex-dev/auth for JWT issuance and JWKS discovery.
auth.addHttpRoutes(http);

export default http;
