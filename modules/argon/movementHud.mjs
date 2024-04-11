import {useAction, useUnchainedAction} from "../util.mjs";

export function movementHud(ARGON) {
    return class Pathfinder1eMovementHud extends ARGON.MovementHud {
        constructor(props) {
            super(props);
            this.triggerCount = 0;
        }

        get isUnchained() {
            return game.settings.get("pf1", "unchainedActionEconomy");
        }

        get movementMax() {
            return Math.floor(this.actor?.system.attributes.speed.land.total / 5);
        }

        updateMovement() {
            super.updateMovement();

            switch (this.triggerCount) {
                case 0:
                    if (this.isUnchained) {
                        if (this.movementUsed > 0) {
                            useUnchainedAction("action")
                            this.triggerCount++;
                        }
                    } else {

                        if (this.movementUsed > 1) {
                            useAction("move");
                            this.triggerCount++;
                        }
                    }

                    break;
                case 1:
                    if (this.movementUsed > this.movementMax) {
                        if (this.isUnchained) useUnchainedAction("action")
                        else useAction("standard");
                        this.triggerCount++;
                    }
                    break;
                case 2:
                    if (this.isUnchained) {
                        if (this.movementUsed > this.movementMax * 2) {
                            useUnchainedAction("action")
                            this.triggerCount++;
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        get visible() {
            return game.combat?.started;
        }

        _onNewRound(combat) {
            super._onNewRound(combat);
            this.triggerCount = 0;
        }

        _onCombatEnd(combat) {
            super._onCombatEnd(combat);
            this.triggerCount = 0;
        }

    }
}