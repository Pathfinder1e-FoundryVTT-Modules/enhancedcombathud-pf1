import {useAction, useUnchainedAction} from "../util.mjs";

export function movementHud(ARGON) {
    return class Pathfinder1eMovementHud extends ARGON.MovementHud {
        constructor(props) {
            super(props);
            this.triggerCount = 0;
            this.movedDiagonals = 0;
        }

        get isUnchained() {
            return game.settings.get("pf1", "unchainedActionEconomy");
        }

        get movementMax() {
            let isElevated = this.token?.document.elevation > 0;

            const landSpeed = this.actor?.system.attributes.speed.land.total;
            const flySpeed = this.actor?.system.attributes.speed.fly.total || landSpeed;

            return Math.floor((isElevated ? flySpeed : landSpeed) / 5);
        }

        onTokenUpdate(updates, context) {
            if (updates.x === undefined && updates.y === undefined) return;
            const dimensions = canvas.dimensions.distance;

            const distanceX = Math.floor(canvas.grid.measureDistance({
                x: this.token.x,
                y: 0
            }, {x: updates.x ?? this.token.x, y: 0}, {gridSpaces: true}) / dimensions);

            const distanceY = Math.floor(canvas.grid.measureDistance({x: 0, y: this.token.y}, {
                x: 0,
                y: updates.y ?? this.token.y
            }, {gridSpaces: true}) / dimensions);

            const diagonals = Math.min(distanceX, distanceY);
            const straights = Math.abs(distanceX - distanceY);
            const diagonalRule = game.settings.get("pf1", "diagonalMovement");

            let distance = straights;
            switch(diagonalRule) {
                case "555":
                    distance += diagonals;
                    break;

                case "5105":
                    const diagonalDistance = diagonals * 1.5;
                    distance += !!(this.movedDiagonals % 2) === !!context?.isUndo ? Math.floor(diagonalDistance) : Math.ceil(diagonalDistance);
                    break;

                default:
                    console.error("Movement rule not supported.");
                    distance += diagonals;
                    break;
            }

            if (context?.isUndo) {
                this.movementUsed -= distance;
                this.movedDiagonals -= diagonals;
            } else {
                this.movementUsed += distance;
                this.movedDiagonals += diagonals;
            }
            this.updateMovement();
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
            this.movedDiagonals = 0;
        }

        _onCombatEnd(combat) {
            super._onCombatEnd(combat);
            this.triggerCount = 0;
            this.movedDiagonals = 0;
        }

    }
}