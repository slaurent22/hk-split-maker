import type { IconDefinition } from "../asset/icons/icon-directory.json";

export async function getIconDirectory(): Promise<Record<string, IconDefinition>> {
    const { default: module, } = await import("../asset/icons/icon-directory.json");
    return module;
}

async function boss(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/boss-icons.json");
    return module;
}

async function charm(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/charm-icons.json");
    return module;
}

async function collectible(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/collectible-icons.json");
    return module;
}

async function enemy(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/enemy-icons.json");
    return module;
}

async function event(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/event-icons.json");
    return module;
}

async function item(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/item-icons.json");
    return module;
}

async function location(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/location-icons.json");
    return module;
}

async function skill(): Promise<Record<string, string>> {
    const { default: module, } = await import("../asset/icons/skill-icons.json");
    return module;
}

export type IconClass =
    "boss" |
    "charm" |
    "collectible" |
    "enemy" |
    "event" |
    "item" |
    "location" |
    "skill";

export type IconFetcher = () => Promise<Record<string, string>>;

const Icons: Record<IconClass, IconFetcher> = {
    boss,
    charm,
    collectible,
    enemy,
    event,
    item,
    location,
    skill,
};

export default Icons;
