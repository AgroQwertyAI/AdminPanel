import {  NextAuthOptions,  DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";


import bcrypt from "bcrypt";

/**
 * Module augmentation for `next-auth` types
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
      user: {
        id: string;
      } & DefaultSession["user"];
    }
  }

// Mock user database function - replace with actual DB query
const getUser = async (email: string) => {
    const mockUser = {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("password123", 10)
    };
    
    return email === mockUser.email ? mockUser : null;
  };

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);
  
          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            const user = await getUser(email);
            
            if (!user) return null;
            
            const passwordsMatch = await bcrypt.compare(password, user.password);
            
            if (passwordsMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email
              };
            }
          }
          
          console.log("Invalid credentials");
          return null;
        }
      })
    ],
    callbacks: {
      session: ({ session, token }: { session: DefaultSession; token: { sub?: string } }) => ({
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      }),
    }
  };