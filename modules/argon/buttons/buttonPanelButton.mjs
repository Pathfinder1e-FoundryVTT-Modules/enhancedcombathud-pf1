import {ucFirst, unique} from "../../util.mjs";
import {itemButton} from "./itemButton.mjs";
import {specialActionButton} from "./specialActionButton.mjs";
import {ModuleName} from "../../ech-pf1.mjs";
import {accordionPanel, accordionPanelCategory} from "../panels/accordionPanel.mjs";

function buttonPanel(ARGON) {
    return class Pathfinder1eButtonPanel extends ARGON.MAIN.BUTTON_PANELS.ButtonPanel {
        get actionType() {
            return this.parent?.actionType;
        }

        get colorScheme() {
            return this.parent.colorScheme;
        }
    }
}

export function buttonPanelActionButton(ARGON) {
    return class Pathfinder1eButtonPanelActionButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
        constructor({parent, type, color}) {
            super();
            this.type = type;
            this._parent = parent;
        }

        get actionType() {
            return this.parent.actionType;
        }

        get label() {
            if (this.replacementItem) {
                return this.replacementItem.name;
            }

            return game.i18n.localize(`ECHPF1.Actions.${ucFirst(this.type)}`);
        }

        get isValid() {
            return true;
        }

        get icon() {
            if (this.replacementItem?.img) {
                return this.replacementItem.img;
            }

            switch (this.type) {
                case "maneuver":
                    return `modules/${ModuleName}/icons/high-kick.svg`;
                case "aidAnother":
                    return `modules/${ModuleName}/icons/backup.svg`;
            }
        }

        get colorScheme() {
            return this.parent.colorScheme;
        }

        async _getPanel() {
            const ButtonPanel = buttonPanel(ARGON);
            const SpecialActionButton = specialActionButton(ARGON);

            switch (this.type) {
                case "maneuver":
                    return new ButtonPanel({
                        buttons: [
                            new SpecialActionButton({parent: this, type: "bullRush"}),
                            new SpecialActionButton({parent: this, type: "dirtyTrick"}),
                            new SpecialActionButton({parent: this, type: "disarm"}),
                            new SpecialActionButton({parent: this, type: "drag"}),
                            new SpecialActionButton({parent: this, type: "grapple"}),
                            new SpecialActionButton({parent: this, type: "overrun"}),
                            new SpecialActionButton({parent: this, type: "reposition"}),
                            new SpecialActionButton({parent: this, type: "steal"}),
                            new SpecialActionButton({parent: this, type: "sunder"}),
                            new SpecialActionButton({parent: this, type: "trip"}),
                        ].sort((a, b) => a.label.localeCompare(b.label))
                    });

                case "aidAnother":
                    return new ButtonPanel({
                        buttons: [
                            new SpecialActionButton({parent: this, type: "aidAnotherAttack"}),
                            new SpecialActionButton({parent: this, type: "aidAnotherDefense"})
                        ].sort((a, b) => a.label.localeCompare(b.label))
                    });

                default:
                    return;
            }
        }
    }
}

export function buttonPanelItemButton(ARGON) {
    return class Pathfinder1eButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
        constructor({parent, type, color, item}) {
            super();
            this.type = type;
            this._parent = parent;

            this.replacementItem = item;
        }

        get actionType() {
            return this.parent.actionType;
        }

        get label() {
            if (this.replacementItem) {
                return this.replacementItem.name;
            }

            return game.i18n.localize(`ECHPF1.ItemTypes.${ucFirst(this.type)}`);
        }

        get colorScheme() {
            return this.parent.colorScheme;
        }

        get validItems() {
            const itemsOfType = this.actor.items.filter(item => item.type === this.type);
            return itemsOfType.filter(item => {
                if (!item.actions) {
                    return false;
                }

                if(item.isCharged && !item.charges) {
                    return false;
                }

                for (let action of item.actions) {
                    if (action.data.activation.type === this.actionType
                        && action.data.activation.cost === 1) {
                        return true;
                    }
                }

                return false;
            });
        }

        get isValid() {
            return this.validItems.length;
        }

        get icon() {
            if (this.replacementItem?.img) {
                return this.replacementItem.img;
            }

            switch (this.type) {
                case "consumable":
                    return `modules/${ModuleName}/icons/vial.svg`;
                case "equipment":
                    return `modules/${ModuleName}/icons/gem-chain.svg`;
                case "feat":
                    return "modules/enhancedcombathud/icons/svg/mighty-force.svg";
            }
        }

        async _getPanel() {
            const ButtonPanel = buttonPanel(ARGON);
            const ItemButton = itemButton(ARGON);

            switch (this.type) {
                default:
                    return new ButtonPanel({
                        buttons: this.validItems
                            .map(item => new ItemButton({item}))
                            .sort((a, b) => a.item.name.localeCompare(b.item.name))
                    });
            }
        }
    }
}

