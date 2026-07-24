import type {IOption} from '../types';
import {EngineTypeEnum, PrimitiveTypeEnum} from '../types';
import {useLocale} from 'cloudview.ui-next';

export const getEngineTypes = (all = true): IOption[] => {
    const {t} = useLocale();
    const res: IOption[] = [];
    if (all) {
        res.push({
            value: EngineTypeEnum.ALL,
            label: t('vis.common.allEngine'),
        });
    }
    res.push(
        {
            value: EngineTypeEnum['2D'],
            label: t('vis.common.2DEngine'),
        },
        {
            value: EngineTypeEnum['3D'],
            label: t('vis.common.3DEngine'),
        }
    );
    return res;
};

export const getPrimitiveTypes = (): IOption[] => {
    const {t} = useLocale();
    return [
        {
            value: PrimitiveTypeEnum.SVG,
            label: t('vis.common.svgFile'),
        },
        {
            value: PrimitiveTypeEnum.IMAGE,
            label: t('vis.common.img'),
        },
    ];
};
