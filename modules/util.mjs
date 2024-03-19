import {simplifyFormula} from "../../../systems/foundryvtt-pathfinder1-master/module/utils/lib.mjs";

export function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function unique(array) {
    return array.filter((value, index, self) => self.indexOf(value) === index);
}

export function useAction(actionType, nest = true) {
    let panels = {}
    for (const panel of ui.ARGON.components.main) {
        panels[panel.actionType] = panel;
    }

    switch (actionType) {
        case "standard":
            if (!panels.standard?.isActionUsed) {
                panels.standard.isActionUsed = true;
                panels.standard.updateActionUse();
                if (nest) useAction("full", false);
            }
            break;
        case "move":
            if (!panels.move?.isActionUsed) {
                panels.move.isActionUsed = true;
                panels.move.updateActionUse();
                if (nest) useAction("full", false);
            } else {
                useAction("standard", false)
            }
            break;
        case "swift":
            if (!panels.swift?.isActionUsed) {
                panels.swift.isActionUsed = true;
                panels.swift.updateActionUse();
            }
            break;
        case "full":
            if (!panels.full?.isActionUsed) {
                panels.full.isActionUsed = true;
                panels.full.updateActionUse();
                if (nest) {
                    useAction("move", false)
                    useAction("standard", false)
                }
            }
            break;
    }
}

export async function createBuff(actor, buffId) {
    const buffs = {
        totalDefense: {
            "name": game.i18n.localize("ECHPF1.Buffs.Names.TotalDefense"),
            "type": "buff",
            "img": "systems/pf1/icons/feats/shield-master.jpg",
            "system": {
                "description": {
                    "value": game.i18n.localize("ECHPF1.Buffs.Descriptions.TotalDefense"),
                    "unidentified": ""
                },
                "tags": [],
                "changes": [{
                    "_id": "ntuwfvbl",
                    "formula": "@skills.acr.rank>=3?6:4",
                    "operator": "add",
                    "subTarget": "ac",
                    "modifier": "dodge",
                    "priority": 0,
                    "value": 0,
                    "target": "ac"
                }],
                "changeFlags": {
                    "loseDexToAC": false,
                    "noEncumbrance": false,
                    "mediumArmorFullSpeed": false,
                    "heavyArmorFullSpeed": false
                },
                "contextNotes": [{
                    "text": game.i18n.localize("ECHPF1.Buffs.ContextNotes.TotalDefense1"),
                    "target": "misc",
                    "subTarget": "ac"
                }, {
                    "text": game.i18n.localize("ECHPF1.Buffs.ContextNotes.TotalDefense2"),
                    "target": "attacks",
                    "subTarget": "attack"
                }],
                "links": {"children": []},
                "tag": "totalDefense",
                "useCustomTag": true,
                "flags": {"boolean": {}, "dictionary": {}},
                "scriptCalls": [],
                "subType": "temp",
                "active": false,
                "level": null,
                "duration": {"value": "1", "units": "round"},
                "hideFromToken": false,
                "uses": {"value": 0, "max": 0, "per": ""}
            },
            "effects": [],
        },
        fightingDefensively: {
            "name": game.i18n.localize("ECHPF1.Buffs.Names.FightingDefensively"),
            "type": "buff",
            "img": "systems/pf1/icons/feats/shield-master.jpg",
            "system": {
                "description": {
                    "value": game.i18n.localize("ECHPF1.Buffs.Descriptions.FightingDefensively"),
                    "unidentified": ""
                },
                "tags": [],
                "changes": [{
                    "_id": "zmpj4gpd",
                    "formula": "@skills.acr.rank>=3?3:2",
                    "subTarget": "ac",
                    "modifier": "dodge",
                    "operator": "add",
                    "priority": null
                }, {
                    "_id": "osyl628w",
                    "formula": "-4",
                    "subTarget": "attack",
                    "modifier": "untyped",
                    "operator": "add",
                    "priority": null
                }],
                "changeFlags": {
                    "loseDexToAC": false,
                    "noEncumbrance": false,
                    "mediumArmorFullSpeed": false,
                    "heavyArmorFullSpeed": false
                },
                "contextNotes": [],
                "links": {"children": []},
                "tag": "fightingDefensively",
                "useCustomTag": true,
                "flags": {"boolean": {}, "dictionary": {}},
                "scriptCalls": [],
                "subType": "temp",
                "active": false,
                "level": null,
                "duration": {"value": "1", "units": "round"},
                "hideFromToken": false,
                "uses": {"per": ""}
            },
            "effects": []
        }
    }

    const buff = buffs[buffId];
    if (!buff) {
        return null;
    }
    await actor.createEmbeddedDocuments("Item", [buff]);
    return actor.getItemByTag(buffId);
}

export const spellSchools = {
    abj: "PF1.SpellSchoolAbjuration",
    con: "PF1.SpellSchoolConjuration",
    div: "PF1.SpellSchoolDivination",
    enc: "PF1.SpellSchoolEnchantment",
    evo: "PF1.SpellSchoolEvocation",
    ill: "PF1.SpellSchoolIllusion",
    nec: "PF1.SpellSchoolNecromancy",
    trs: "PF1.SpellSchoolTransmutation",
    uni: "PF1.SpellSchoolUniversal",
    misc: "PF1.Misc",
};

