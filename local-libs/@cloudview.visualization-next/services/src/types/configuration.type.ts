import type {EngineTypeEnum} from './constants.type';
import type {IBoard} from './board.type';

export type Models = Record<string, string>;

export interface IConfiguration {
    id?: string;
    name: string;
    enabled: boolean;
    engine_type: EngineTypeEnum;
    vnb_id?: string;
    public: boolean;
    tag?: string;
    thumb_id?: string;
    description: string;
    content?: IBoard[];
}
