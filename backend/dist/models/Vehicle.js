import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Garage from './Garage.js';
class Vehicle extends Model {
    id;
    garageId;
    brand;
    model;
    year;
    modelYear;
    price;
    mileage;
    bodyType;
    doors;
    transmission;
    steering;
    fuel;
    color;
    leatherSeats;
    multimediaSystem;
    absBreaks;
    xenonHeadlights;
    electricLock;
    armored;
    auction;
    description;
    createdAt;
    updatedAt;
}
Vehicle.init({
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
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    modelYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    mileage: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bodyType: {
        type: DataTypes.ENUM('sedan', 'suv', 'hatch', 'pickup', 'convertible', 'wagon', 'van', 'other'),
        allowNull: false,
    },
    doors: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transmission: {
        type: DataTypes.ENUM('automatic', 'manual'),
        allowNull: false,
    },
    steering: {
        type: DataTypes.ENUM('electric', 'hydraulic', 'mechanical'),
        allowNull: false,
    },
    fuel: {
        type: DataTypes.ENUM('gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid'),
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    leatherSeats: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    multimediaSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    absBreaks: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    xenonHeadlights: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    electricLock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    armored: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    auction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'vehicles',
});
// Definindo a relação entre Garage e Vehicle
Vehicle.belongsTo(Garage, { foreignKey: 'garageId' });
Garage.hasMany(Vehicle, { foreignKey: 'garageId' });
export default Vehicle;
//# sourceMappingURL=Vehicle.js.map