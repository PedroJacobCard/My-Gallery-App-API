import jwt from 'jsonwebtoken';
import auth from '../../config/auth';

import User from '../models/User';

class SessionsController {
  async create(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) return res.status(401).json('User not found');

    if (!(await user.checkPassword(password))) {
      return res.status(401).json('Invalid password');
    }

    const { id, user_name } = user;

    return res
      .status(200)
      .json({
        user: {
          id,
          user_name,
          email,
        },
        token: jwt.sign({ id }, auth.secret, {
          expiresIn: auth.expires,
        }),
      });
  }
}

export default new SessionsController();
