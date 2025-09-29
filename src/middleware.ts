import { NextRequest, NextResponse } from "next/server";
import { auth } from "./app/api/auth/[...nextauth]/route";
export async function middleware(req: NextRequest) {
    console.log("Middleware is running");
    const pathName = req.nextUrl.pathname;
    console.log("Pathname:", pathName);

    const session = await auth();
    
    const publicRoutes = ["/", "/doctor"];

    //routes require authenticaition
    const protectedRoutes = ["/profile", "/prescriptioon-test", "/appointment"];

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route => pathName.startsWith(route));

    // Redirect unauthenticated users trying to access protected routes to home page
    // The home page will show login/register modals via the navbar
    if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if(session?.user?.role) {
        const role = session.user.role;
        console.log("User role from session:", role);
        if(pathName === "/" && role === "DOCTOR"){
            console.log("Redirecting to /doctor");
            return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, req.url));
        }
    } else {
        console.log("No session or no role found");
        console.log("Session:", session);
    }
 
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}