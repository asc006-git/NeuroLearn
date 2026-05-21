import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
});

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
