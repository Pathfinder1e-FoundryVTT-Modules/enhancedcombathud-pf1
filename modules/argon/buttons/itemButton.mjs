import {
    renderAttackString, renderCriticalChanceString,
    renderSaveString, renderTemplateString,
    ucFirst,
    useAction, useUnchainedAction
} from "../../util.mjs";
import {ModuleName} from "../../ech-pf1.mjs";


export function itemButton(ARGON) {
    return class Pathfinder1eItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
        constructor(args) {
            super(args);
            this._parent = args.parent;
        }

        get isUnchained() {
            if (this.parent?.isUnchained !== undefined) {
                return this.parent.isUnchained;
            }

            if (this.parent?.parent?.isUnchained !== undefined) {
                return this.parent.parent.isUnchained
            }
        }

        get actionType() {
            if (this.parent?.actionType) {
                return this.parent.actionType;
            }

            if (this.parent?.parent?.actionType) {
                return this.parent.parent.actionType
            }
        }

        get actionCost() {
            return this.isUnchained ? this.item.defaultAction?.data.activation.unchained.cost : 1;
        }

        get isValid() {
            if (!this.item) {
                return true;
            }

            if (["weapon", "equipment"].includes(this.item.type)) {
                if (!this.item.system.equipped) return false;
            }

            return true;
        }

        hasTooltip() {
            return true;
        }

        async getTooltipData() {
            const item = this.item;
            if (!item) {
                return null;
            }

            const rollData = await this.actor.getRollData();

            const identified = item.system.identified !== undefined ? item.system.identified : true;

            const title = identified ? item.name : (item.system.unidentified.name || game.i18n.localize("PF1.Unidentified"))
            const description = identified ? (item.system.description.value || item.fullDescription) : item.system.description.unidentified;
            const footerText = identified ? (item.fullDescription !== item.system.shortDescription ? item.system.shortDescription : null) : null;

            let subtitle = null;
            let details = [];
            let properties = [];
            let propertiesLabel = null;

            switch (item.type) {
                case "spell":
                    subtitle = pf1.config.spellSchools[item.system.school];
                    propertiesLabel = game.i18n.localize("PF1.Spell");

                    propertiesLabel = game.i18n.localize("PF1.DescriptorPlural");
                    properties = Array.from(item.system.descriptors.total)
                        .filter(type => type.trim().length)
                        .map(type => {return {label: type.trim()}})

                    if (item.system.subschool) {
                        details.push({
                            label: game.i18n.localize("PF1.SubSchool"),
                            value: ucFirst(item.system.subschool)
                        })
                    }

                    details.push({
                        label: game.i18n.localize("PF1.Components"),
                        value: Object.entries(item.system.components)
                            .filter(comp => comp[1])
                            .map(comp => pf1.config.spellComponents[comp[0]])
                            .join(", ")
                    })

                    if (item.defaultAction.data.spellEffect) {
                        details.push({
                            label: game.i18n.localize("PF1.SpellEffect"),
                            value: item.defaultAction.data.spellEffect
                        })
                    }

                    break;

                case "feat":
                    subtitle = item.system.abilityType ? pf1.config.abilityTypes[item.system.abilityType]?.long : null;
                    break;

                case "weapon":
                    const weaponGroupData = item.system.weaponGroups;
                    let weaponGroups = weaponGroupData.value.map((group) => pf1.config.weaponGroups[group]);
                    if (weaponGroupData.custom) {
                        weaponGroups.push(weaponGroupData.custom);
                    }
                    subtitle = weaponGroups.join(", ");

                    propertiesLabel = game.i18n.localize("PF1.WeaponProperties");
                    properties = Object.entries(item.system.properties)
                        .filter(prop => prop[1])
                        .map(prop => {
                            return {
                                label: pf1.config.weaponProperties[prop[0]]
                            }
                        })
                    break;

                case "equipment":
                    if (item.system.subType === "wondrous") {
                        subtitle = item.system.subType ? pf1.config.equipmentSlots[item.system.slot] : null;
                    } else {
                        subtitle = item.system.subType ? pf1.config.equipmentTypes[item.system.subType] : null;
                    }

                    if (item.system.armor.value) {
                        details.push({
                            label: game.i18n.localize("PF1.ACNormal"),
                            value: ('+' + item.system.armor.value).replace('+-', '-')
                        })
                        details.push({
                            label: game.i18n.localize("PF1.MaxDexShort"),
                            value: item.system.armor.dex || '-'
                        })
                        details.push({
                            label: game.i18n.localize("PF1.ACP"),
                            value: '-' + item.system.armor.acp
                        })
                    }
                    break;
            }

            const action = item.defaultAction;
            if (action) {
                if (action.hasAttack) {
                    details.push({
                        label: game.i18n.localize("PF1.AttackRollBonus"),
                        value: renderAttackString(action)
                    })

                    details.push({
                        label: game.i18n.localize("PF1.CriticalThreatRange"),
                        value: renderCriticalChanceString(action)
                    })

                    if (action.data.touch) {
                        details.push({
                            label: game.i18n.localize("PF1.TouchAttack"),
                            value: game.i18n.localize("PF1.Yes")
                        })
                    }
                }

                if (action.hasDamage) {
                    details.push({
                        label: game.i18n.localize(action.isHealing ? "PF1.Healing" : "PF1.Damage"),
                        value: pf1.utils.formula.actionDamageFormula(action, rollData, {combine: false})
                    })
                }

                if (action.hasTemplate) {
                    details.push({
                        label: game.i18n.localize("PF1.MeasureTemplate"),
                        value: renderTemplateString(action)
                    })
                }

                if (action.maxRange && action.maxRange) {
                    const distanceValues = pf1.utils.convertDistance(action.maxRange);
                    details.push({
                        label: game.i18n.localize("PF1.Range"),
                        value: action.maxRange > 0 ? `${action.maxRange} ${distanceValues[1]}` : null
                    })
                }

                if (action.minRange) {
                    const distanceValues = pf1.utils.convertDistance(action.minRange);
                    details.push({
                        label: game.i18n.localize("PF1.MinRange"),
                        value: action.minRange > 0 ? `${action.minRange} ${distanceValues[1]}` : null
                    })
                }

                if (action.data.target.value) {
                    details.push({
                        label: game.i18n.localize("PF1.Targets"),
                        value: action.data.target.value
                    })
                }

                if (action.data.duration.value) {
                    details.push({
                        label: game.i18n.localize("PF1.Duration"),
                        value: action.data.duration.value
                    })
                }

                if (action.hasSave) {
                    details.push({
                        label: game.i18n.localize("PF1.Save"),
                        value: await renderSaveString(action, rollData)
                    })
                }
            }

            if (item.system.sr) {
                details.push({
                    label: game.i18n.localize("PF1.SpellResistance"),
                    value: game.i18n.localize("PF1.Yes")

                })
            }

            return {
                title,
                description: await TextEditor.enrichHTML(description),
                subtitle,
                details,
                properties,
                propertiesLabel,
                footerText: await TextEditor.enrichHTML(footerText)
            }
        }

        get quantity() {
            if (this.item?.type === "spell") {
                if (this.item.system.level === 0) return null;

                if (this.item.useSpellPoints()) return (typeof this.item.getSpellPointCost == 'function' ? this.item.getSpellPointCost() : this.item.spellLevel);

                if (this.item.spellbook.spellPreparationMode === "spontaneous") return null;
            }

            if (this.item?.isCharged) {
                let chargeCost = this.item.getDefaultChargeCost() || 1;

                return Math.floor(this.item.charges / chargeCost);
            }
        }

        async _onLeftClick(event) {
            await this.item.use();

            if (this.isUnchained) {
                useUnchainedAction(this.actionType, this.actionCost);
            } else {
                useAction(this.actionType);
            }

            if (this.parent.isAccordionPanelCategory) {
                Hooks.callAll("ECHPF1.spellUsed", this.item);
            }
        }

        async _onMouseEnter(event) {
            super._onMouseEnter(event);

            if(game.settings.get(ModuleName, "ShowActionReachOnCanvas")) {
                pf1.canvas.attackReach.showAttackReach(this.token, this.item, this.item.defaultAction);
            }
        }

        async _onMouseLeave(event) {
            super._onMouseLeave(event);
            if(game.settings.get(ModuleName, "ShowActionReachOnCanvas")) {
                pf1.canvas.attackReach.clearHighlight();
            }
        }

        activateListeners(html) {
            this.element.onmouseup = this._onMouseUp.bind(this);
            this.element.onmousedown = this._onMouseDown.bind(this);
            this.element.onmouseover = this._onMouseEnter.bind(this);
            this.element.onmouseout = this._onMouseLeave.bind(this);
        }
    }
}