
import axios from 'axios';
import { API_GATEWAY_URL, API } from '@/lib/config/configuration';
import { ERROR_MESSAGES } from "@/lib/errors/errorCode";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"

// Refresh token function
async function refreshAccessToken(token: any) {
    try {
        console.log("Refreshing access token...");
            
        const response = await axios.post(`${API_GATEWAY_URL.BASE_URL}${API.REFRESH}`, {
            token: token.refreshToken
        });

        const refreshedTokens = response.data?.result;

        if (!refreshedTokens?.accessToken) {
            throw new Error("No access token in refresh response");
        }

        console.log("Token refresh successsful");    
        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            // if the refresh value is null or undefined, fall back to use the old refresh token
            refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
            accessTokenExpires: refreshedTokens.accessTokenExpires // Backend provides milliseconds
        }
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const {handlers, signIn, signOut, auth} = NextAuth({
    providers : [
        Credentials({
             credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            }, 
            authorize : async ( credentials) =>{
                try {
                    console.log("Attempting login with:", credentials?.identifier);
                    const identifier = typeof credentials?.identifier === "string" ? credentials.identifier : '';
                    
                    const res = await axios.post(`${API_GATEWAY_URL.BASE_URL}${API.LOGIN}`, {
                        email : identifier.includes('@') ? identifier : null,
                        username: identifier.includes('@') ? null : identifier,
                        password: credentials?.password
                    });
                
                    console.log("Login response:", res.data);
                    const result = res.data?.result;

                    if (result?.accessToken) {
                        return {
                            accessToken: result.accessToken,
                            refreshToken : result.refreshToken,
                            authenticated: result.authenticated,
                            role: result.role,
                            accessTokenExpires: result.accessTokenExpires, // Backend provides timestamp
                        };
                    }
                
                 throw new Error(ERROR_MESSAGES[1006]);
                } catch (error) {
                    console.error("Login error in authorize:", error);
                    if (axios.isAxiosError(error)){
                        const code = error.response?.data.code || 9999;
                        throw new Error(ERROR_MESSAGES[code]);
                    } else if (error instanceof Error){
                        throw error;
                    }
                    throw new Error(ERROR_MESSAGES[9999]);
                }
            } 
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {

            // Initial sign in
            if (account && user) {
                console.log("Initial JWT setup with user data", user);
                return {
                    ...token,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    role: user.role,
                    authenticated: user.authenticated,
                    accessTokenExpires: user.accessTokenExpires 
                }
            }

            // Return previous token if the access token has not expired yet
            const now = Date.now();
            const expiresAt = token.accessTokenExpires as number
           
            if (now < expiresAt) {
                console.log("Token still valid, returning existing token");
                return token;
            }

            // Access token has expired, try to refresh it
            console.log("Token expired, attempting refresh");
            return refreshAccessToken(token);
        },

        //transform session-cookie data -> session object
        async session({ session, token }) {
            console.log("Setting session with token data", token);

            session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : undefined;
            session.refreshToken = typeof token.refreshToken === 'string' ? token.refreshToken : undefined;
            session.user.role = typeof token.role === 'string' ? token.role : undefined;

            return session;
        }
    },
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: '/',
        error: '/',
    }
    
})
export const { GET, POST } = handlers




