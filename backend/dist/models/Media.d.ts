import { Model } from 'sequelize';
declare class Media extends Model {
    id: number;
    vehicleId: number;
    type: 'photo' | 'video';
    url: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Media;
//# sourceMappingURL=Media.d.ts.map