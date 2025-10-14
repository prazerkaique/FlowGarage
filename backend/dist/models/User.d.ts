import { Model } from 'sequelize';
declare class User extends Model {
    id: number;
    garageId: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'seller';
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default User;
//# sourceMappingURL=User.d.ts.map