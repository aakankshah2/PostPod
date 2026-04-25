import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// All routes are public — auth is only required at the moment a user tries to
// spend/buy credits. The middleware still forwards the auth token when present.
export default convexAuthNextjsMiddleware(() => {});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
