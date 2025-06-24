import CredentialsProvider from "next-auth/providers/credentials";
import httpClient from "@/lib/apiClient";
import NextAuth, { AuthOptions } from "next-auth";
import { ERROR_MESSAGES } from "@/errors/errorCode";
import axios from "axios";
import { API } from "@/lib/config/configuration";


export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    console.log("Attempting login with:", credentials?.identifier);
                    
                    const res = await httpClient.post(API.LOGIN, {
                        email: credentials?.identifier?.includes('@') ? credentials.identifier : null,
                        username: credentials?.identifier?.includes('@') ? null : credentials?.identifier,
                        password: credentials?.password
                    });
                    
                    console.log("Login response:", res.data);
                    const result = res.data?.result;

                    if (result?.token) {
                        return {
                            id: result?.userId || "placeholder",
                            accessToken: result.token,
                            authenticated: result.authenticated,
                        };
                    }
                
                 throw new Error(ERROR_MESSAGES[1006]);

                } catch (error) {
                    if (axios.isAxiosError(error)){
                        const code = error.response?.data.code || 9999;
                        throw new Error(ERROR_MESSAGES[code]);
                    } else if (error instanceof Error){
                        throw error;
                    }
                    console.error("error when login", error);
                    throw error;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                console.log("Setting JWT token with user data", user);
                token.accessToken = user.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Setting session with token data", token);
            session.accessToken = token.accessToken;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET ,
    pages: {
        signIn: '/',
        error: '/',  // You can create a custom error page if needed
    }
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 