import Sequelize, { Model } from 'sequelize';

class Foto extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        category: Sequelize.STRING,
        image_url: Sequelize.STRING,
      },
      {
        sequelize,
      },
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default Foto;
