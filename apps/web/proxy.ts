import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/time/:path*",
    "/invoices/:path*",
    "/clients/:path*",
    "/settings/:path*",
  ],
};
