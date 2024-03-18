import {useAction} from "../../util.mjs";

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
            if(!this.item) {
                return true;
            }

            if(["weapon", "equipment"].includes(this.item.type)) {
                if (!this.item.system.equipped) return false;
            }

            return true;
        }

        get quantity() {
            if (this.item?.type === "spell") {
                if (this.item.system.level === 0) return null;

                if (this.item.useSpellPoints()) return this.item.getSpellPointCost();

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

            if(this.parent.isAccordionPanelCategory) {
                this.parent.use();
            }
        }
    }
}