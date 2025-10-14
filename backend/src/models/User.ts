import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Garage from './Garage';

class User extends Model {
  public id!: number;
  public garageId!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'seller';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    garageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Garage,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'seller'),
      allowNull: false,
      defaultValue: 'seller',
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

// Definindo a relação entre Garage e User
User.belongsTo(Garage, { foreignKey: 'garageId' });
Garage.hasMany(User, { foreignKey: 'garageId' });

export default User;