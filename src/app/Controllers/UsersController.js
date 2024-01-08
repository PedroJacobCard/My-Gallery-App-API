import { Op, UniqueConstraintError } from 'sequelize';
import { parseISO } from 'date-fns';
import * as z from 'zod';

import User from '../models/User';
import Foto from '../models/Foto';

class UsersController {
  async index(req, res) {
    const {
      userName,
      email,
      createdBefore,
      createdAfter,
      updatedBefore,
      updatedAfter,
      sort,
    } = req.query;

    const page = req.query.page || 1;
    const limit = req.query.limit || 25;

    let where = {};
    let order = [];

    if (userName) {
      where = {
        ...where,
        userName: {
          [Op.iLike]: userName,
        },
      };
    }

    if (email) {
      where = {
        ...where,
        email: {
          [Op.iLike]: email,
        },
      };
    }

    if (createdBefore) {
      where = {
        ...where,
        createdAt: {
          [Op.lte]: parseISO(createdBefore),
        },
      };
    }

    if (createdAfter) {
      where = {
        ...where,
        createdAt: {
          [Op.gte]: parseISO(createdAfter),
        },
      };
    }

    if (updatedBefore) {
      where = {
        ...where,
        updatedAt: {
          [Op.lte]: parseISO(updatedBefore),
        },
      };
    }

    if (updatedAfter) {
      where = {
        ...where,
        updatedAt: {
          [Op.gte]: parseISO(updatedAfter),
        },
      };
    }

    if (sort) {
      order = sort.split(',').map((item) => item.split(':'));
    }

    const data = await User.findAll({
      attributes: { exclude: ['password', 'password_hash'] },
      where,
      include: [
        {
          model: Foto,
          attributes: ['id'],
        },
      ],
      order,
      limit,
      offset: limit * page - limit,
    });

    return res.json(data);
  }

  async show(req, res) {
    const { email, password } = req.body;
    const schema = z.object({
      email: z.string().email().min(11),
      password: z.string().min(8),
    });

    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json('The body request does not pass in thevalidation');
    }

    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (password && !(await user.checkPassword(password))) {
      return res.status(401).json('Email or Password incorrect');
    }
    return res.status(200).json(user);
  }

  async create(req, res) {
    const { password, passwordConfirmation } = req.body;

    try {
      const schema = z.object({
        user_name: z.string().min(4, 'Name is too short'),
        email: z.string().email('Enter a valid email').min(11, 'Email is too short'),
        password: z.string().min(8, 'Password is too short'),
        passwordConfirmation: z.string().refine(
          (data) => data.password === data.passwordConfirmation,
          {
            message: "Passwords don't match",
            path: ['passWordConfirmation'],
          },
        ),
      });

      const validationResult = schema.safeParse(req.body);

      if (password.length < 8) {
        return res.status(400).json('Password is too short');
      }

      if (!validationResult.success) {
        return res.status(400).json('Error on validating the schema');
      }

      if (password !== passwordConfirmation) {
        return res.status(400).json('Passord and password confirmation do not match');
      }

      const {
        user_name,
        email,
        createdAt,
        updatedAt,
      } = await User.create(req.body);

      return res.status(201).json({
        user_name,
        email,
        createdAt,
        updatedAt,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError && error.fields && error.fields.email) {
        return res.status(400).json({ error: `User ${error.fields.email} already exists.` });
      }

      return res.status(500).json('Internal server error');
    }
  }

  async update(req, res) {
    const { oldPassword, password, passwordConfirmation } = req.body;

    const schema = z.object({
      user_name: z.string().min(4, 'User name is too short').optional(),
      email: z.string().email('Invalid e-mail address').min(11, 'Email is too short').optional(),
      oldPassword: z.string().min(8),
      password: z.string()
        .min(8)
        .optional(),
      passwordConfirmation: z.string()
        .refine((data) => data.password === data.passwordConfirmation, {
          message: "Passwords don't match",
          path: ['passwordConfirmation'],
        })
        .optional(),
    });

    const validationResult = schema.safeParse(req.body);

    if (password && password.length < 8) return res.status(401).json('Password is too short');

    if (!validationResult.success) return res.status(401).json('Error on validating the schema');

    if (password !== passwordConfirmation) return res.status(401).json('Password and passord confirmation do not match');

    const user = await User.findByPk(req.params.id);

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json('Password is incorrect');
    }

    await user.update(
      {
        ...req.body,
      },
      {
        where: {
          id: req.params.id,
        },
      },
    );

    return res.status(200).json(user);
  }

  async destroy(req, res) {
    const user = await User.findOne({
      attributes: { exclude: ['password_hash'] },
      where: {
        id: req.params.id,
      },
    });

    if (!user) return res.status(404).json('User not found');

    await user.destroy();

    return res.status(200).json(user);
  }
}

export default new UsersController();
