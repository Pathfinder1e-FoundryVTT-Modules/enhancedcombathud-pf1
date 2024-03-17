export function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function unique(array) {
    return array.filter((value, index, self) => self.indexOf(value) === index);
}

export function useAction(actionType, fallback = true) {
    switch (actionType) {
        case "standard":
            if (!ui.ARGON.components.main[0].isActionUsed) {
                ui.ARGON.components.main[0].isActionUsed = true;
                ui.ARGON.components.main[0].updateActionUse();
            }
            break;
        case "move":
            if (!ui.ARGON.components.main[1].isActionUsed) {
                ui.ARGON.components.main[1].isActionUsed = true;
                ui.ARGON.components.main[1].updateActionUse();
            }
            else {
                useAction("standard")
            }
            break;
        case "swift":
            if (!ui.ARGON.components.main[2].isActionUsed) {
                ui.ARGON.components.main[2].isActionUsed = true;
                ui.ARGON.components.main[2].updateActionUse();
            }
            break;
        case "full":
            useAction("move")
            useAction("standard")
            break;
    }
}