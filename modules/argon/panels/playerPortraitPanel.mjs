import {ModuleName} from "../../ech-pf1.mjs";
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

        async getBarColors() {
            let barColors = {
                wounds: "darkOrange",
            };

            switch (await this.creatureType()) {
                case "plant":
                    barColors.hp = "green";
                    break;
                case "construct":
                    barColors.hp = "#d1c6a5";
                    break;
                case "undead":
                    barColors.hp = "purple";
                    break;
                default:
                    barColors.hp = "red";
                    break;
            }

            return barColors;
        }

        async getBarsCreature() {
            const widthScale = game.settings.get(ModuleName, "HealthBarWidthScale");
            const heightScale = game.settings.get(ModuleName, "HealthBarHeightScale");
            const minScale = Math.min(widthScale, heightScale);
            const cornerCut = 30; //px
            const woundsHeightPart = 0.4;
            const tempHeightPart = 0.7;
            const barColors = await this.getBarColors();
            const fontsize = 2;//em

            //probably better as css classes, but oh well
            const bars = document.createElement("div");
            bars.style.width = `${160 * widthScale}px`;
            bars.style.height = `${50 * heightScale}px`;
            bars.style.position = "absolute";

            if (this.usesWoundsVigor) {
                let wounds = this.usesWoundsVigor ? this.actor.system.attributes.wounds : {value: 0, max: 0};
                // wounds
                const woundsBar = document.createElement("div");
                woundsBar.style.width = "75%";
                woundsBar.style.height = `${woundsHeightPart * 100}%`;
                woundsBar.style.position = "relative";
                woundsBar.style.clipPath = `polygon(0% 0%, 100% 0%, calc(100% - ${(woundsHeightPart / (1 - woundsHeightPart)) * cornerCut}px) 100%, 0% 100%)`;

                const woundsBackground = document.createElement("div");
                woundsBackground.style.width = wounds?.max ? "100%" : "0%";
                woundsBackground.style.height = "100%";
                woundsBackground.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
                woundsBackground.style.opacity = "0.7";
                woundsBackground.style.textShadow = "0 0 10px rgba(0,0,0,.7)";

                const woundsPercent = wounds?.max ? wounds?.value / wounds.max : 0;
                const woundsSubBar = document.createElement("div");
                woundsSubBar.style.width = "100%"//`${wounds.value/wounds.max*100}%`;
                woundsSubBar.style.height = "100%";
                woundsSubBar.style.backgroundColor = barColors.wounds;
                woundsSubBar.style.clipPath = `polygon(0% 0%, ${woundsPercent * 100}% 0%, calc(${(woundsPercent * 100)}% - ${(woundsHeightPart / (1 - woundsHeightPart)) * cornerCut}px) 100%, 0% 100%)`;
                woundsSubBar.style.opacity = "0.9";
                woundsSubBar.style.position = "absolute";
                woundsSubBar.style.top = "0";
                woundsSubBar.style.left = "0";

                woundsBar.appendChild(woundsBackground);
                woundsBar.appendChild(woundsSubBar);
                bars.appendChild(woundsBar);

                const woundsLabel = document.createElement("span");
                woundsLabel.innerHTML = wounds?.max ? `${wounds.value}/${wounds.max} Wounds` : `- Wounds`;
                woundsLabel.style.top = "-2px"; //strange format bug
                woundsLabel.style.position = "absolute";
                woundsLabel.style.zIndex = "20";
                woundsLabel.style.width = "70%";
                woundsLabel.style.height = "100%";
                woundsLabel.style.textAlign = "left";
                woundsLabel.style.fontSize = `${fontsize * (woundsHeightPart / (1 - woundsHeightPart)) * minScale}em`;
                woundsLabel.style.color = "white";
                woundsLabel.style.textShadow = "grey 1px 1px 10px";
                if (wounds?.max) {
                    woundsBar.appendChild(woundsLabel);
                }
            }


            let hp = this.actor.system.attributes[this.usesWoundsVigor ? 'vigor' : 'hp'];
            // hp or vigor
            const hpBar = document.createElement("div");
            hpBar.style.width = "100%";
            hpBar.style.height = `${(1 - woundsHeightPart) * 100}%`;
            hpBar.style.position = "relative";
            //hpBar.style.backgroundColor = "grey";
            hpBar.style.clipPath = `polygon(0% 0%, 100% 0%, calc(100% - ${cornerCut}px) 100%, 0% 100%)`;

            const hpBackground = document.createElement("div");
            hpBackground.style.width = "100%";
            hpBackground.style.height = "100%";
            hpBackground.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
            hpBackground.style.opacity = "0.7";
            hpBackground.style.textShadow = "0 0 10px rgba(0,0,0,.7)";

            const hpPercent = hp?.max ? hp.value / hp.max : 0;
            const hpSubBar = document.createElement("div");
            hpSubBar.style.width = "100%"//`${hp.value/hp.max*100}%`;
            hpSubBar.style.height = "100%";
            hpSubBar.style.backgroundColor = barColors.hp;
            hpSubBar.style.clipPath = `polygon(0% 0%, ${hpPercent * 100}% 0%, calc(${(hpPercent * 100)}% - ${cornerCut}px) 100%, 0% 100%)`;
            hpSubBar.style.opacity = "0.9";
            hpSubBar.style.position = "absolute";
            hpSubBar.style.top = "0";
            hpSubBar.style.left = "0";

            const tempPercent = hp?.max ? hp.temp / hp.max : 0;
            const tempSubBar = document.createElement("div");
            tempSubBar.style.width = "100%"//`${hp.temp/hp.max*100}%`;
            tempSubBar.style.height = `${tempHeightPart * 100}%`;
            tempSubBar.style.backgroundColor = barColors.shield;
            tempSubBar.style.clipPath = `polygon(0% 0%, ${tempPercent * 100}% 0%, calc(${(tempPercent * 100)}% - ${cornerCut * tempHeightPart}px) 100%, 0% 100%)`;
            tempSubBar.style.opacity = "0.9";
            tempSubBar.style.position = "absolute";
            tempSubBar.style.top = "0";
            tempSubBar.style.left = "0";
            tempSubBar.style.opacity = "0.5";

            hpBar.appendChild(hpBackground);
            hpBar.appendChild(hpSubBar);
            hpBar.appendChild(tempSubBar);

            bars.appendChild(hpBar);

            //bottom left
            bars.style.left = "0px";
            bars.style.bottom = "0px";
            bars.style.zIndex = "10"; //to front

            const hpLabel = document.createElement("span");
            if (hp.temp <= 0) {
                hpLabel.innerHTML = `${hp.value}/${hp.max} HP`;
            } else {
                hpLabel.innerHTML = `${hp.temp} TEMP`;
            }
            hpLabel.style.top = "0";
            hpLabel.style.position = "absolute";
            hpLabel.style.zIndex = "20";
            hpLabel.style.width = "70%";
            hpLabel.style.height = "100%";
            hpLabel.style.textAlign = "left";
            hpLabel.style.fontSize = `${fontsize * tempHeightPart * minScale}em`;
            hpLabel.style.color = "white";
            hpLabel.style.textShadow = "grey 1px 1px 10px";
            if (hp?.max) {
                hpBar.appendChild(hpLabel);
            }

            return bars;
        }

        async getSideStatBlocks() {
            let blocks = {left: [], right: []};

            switch (this.actor.type) {
                case "character":
                case "npc":
                    for (const key of ["normal", "touch", "flatFooted"]) {
                        blocks["right"].push([
                            {
                                text: game.i18n.localize(`ECHPF1.Abbr.AC${ucFirst(key)}`),
                                id: key
                            },
                            {
                                text: this.actor.system.attributes.ac[key]?.total,
                                color: "white",
                            },
                        ]);
                    }

                    for(const key of ["total", "flatFootedTotal"]) {
                        blocks["right"].push([
                            {
                                text: game.i18n.localize(`ECHPF1.Abbr.CMD${ucFirst(key)}`),
                                id: key
                            },
                            {
                                text: this.actor.system.attributes.cmd[key],
                                color: "white",
                            },
                        ]);
                    }
                    break;
            }

            return blocks;
        }

        async _renderInner(data) {
            await super._renderInner(data);
            this.element.appendChild(await this.getBarsCreature());

            const statBlocks = await this.getSideStatBlocks();
            const height = 1.6;
            for (const position of ["left", "right"]) {
                if (statBlocks[position].length) {
                    const statBlock = document.createElement("div");

                    statBlock.style = `position : absolute;${position} : 0px`;

                    for (const block of statBlocks[position]) {
                        const statBlockSide = document.createElement("div");
                        statBlockSide.classList.add("portrait-stat-block");
                        statBlockSide.style.paddingLeft = "0.35em";
                        statBlockSide.style.paddingRight = "0.35em";
                        statBlockSide.style.height = `${height}em`;
                        for (const stat of block) {
                            if (!stat.position) {
                                let displayer;
                                if (stat.isInput) {
                                    displayer = document.createElement("input");
                                    displayer.type = stat.inputtype;
                                    displayer.value = stat.text;
                                    displayer.style.width = "1.5em";
                                    displayer.style.color = "#ffffff";
                                    displayer.onchange = () => {
                                        stat.changevent(displayer.value)
                                    };
                                } else {
                                    displayer = document.createElement("span");
                                    displayer.innerText = ``;
                                    if (stat.text) {
                                        displayer.innerText = displayer.innerText + stat.text;
                                    }
                                    if (stat.icon) {
                                        let icon = document.createElement("i");
                                        icon.classList.add(...stat.icon);
                                        displayer.appendChild(icon);
                                    }
                                }
                                if (stat.tooltip) {
                                    displayer.setAttribute("data-tooltip", stat.tooltip);
                                }
                                if (stat.color) {
                                    displayer.style.color = stat.color;
                                }
                                displayer.style.flexGrow = "1";
                                displayer.id = stat.id;
                                displayer.style.color = stat.color;
                                statBlockSide.appendChild(displayer);
                            }
                        }
                        statBlock.appendChild(statBlockSide);
                    }
                    this.element.appendChild(statBlock);
                }
            }
        }
    }
}