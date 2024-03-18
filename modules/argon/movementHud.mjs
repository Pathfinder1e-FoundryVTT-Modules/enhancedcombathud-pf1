import {useAction} from "../util.mjs";

export function movementHud(ARGON) {
    return class Pathfinder1eMovementHud extends ARGON.MovementHud {
        constructor(props) {
            super(props);
            this.triggerCount = 0;
        }

        get movementMax() {
            return Math.floor(this.actor.system.attributes.speed.land.total / 5);
        }

        updateMovement() {
            super.updateMovement();

            switch (this.triggerCount) {
                case 0:
                    if (this.movementUsed > 1) {
                        useAction("move");
                        this.triggerCount++;
                    }
                    break;
                case 1:
                    if (this.movementUsed > this.movementMax) {
                        useAction("standard");
                        this.triggerCount++;
                    }
                    break;
                default:
                    break;
            }
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