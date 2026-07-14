export function getConfig(key: string) {
    if (import.meta.env.DEV) {
        return (Window as any).AGENT_CONFIG[key];
    } else {
        return (Window as any).AGENT_CONFIG_PRODUCT[key];
    }
}
