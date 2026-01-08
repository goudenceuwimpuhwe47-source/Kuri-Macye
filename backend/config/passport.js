const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.CALLBACK_URL,
                passReqToCallback: true
            },
            async (req, accessToken, refreshToken, profile, done) => {
                const state = req.query.state ? JSON.parse(req.query.state) : {};
                const role = state.role || 'customer';

                const newUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    role: role, // Assign requested role
                    isVerified: true // Google accounts are pre-verified
                };

                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        if (user.status === 'blocked') {
                            return done(null, false, { message: 'Your account has been blocked' });
                        }
                        return done(null, user);
                    } else {
                        // Check if email already exists
                        user = await User.findOne({ email: newUser.email });
                        if (user) {
                            if (user.status === 'blocked') {
                                return done(null, false, { message: 'Your account has been blocked' });
                            }
                            // Link googleId to existing user
                            user.googleId = profile.id;
                            await user.save();
                            return done(null, user);
                        } else {
                            user = await User.create(newUser);
                            return done(null, user);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};
