import passport from 'passport';
import {Strategy as GitHubStrategy} from 'passport-github';
import User from '../../api/models/user';
import config from '../../config';

passport.use(new GitHubStrategy({
  clientID: config.oAuth.github.clientID,
  clientSecret: config.oAuth.github.clientSecret,
  callbackURL: config.oAuth.github.callbackURL
}, (accessToken, refreshToken, profile, done) => {

  User.findOne({provider: 'github', 'social.id': profile.id}).exec().then(user => {

    if (!user) {
      user = new User({
        name: profile.displayName,
        username: profile.username,
        email: profile._json.email || '',
        provider: 'github',
        photo: profile._json.avatar_url,
        'social.id': profile.id,
        'social.info': profile._json
      });
    } else {
      user.social.info = profile._json;
      user.photo = profile._json.avatar_url;
      user.lastLogin = Date.now();
    }

    user.save().then(user => done(null, user)).catch(err => done(err));

  }).catch(err => done(err));

}));
