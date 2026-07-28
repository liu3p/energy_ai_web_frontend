export function CloudViewResolver() {
    return {
        type: 'component' as const,
        resolve: (name: string) => {
            if (!name.startsWith('Cv')) {
                return;
            }
            return {
                name,
                from: 'cloudview.ui-next',
            };
        },
    };
}

export default CloudViewResolver;
