export function CloudViewResolver() {
    return {
        type: 'component' as const,
        resolve: (name: string) => {
            if (!name.startsWith('Cv')) {
                return;
            }
            if (name.startsWith('CvIcon') && name !== 'CvIcon') {
                return {
                    name,
                    from: 'cloudview.ui-next-icon',
                };
            }
            return {
                name,
                from: 'cloudview.ui-next',
            };
        },
    };
}

export default CloudViewResolver;
