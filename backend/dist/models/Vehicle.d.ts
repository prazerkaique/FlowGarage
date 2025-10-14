import { Model } from 'sequelize';
declare class Vehicle extends Model {
    id: number;
    garageId: number;
    brand: string;
    model: string;
    year: number;
    modelYear?: number;
    price: number;
    mileage: number;
    bodyType: string;
    doors: number;
    transmission: string;
    steering: string;
    fuel: string;
    color: string;
    leatherSeats: boolean;
    multimediaSystem: boolean;
    absBreaks: boolean;
    xenonHeadlights: boolean;
    electricLock: boolean;
    armored: boolean;
    auction: boolean;
    description: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Vehicle;
//# sourceMappingURL=Vehicle.d.ts.map