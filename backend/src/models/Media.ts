import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Vehicle from './Vehicle';

class Media extends Model {
  public id!: number;
  public vehicleId!: number;
  public type!: 'photo' | 'video';
  public url!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Media.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Vehicle,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('photo', 'video'),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'media',
  }
);

// Definindo a relação entre Vehicle e Media
Media.belongsTo(Vehicle, { foreignKey: 'vehicleId' });
Vehicle.hasMany(Media, { foreignKey: 'vehicleId' });

export default Media;