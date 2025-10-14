import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
class Garage extends Model {
    id;
    name;
    cnpj;
    email;
    password;
    createdAt;
    updatedAt;
}
Garage.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
}, {
    sequelize,
    tableName: 'garages',
});
export default Garage;
//# sourceMappingURL=Garage.js.map