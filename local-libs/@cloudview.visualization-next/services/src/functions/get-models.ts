import type {PrimitiveInstanceImage, PrimitiveInstanceSvg} from '../classes';
import {ObjectApi} from '../apis';
import type {IObject} from '../types';

let getModelTimer = 0;
const modelSet = new Set<PrimitiveInstanceSvg | PrimitiveInstanceImage>();
const delay = 200;
const modelCache = {};
export const getModels = (primitive: PrimitiveInstanceSvg | PrimitiveInstanceImage): void => {
    window.clearTimeout(getModelTimer);
    if (primitive.modelId in modelCache) {
        primitive.model = modelCache[primitive.modelId];
        return;
    }
    modelSet.add(primitive);
    getModelTimer = window.setTimeout(async () => {
        const models = Array.from(modelSet);
        const modelIds = new Set();
        models.map(model => modelIds.add(model.modelId));
        const res = await ObjectApi.getAssets(Array.from(modelIds));
        if (res.state) {
            const objectList = res.data as IObject[];
            const objectMap = {};
            objectList.forEach(item => {
                objectMap[item.id] = item.content;
                modelCache[item.id] = item.content;
            });
            models.forEach(model => model.setModel(objectMap[model.modelId]));
        }
    }, delay);
};
