import { config } from "dotenv";
import passport from "passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { getRepository } from "typeorm";
import { User } from "../entities";

config();

const opts: StrategyOptions = {
  secretOrKey: process.env.SECRET || "",
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
};

passport.use(
  new Strategy(
    opts,
    async ({ id }, done) => {
    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ id });
      if (!user) throw new Error("User not found");
      return done(null, user.getUserInfo());
    } catch (error) {
      done(null, false);
    }
  })
);
