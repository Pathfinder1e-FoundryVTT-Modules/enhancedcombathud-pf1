import {ModuleName} from "./ech-pf1.mjs";

export function registerSettings() {
    game.settings.register(ModuleName, "HealthBarWidthScale", {
        name: game.i18n.localize(ModuleName + ".Settings.HealthBarWidthScale.name"),
        hint: game.i18n.localize(ModuleName + ".Settings.HealthBarWidthScale.descrp"),
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0.1,
            max: 2,
            step: 0.01
        },
        default: 1,
        onChange: () => {
            ui.ARGON.render()
        }
    });

    game.settings.register(ModuleName, "HealthBarHeightScale", {
        name: game.i18n.localize(ModuleName + ".Settings.HealthBarHeightScale.name"),
        hint: game.i18n.localize(ModuleName + ".Settings.HealthBarHeightScale.descrp"),
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0.1,
            max: 2,
            step: 0.01
        },
        default: 1,
        onChange: () => {
            ui.ARGON.render()
        }
    });
}