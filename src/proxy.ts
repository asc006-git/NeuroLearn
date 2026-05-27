import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
});

export default authMiddleware;
export const proxy = authMiddleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/summaries/:path*",
    "/quiz-lab/:path*",
    "/smart-notes/:path*",
    "/analytics/:path*",
    "/settings/:path*",
  ],
};
