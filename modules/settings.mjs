import {ModuleName} from "./ech-pf1.mjs";

export function registerSettings() {
    game.settings.register(ModuleName, "ShowPathfinder1eStandardActionPanel", {
        name: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelStandard.name`),
        hint: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelStandard.desc`),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        requiresReload : true
    });

    game.settings.register(ModuleName, "ShowPathfinder1eMovementActionPanel", {
        name: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelMove.name`),
        hint: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelMove.desc`),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        requiresReload : true
    });

    game.settings.register(ModuleName, "ShowPathfinder1eSwiftActionPanel", {
        name: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelSwift.name`),
        hint: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelSwift.desc`),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        requiresReload : true
    });

    game.settings.register(ModuleName, "ShowPathfinder1eFullActionPanel", {
        name: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelFull.name`),
        hint: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelFull.desc`),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        requiresReload : true
    });

    game.settings.register(ModuleName, "ShowPathfinder1eFreeActionPanel", {
        name: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelFree.name`),
        hint: game.i18n.localize(`ECHPF1.Settings.ShowActionPanelFree.desc`),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        requiresReload : true
    });

    game.settings.register(ModuleName, "ShowMacroPanel", {
        name: game.i18n.localize(`ECHPF1.Settings.ShowMacroPanel.name`),
        hint: game.i18n.localize(`ECHPF1.Settings.ShowMacroPanel.desc`),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        requiresReload : true
    });
}