export const abilityTypes = {
    ex: {
        short: "PF1.AbilityTypeShortExtraordinary",
        long: "PF1.AbilityTypeExtraordinary",
    },
    su: {
        short: "PF1.AbilityTypeShortSupernatural",
        long: "PF1.AbilityTypeSupernatural",
    },
    sp: {
        short: "PF1.AbilityTypeShortSpell-Like",
        long: "PF1.AbilityTypeSpell-Like",
    },
};
export const weaponProperties = {
    ato: "PF1.WeaponPropAutomatic",
    blc: "PF1.WeaponPropBlocking",
    brc: "PF1.WeaponPropBrace",
    dea: "PF1.WeaponPropDeadly",
    dst: "PF1.WeaponPropDistracting",
    dbl: "PF1.WeaponPropDouble",
    dis: "PF1.WeaponPropDisarm",
    fin: "PF1.WeaponPropFinesse",
    frg: "PF1.WeaponPropFragile",
    grp: "PF1.WeaponPropGrapple",
    imp: "PF1.WeaponPropImprovised",
    mnk: "PF1.WeaponPropMonk",
    nnl: "PF1.WeaponPropNonLethal",
    prf: "PF1.WeaponPropPerformance",
    rch: "PF1.WeaponPropReach",
    sct: "PF1.WeaponPropScatter",
    snd: "PF1.WeaponPropSunder",
    spc: "PF1.WeaponPropSpecial",
    thr: "PF1.WeaponPropThrown",
    trp: "PF1.WeaponPropTrip",
};

export function getDistanceSystem() {
    let system = game.settings.get("pf1", "distanceUnits"); // override
    if (system === "default") system = game.settings.get("pf1", "units");
    return system;
}

export function convertDistance(value, type = "ft") {
    const system = getDistanceSystem();
    switch (system) {
        case "metric":
            switch (type) {
                case "mi":
                    return [Math.round(value * 1.6 * 100) / 100, "km"];
                default:
                    return [Math.round((value / 5) * 1.5 * 100) / 100, "m"];
            }
        default:
            return [value, type];
    }
}

export function renderAttackString(action) {
    return action.item.attackArray.map((attack) => {
        const value = Math.floor(attack)
        return (value < 0 ? "-" : "+") + value
    }).join('/');
}

export function renderCriticalChanceString(action) {
    const critRange = action.data.ability.critRange;

    return (critRange === 20 ? "20" : `${critRange}-20`) + 'x' + (action.data.ability.critMult || `2`)
}

export function renderDamageString(action, rollData, options) {
    if (!action.hasDamage) return null;

    const actor = action.actor,
        item = action.item,
        actorData = actor?.system,
        actionData = action.data,
        combine = options.hash?.combine ?? true;

    const parts = [];

    const handleFormula = (formula, change) => {
        try {
            switch (typeof formula) {
                case "string": {
                    // Ensure @item.level and similar gets parsed correctly
                    const rd = formula.indexOf("@") >= 0 ? change?.parent?.getRollData() ?? rollData : {};
                    const newformula = simplifyFormula(formula, rd, {combine});
                    if (newformula != 0) parts.push(newformula);
                    break;
                }
                case "number":
                    if (formula != 0) parts.push(`${formula}`);
                    break;
            }
        } catch (err) {
            console.error(`Formula parsing error with "${formula}"`);
            parts.push("NaN");
        }
    };

    const handleParts = (parts) => parts.forEach(({formula}) => handleFormula(formula));

    // Normal damage parts
    handleParts(actionData.damage.parts);

    // Include ability score only if the string isn't too long yet
    const dmgAbl = actionData.ability.damage;
    const dmgAblMod = Math.floor((actorData?.abilities[dmgAbl]?.mod ?? 0) * (actionData.ability.damageMult || 1));
    if (dmgAblMod != 0) parts.push(dmgAblMod);

    // Include damage parts that don't happen on crits
    handleParts(actionData.damage.nonCritParts);

    // Include general sources. Item enhancement bonus is among these.
    action.allDamageSources.forEach((s) => {
        if (s.operator === "script") return;
        handleFormula(s.formula, s);
    });

    if (parts.length === 0) parts.push("NaN"); // Something probably went wrong

    const simplifyMath = (formula) =>
        formula
            .replace(/\s+/g, "") // remove whitespaces
            .replace(/\+-/g, "-") // + -n = -n
            .replace(/--/g, "+") // - -n = +n
            .replace(/-\+/g, "-") // - +n = -n
            .replace(/\+\++/g, "+"); // + +n = +n

    const semiFinal = simplifyMath(parts.join("+"));
    if (semiFinal === "NaN") return semiFinal;
    if (!combine) return semiFinal;
    // With combine enabled, the following turns 1d12+1d8+6-8+3-2 into 1d12+1d8-1
    const final = simplifyFormula(semiFinal, null, {combine});
    return simplifyMath(final);
}

export async function renderSaveString(action, rollData) {
    const saveType = game.i18n.localize(`PF1.SavingThrow${ucFirst(action.data.save.type)}`);

    let saveDC = action.data.save.dc;
    if(action.item.type === "spell") {
       saveDC += action.item.spellbook.baseDCFormula;
    }

    saveDC = (await RollPF.safeRoll(saveDC, rollData)).total;

    const threshold = game.i18n.localize("PF1.DCThreshold").replace('{threshold}', saveDC);

    return `${saveType} ${threshold}`;
}

export function renderTemplateString(action) {

    const targetType = game.i18n.localize(`PF1.MeasureTemplate${ucFirst(action.data.measureTemplate.type)}`);
    const distance = convertDistance(action.data.measureTemplate.size);
    return `${targetType} ${distance[0]} ${distance[1]}`;
}