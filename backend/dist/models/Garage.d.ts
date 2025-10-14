import { Model } from 'sequelize';
declare class Garage extends Model {
    id: number;
    name: string;
    cnpj: string;
    email: string;
    password: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Garage;
//# sourceMappingURL=Garage.d.ts.map