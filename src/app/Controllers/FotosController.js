import { Op } from 'sequelize';
import * as z from 'zod';

import Foto from '../models/Foto';
import User from '../models/User';

class FotosController {
  async index(req, res) {
    const {
      title,
      category,
      createdBefore,
      createdAfter,
      updatedBefore,
      updatedAfter,
      sort,
    } = req.query;

    const page = req.query.page || 1;
    const limit = req.query.limit || 25;

    let where = { user_id: req.params.userId };
    let order = [];

    if (title) {
      where = {
        ...where,
        title: {
          [Op.iLike]: title,
        },
      };
    }

    if (category) {
      where = {
        ...where,
        category: {
          [Op.like]: category,
        },
      };
    }

    if (createdBefore) {
      where = {
        ...where,
        createdAt: {
          [Op.lte]: new Date(createdBefore),
        },
      };
    }

    if (createdAfter) {
      where = {
        ...where,
        createdAt: {
          [Op.gte]: new Date(createdAfter),
        },
      };
    }

    if (updatedBefore) {
      where = {
        ...where,
        updatedAt: {
          [Op.lte]: new Date(updatedBefore),
        },
      };
    }

    if (updatedAfter) {
      where = {
        ...where,
        updatedAt: {
          [Op.gte]: new Date(updatedAfter),
        },
      };
    }

    if (sort) {
      order = sort.split(',').map((item) => item.split(':'));
    }

    const foto = await Foto.findAll({
      where,
      attributes: { exclude: ['user_id', 'userId'] },
      include: {
        model: User,
        attributes: ['id', 'user_name', 'email'],
        required: true,
      },
      order,
      limit,
      offset: limit * page - limit,
    });

    if (!foto || foto.length === 0) return res.status(404).json('Photo not found');

    return res.status(200).json(foto);
  }

  async show(req, res) {
    const foto = await Foto.findOne({
      where: { id: parseInt(req.params.id), user_id: parseInt(req.params.userId) },
      attributes: { exclude: ['user_id', 'userId'] },
      include: {
        model: User,
        attributes: ['id', 'user_name', 'email'],
        required: true,
      },
    });

    if (!foto || foto.length === 0) return res.status(404).json('Photo not found');

    return res.status(200).json(foto);
  }

  async create(req, res) {
    const schema = z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      image_url: z.string().min(1),
      user_id: z.number().int().min(1),
    });

    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) return res.status(400).json('Error on validating the schema');

    const {
      title,
      category,
      image_url,
      user_id,
    } = await Foto.create({
      ...req.body,
    });

    return res.status(201).json({
      title,
      category,
      image_url,
      user_id,
    });
  }

  async update(req, res) {
    const schema = z.object({
      title: z.string().optional(),
      category: z.string().optional(),
      image_url: z.string().optional(),
    });

    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) return res.status(400).json('Error on validating the schema');

    const foto = await Foto.findOne({
      where: { id: parseInt(req.params.id) },
      attributes: { exclude: ['user_id', 'userId'] },
    });

    if (!foto) return res.status(404).json('Photo not found');

    await foto.update(
      {
        ...req.body,
      },
      {
        where: {
          id: req.params.id,
        },
      },
    );

    return res.status(200).json(foto);
  }

  async destroy(req, res) {
    const foto = await Foto.findByPk(parseInt(req.params.id));

    if (!foto) return res.status(404).json('Photo not found');

    await foto.destroy();

    return res.status(200).json(foto);
  }

  async destroyAll(req, res) {
    const fotos = await Foto.findAll({
      where: {
        userId: req.params.userId,
      },
    });
    await fotos.destroy();
    return res.status(200).json();
  }
}

export default new FotosController();
