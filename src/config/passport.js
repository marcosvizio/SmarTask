import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findByEmail, create } from '../dao/db/userRepository.js';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

      const email = profile.emails[0].value;
      let user = await findByEmail(email);

      if (user) {
        user.accessToken = accessToken;
        return done(null, user);
      }

      const fullName = profile.displayName.split(" ");
      const first_name = fullName[0];
      const last_name = fullName.slice(1).join(" ") || "";

      const newUser = await create({
        first_name,
        last_name,
        birthday: null,
        email,
        phone_number: null,
        password_hash: null,
      });

      // 🔥 también agregar el token al nuevo usuario
      newUser.accessToken = accessToken;

      return done(null, newUser);

    } catch (error) {
      return done(error, null);
    }
  }
));

export default passport;