import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import apiClient from "@/lib/apiClient"


//This next auth handle login session/send token to BE

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    accessToken?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

export const authOptions : AuthOptions = {
    providers : [

        CredentialsProvider({ 
            name : "Credentials",
            credentials : {
                identifier: {label : "Email or Username", type: "text"},
                password: {label: "Password", type: "password"},
            },
        async authorize(credentials, req){
            try{
                const res = await apiClient.post("/auth/token", {
                    identifier: credentials?.identifier,
                    password: credentials?.password
                });
                const user = res.data

                if(user && user.id){
                    return user;
                } else {
                    return null
                } 
            } catch( error){
                console.error("Error when authorizing", error);
                return null;
            }

        }
        })
    ],
    session : {
        strategy: "jwt",
    },

    //call back 
    callbacks : {
        async jwt({token, user}){
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}){
            if (session.user) {
                session.user.id = token.id;
            }
            session.accessToken = token.accessToken;
            return session;
        },
    }
    
}
//handler
const handler = NextAuth(authOptions);
export {handler as GET, handler as POST}