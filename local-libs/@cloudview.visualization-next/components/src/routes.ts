import {RouterView} from 'vue-router';
import {VisRouteNames} from '@cloudview.visualization-next/services';

export function getVisRoutes(parentPath = '/') {
    parentPath = parentPath.endsWith('/') ? parentPath : parentPath + '/';
    const isDev = (import.meta as any).env?.DEV ?? false;
    return [
        {
            path: `${parentPath}primitive`,
            name: 'primitive',
            component: RouterView,
            redirect: `${parentPath}primitive/list`,
            children: [
                {
                    path: 'list',
                    name: VisRouteNames.PRIMITIVE_MGT,
                    meta: {label: 'vis.primitive.primitiveManage'},
                    component: async () => {
                        if (isDev) {
                            await import('./primitive-mgt/style');
                        } else {
                            await import('./primitive-mgt/style/css');
                        }
                        return import('./primitive-mgt');
                    },
                },
                {
                    path: 'editor/:id',
                    name: VisRouteNames.PRIMITIVE_EDITOR,
                    meta: {label: 'vis.primitive.primitiveEdit'},
                    component: async () => {
                        if (isDev) {
                            await import('./primitive-editor/style');
                        } else {
                            await import('./primitive-editor/style/css');
                        }
                        return import('./primitive-editor');
                    },
                },
            ],
        },
        {
            path: `${parentPath}configuration`,
            name: 'configuration',
            component: RouterView,
            redirect: `${parentPath}configuration/list`,
            children: [
                {
                    path: 'list',
                    name: VisRouteNames.CONFIGURATION_MGT,
                    meta: {label: 'vis.configuration.configurationManage'},
                    component: async () => {
                        if (isDev) {
                            await import('./configuration-mgt/style');
                        } else {
                            await import('./configuration-mgt/style/css');
                        }
                        return import('./configuration-mgt');
                    },
                },
                {
                    path: 'editor/:id',
                    name: VisRouteNames.CONFIGURATION_EDITOR,
                    meta: {label: 'vis.configuration.configurationEdit'},
                    component: async () => {
                        if (isDev) {
                            await import('./configuration-editor/style');
                        } else {
                            await import('./configuration-editor/style/css');
                        }
                        return import('./configuration-editor');
                    },
                },
                {
                    path: 'browse/:id',
                    name: VisRouteNames.CONFIGURATION_BROWSER,
                    meta: {label: 'vis.configuration.configurationBrowser'},
                    component: async () => {
                        if (isDev) {
                            await import('./configuration-browser/style');
                        } else {
                            await import('./configuration-browser/style/css');
                        }
                        return import('./configuration-browser');
                    },
                },
            ],
        },
    ];
}
