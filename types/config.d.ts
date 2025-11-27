interface Config {
    clients: Clients
    switchCells: SwitchCell[]
    remoteConfig: RemoteCategory[]
}
interface Clients {
    [key: string]: "clash" | "clashr" | "quan" | "quanx" | "loon" | "mellow" | "ss" | "sssub" | "ssd" | "ssr" | "surfboard" | "surge&ver=2" | "surge&ver=3" | "surge&ver=4" | "trojan" | "v2ray" | "singbox" | "mixed" | "auto"
}
interface SwitchCell {
    title: string
    key: "strict" | "upload" | "emoji" | "add_emoji" | "remove_emoji" | "append_type" | "tfo" | "udp" | "list" | "sort" |
    "script" | "insert" | "scv" | "fdn" | "expand" | "append_info" | "prepend" | "classic" | "tls13"
}
interface RemoteConfigURL {
    label: string
    value: string
}
interface RemoteCategory {
    category: string
    items: RemoteConfigURL[]
}
interface SavedSubscription {
    id: string;
    title: string;
    content: string;
    subLink?: string;
    shortSubLink?: string;
    hasPassword: boolean;
    passwordHash?: string;
    createdAt: number;
    updatedAt: number;
}

interface TextModeParams {
    title: string;
    content: string;
    hasPassword: boolean;
    password: string;
    selectedId: string | null;
}

interface Params {
    mode: 'easy' | 'hard' | 'text';
    subLink: string;
    shortSubLink: string;
    shortSubLoading: boolean;
    backend: string;
    url: string;
    target: string;
    config: string;
    include: string;
    exclude: string;
    tfo: boolean;
    udp: boolean;
    scv: boolean;
    append_type: boolean;
    emoji: boolean;
    list: boolean;
};