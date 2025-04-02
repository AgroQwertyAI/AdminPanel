import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: string;
            // ...other properties
            // role: UserRole;
        } & DefaultSession["user"];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}

// Authentication service functions using axios
const authService = {
    authenticate: async (username: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:8000/authorize', {
                username,
                password
            });
            
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Authentication error:', 
                    error.response?.data?.detail || error.message || 'Unknown error');
            } else {
                console.error('HTTP request failed:', error);
            }
            return null;
        }
    },

    createUser: async (username: string, password: string, name: string, role: string = "user") => {
        try {
            const response = await axios.post('http://localhost:8000/create_user', {
                username,
                password,
                name,
                role
            });
            
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('User creation error:', 
                    error.response?.data?.detail || error.message || 'Unknown error');
            } else {
                console.error('HTTP request failed:', error);
            }
            return null;
        }
    }
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
    providers: [
        DiscordProvider,

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "username" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const username = credentials.username as string;
                const password = credentials.password as string;

                return await authService.authenticate(username, password);
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
            return session;
        }
    },
} satisfies NextAuthConfig;