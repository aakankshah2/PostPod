// This file is read by Convex during deployment to discover the JWT issuer.
// The domain must be your Convex site URL (it hosts the JWKS endpoint via http.ts).
// Update the production domain before deploying to production.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
