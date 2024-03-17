export function splitButton(ARGON) {
    return class Pathfinder1eSplitButton extends ARGON.MAIN.BUTTONS.SplitButton {
        get isValid() {
            return this.button1?.isValid || this.button2?.isValid;
        }

        get actionType() {
            return this.parent?.actionType;
        }

        get colorScheme() {
            return this.parent.colorScheme;
        }
    }
}