import type { Request, Response } from 'express';
export declare const createVehicle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVehicles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const generatePublicCatalogToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPublicCatalog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPublicVehicles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPublicVehicleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVehicleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateVehicle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteVehicle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const searchVehicles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=vehicleController.d.ts.map