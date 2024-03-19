import {
    abilityTypes,
    convertDistance, renderAttackString, renderCriticalChanceString,
    renderDamageString, renderSaveString, renderTemplateString,
    spellSchools,
    ucFirst,
    useAction,
    weaponProperties
} from "../../util.mjs";


export function itemButton(ARGON) {
    return class Pathfinder1eItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
        constructor(args) {
            super(args);
            this._parent = args.parent;
        }

        get actionType() {
            if (this.parent?.actionType) {
                return this.parent.actionType;
            }

            if (this.parent?.parent?.actionType) {
                return this.parent.parent.actionType
            }
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
                    subtitle = game.i18n.localize(spellSchools[item.system.school]);
                    propertiesLabel = game.i18n.localize("PF1.Spell");

                    propertiesLabel = game.i18n.localize("PF1.DescriptorPlural");
                    properties = item.system.types
                        .split(',')
                        .filter(type => type.trim().length)
                        .map(type => {
                            return {
                                label: type.trim()
                            }
                        })

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
                            .map(comp => game.i18n.localize(`PF1.SpellComponentKeys.${ucFirst(comp[0])}`))
                            .join(", ")
                    })

                    if(item.firstAction.data.spellEffect) {
                        details.push({
                            label: game.i18n.localize("PF1.SpellEffect"),
                            value: item.firstAction.data.spellEffect
                        })
                    }

                    break;

                case "feat":
                    subtitle = item.system.abilityType ? game.i18n.localize(abilityTypes[item.system.abilityType]?.long) : null;
                    break;

                case "weapon":
                    const weaponGroupData = item.system.weaponGroups;
                    let weaponGroups = weaponGroupData.value.map((group) => game.i18n.localize(`PF1.WeaponGroup${ucFirst(group)}`));
                    if (weaponGroupData.custom) {
                        weaponGroups.push(weaponGroupData.custom);
                    }
                    subtitle = weaponGroups.join(", ");

                    propertiesLabel = game.i18n.localize("PF1.WeaponProperties");
                    properties = Object.entries(item.system.properties)
                        .filter(prop => prop[1])
                        .map(prop => {
                            return {
                                label: game.i18n.localize(weaponProperties[prop[0]])
                            }
                        })
                    break;

                case "equipment":
                    if (item.system.subType === "wondrous") {
                        subtitle = item.system.subType ? game.i18n.localize(`PF1.EquipSlot${ucFirst(item.system.slot)}`) : null;
                    } else {
                        subtitle = item.system.subType ? game.i18n.localize(`PF1.EquipType${ucFirst(item.system.subType)}`) : null;
                    }

                    if(item.system.armor.value) {
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

                    console.log(item)

                    break;
            }

            const action = item.firstAction;
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
                        value: renderDamageString(action, rollData, {combine: false})
                    })
                }

                if (action.hasTemplate) {
                    details.push({
                        label: game.i18n.localize("PF1.MeasureTemplate"),
                        value: renderTemplateString(action)
                    })
                }

                if (action.maxRange && action.maxRange) {
                    const distanceValues = convertDistance(action.maxRange);
                    details.push({
                        label: game.i18n.localize("PF1.Range"),
                        value: action.maxRange > 0 ? `${action.maxRange} ${distanceValues[1]}` : null
                    })
                }

                if (action.minRange) {
                    const distanceValues = convertDistance(action.minRange);
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

                if(action.data.duration.value) {
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

            if(item.system.sr) {
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
            useAction(this.actionType);

            if (this.parent.isAccordionPanelCategory) {
                this.parent.use();
            }
        }
    }
}