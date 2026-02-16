import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/config/database";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    //Invoke on sucessful sign in
    async signIn({ profile }) {
      //Connect to DB
      await connectDB();
      // Chek if user exist
      const userExists = await User.findOne({ email: profile.email });
      // if not create user
      if (!userExists) {
        // Truncate username if too long
        const username = profile.name.slice(0, 20);
        await User.create({
          email: profile.email,
          username,
          image: profile.picture,
        });
      }
      // return true to allow sign in
      return true;
    },
    async session({ session }) {
      // get user from DB
      const user = await User.findOne({ email: session.user.email });
      // assign user id from the session
      session.user.id = user._id.toString();
      // return session
      return session;
    },
  },
};