export function spellbookButtonPanelActionButton(ARGON) {
    return class Pathfinder1eButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
        constructor({parent, type, color, item, spellbookId}) {
            super();
            this.type = "spell";
            this._parent = parent;

            this.replacementItem = item;
            this.spellbookId = spellbookId || "primary";
            this.spellbook = this.actor.system.attributes.spells.spellbooks[this.spellbookId];
        }

        get actionType() {
            return this.parent.actionType;
        }

        get quantity() {
            return this.spellbook.spellPoints.useSystem ? this.spellbook.spellPoints.value : null;
        }

        async getData() {
            const data = await super.getData();
            data.quantity = this.quantity;
            data.hasQuantity = this.quantity !== null;
            return data;
        }

        get template() {
            return `modules/${ModuleName}/templates/ActionButton.hbs`;
        }

        get label() {
            return `${this.spellbook.label} [${this.spellbook.cl.total}]`;
        }

        get colorScheme() {
            return this.parent.colorScheme;
        }

        get categories() {
            const spells = this.validItems.filter(item => item.system.spellbook === this.spellbookId);
            const spellLevels = unique(spells.map(item => item.system.level)).sort();
            const hasSpellUses = !this.spellbook.spellPoints.useSystem && this.spellbook.prepMode !== "spontaneous";

            let spellCategories = [];
            for (let level of spellLevels) {
                const spellLevelInfo = this.spellbook.spells[`spell${level}`];

                spellCategories.push({
                    label: game.i18n.localize(`ECHPF1.SpellLevels.${level}`),
                    uses: {
                        max: level && hasSpellUses ? spellLevelInfo.max : null,
                        value: level && hasSpellUses ? spellLevelInfo.value : null
                    },
                    buttons: spells.filter(item => item.system.level === level)
                });
            }

            return spellCategories;
        }

        get validItems() {
            const itemsOfType = this.actor.items.filter(item => item.type === "spell" && item.system.spellbook === this.spellbookId);
            return itemsOfType.filter(item => {
                if (!item.actions) {
                    return false;
                }

                if (item.type === "spell") {
                    if (!item.canCast) {
                        return false;
                    }

                    if (item.spellbook.spellPreparationMode === "prepared" && !item.useSpellPoints()) {
                        if (item.system.preparation.maxAmount === 0) {
                            return false;
                        }
                    } else {
                        if (!item.system.preparation.spontaneousPrepared) {
                            return false;
                        }
                    }
                }

                for (let action of item.actions) {
                    if (action.data.activation.type === this.actionType
                        && action.data.activation.cost === 1) {
                        return true;
                    }
                }

                return false;
            });
        }

        get isValid() {
            return this.validItems.length;
        }

        get icon() {
            return "modules/enhancedcombathud/icons/svg/spell-book.svg";
        }

        async _getPanel() {
            const ItemButton = itemButton(ARGON);
            const AccordionPanel = accordionPanel(ARGON);
            const AccordionPanelCategory = accordionPanelCategory(ARGON);

            return new AccordionPanel({
                accordionPanelCategories: this.categories
                    .map(category => new AccordionPanelCategory({
                        label: category.label,
                        uses: category.uses,
                        buttons: category.buttons.map(item => new ItemButton({item}))
                    }))
            });
        }
    }
}

export function spellButtonPanelActionButton(ARGON) {
    return class Pathfinder1eButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
        constructor({parent, color, item}) {
            super();
            this._parent = parent;

            this.replacementItem = item;
        }

        get actionType() {
            return this.parent.actionType;
        }

        get label() {
            if (this.replacementItem) {
                return this.replacementItem.name;
            }

            return game.i18n.localize(`ECHPF1.ItemTypes.Spell`);
        }

        get colorScheme() {
            return this.parent.colorScheme;
        }

        get isValid() {
            const usedSpellbooks = this.actor.system.attributes.spells.usedSpellbooks;
            if (!usedSpellbooks.length) {
                return false;
            }

            for (let item of this.actor.items) {
                if (item.type !== "spell") continue;

                if (!usedSpellbooks.includes(item.system.spellbook)) continue;

                if (!item.actions) continue;

                for (let action of item.actions) {
                    if (action.data.activation.type === this.actionType
                        && action.data.activation.cost === 1) {
                        return true;
                    }
                }
            }

            return false;
        }

        get icon() {
            return "modules/enhancedcombathud/icons/svg/spell-book.svg";
        }

        async _getPanel() {
            const ButtonPanel = buttonPanel(ARGON);
            const SpellbookButtonPanelItemButton = spellbookButtonPanelActionButton(ARGON);

            return new ButtonPanel({
                buttons: [
                    new SpellbookButtonPanelItemButton({parent: this, spellbookId: "primary"}),
                    new SpellbookButtonPanelItemButton({parent: this, spellbookId: "secondary"}),
                    new SpellbookButtonPanelItemButton({parent: this, spellbookId: "tertiary"}),
                    new SpellbookButtonPanelItemButton({parent: this, spellbookId: "spelllike"}),
                ].filter(button => button.isValid)
            });
        }
    }
}