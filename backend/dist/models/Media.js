import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Vehicle from './Vehicle.js';
class Media extends Model {
    id;
    vehicleId;
    type;
    url;
    createdAt;
    updatedAt;
}
Media.init({
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
}, {
    sequelize,
    tableName: 'media',
});
// Definindo a relação entre Vehicle e Media
Media.belongsTo(Vehicle, { foreignKey: 'vehicleId' });
Vehicle.hasMany(Media, { foreignKey: 'vehicleId' });
export default Media;
//# sourceMappingURL=Media.js.map