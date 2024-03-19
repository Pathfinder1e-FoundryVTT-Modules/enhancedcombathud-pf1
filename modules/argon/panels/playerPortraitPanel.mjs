import {ModuleName, templates} from "../../ech-pf1.mjs";
import {ucFirst} from "../../util.mjs";

export function playerPortraitPanel(ARGON) {
    return class Pathfinder1ePortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
        get usesWoundsVigor() {
            const healthConfig = game.settings.get("pf1", "healthConfig");
            const actorType = this.actor.type || "npc";
            return healthConfig.variants[actorType === "character" ? "pc" : "npc"].useWoundsAndVigor;
        }

        get description() {
            switch (this.actor.type) {
                case "character":
                    const classes = this.actor.items.filter(item => item.type === "class");
                    return classes.map(cClass => `${cClass.name} (${game.i18n.localize("PF1.Level")} ${cClass.system.level})`).join("/");

                case "npc":
                    let cr = this.actor.system.details.cr.total;
                    let mr = this.actor.system.details.mythicTier;

                    switch (cr) {
                        case 1 / 8:
                            cr = "1/8";
                            break;
                        case 1 / 6:
                            cr = "1/6";
                            break;
                        case 1 / 4:
                            cr = "1/4";
                            break;
                        case 1 / 3:
                            cr = "1/3";
                            break;
                        case 1 / 2:
                            cr = "1/2";
                            break;
                    }

                    const crString = cr ? `${game.i18n.localize("PF1.ChallengeRatingShort")} ${cr}` : "";
                    const mrString = mr ? `${game.i18n.localize("ECHPF1.MR")} ${mr}` : "";
                    const actorType = game.i18n.localize(`PF1.CreatureType${ucFirst(this.actor.system.traits.type)}`);

                    return `${actorType} (${crString} ${mrString})`.replace(/\s+/g, ' ');
            }

            return `${this.actor.name}`;
        }

        get isDead() {
            return this.actor?.system.attributes[this.usesWoundsVigor ? 'wounds' : 'hp'].value <= 0;
        }

        async creatureType() {
            const types = ["plant", "construct", "undead"];
            const actorType = this.actor.system.traits.type;

            if (actorType) {
                for (const type of types) {
                    if (actorType.toLowerCase().search(type) >= 0) {
                        return type;
                    }
                }
            }

            return "default";
        }

        _getColor(currentValue, maxValue) {
            const currentPercentage = Math.clamped(currentValue, 0, maxValue) / maxValue;
            return `rgb(${(1 - currentPercentage / 2) * 256}, ${currentPercentage * 256}, 0)`;
        }

        async getSideStatBlocks() {
            let blocks = {left: [], right: []};

            switch (this.actor.type) {
                case "character":
                case "npc":
                    for (const key of ["normal", "touch", "flatFooted"]) {
                        blocks["right"].push({
                            label: game.i18n.localize(`ECHPF1.Abbr.AC${ucFirst(key)}`),
                            id: key,
                            hidden: key !== "normal",
                            value: this.actor.system.attributes.ac[key]?.total
                        });
                    }

                    for (const key of ["total", "flatFootedTotal"]) {
                        blocks["right"].push({
                            label: game.i18n.localize(`ECHPF1.Abbr.CMD${ucFirst(key)}`),
                            id: key,
                            hidden: key !== "total",
                            value: this.actor.system.attributes.cmd[key]
                        });
                    }


                    if(this.usesWoundsVigor) {
                        if(this.actor.system.attributes.vigor.temp) {
                            blocks["left"].push({
                                label: game.i18n.localize("PF1.Temporary"),
                                id: "vigor-temp",
                                value: this.actor.system.attributes.vigor.temp
                            });
                        }
                        blocks["left"].push({
                            label: game.i18n.localize("PF1.Vigor"),
                            id: "vigor",
                            color: this._getColor(this.actor.system.attributes.vigor.value, this.actor.system.attributes.vigor.max),
                            value: `${this.actor.system.attributes.vigor.value}/${this.actor.system.attributes.vigor.max}`
                        });
                        blocks["left"].push({
                            label: game.i18n.localize("PF1.Wounds"),
                            id: "wounds",
                            color: this._getColor(this.actor.system.attributes.wounds.value, this.actor.system.attributes.wounds.max),
                            value: `${this.actor.system.attributes.wounds.value}/${this.actor.system.attributes.wounds.max}`
                        });
                    }
                    else {
                        if(this.actor.system.attributes.hp.temp) {
                            blocks["left"].push({
                                label: game.i18n.localize("PF1.Temporary"),
                                id: "hp-temp",
                                value: this.actor.system.attributes.hp.temp
                            });
                        }
                        blocks["left"].push({
                           label: game.i18n.localize("PF1.HP"),
                            id: "hp",
                            color: this._getColor(this.actor.system.attributes.hp.value, this.actor.system.attributes.hp.max),
                            value: `${this.actor.system.attributes.hp.value}`
                        });
                    }

                    break;


            }

            return blocks;
        }

        async _renderInner(data) {
            await super._renderInner(data);

            const statBlocks = await this.getSideStatBlocks();
            $(this.element).append(await templates.StatBlock({sides: statBlocks}));
        }
    }
}