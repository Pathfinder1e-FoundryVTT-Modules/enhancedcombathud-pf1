export function weaponSets(ARGON) {
    return class Pathfinder1eWeaponSets extends ARGON.WeaponSets {
        get weapons() {
            return this.actor.items.filter(item => {
                if (item.type === "weapon") {
                    return true;
                }

                if (item.type !== "equipment") {
                    return false;
                }

                return item.system.subType === "shield";
            });
        }

        async _onSetChange({sets, active}) {
            let updates = [];

            const activeWeaponIds = Object.values(sets[active])
                .map(weapon => weapon?._id)
                .filter(id => id !== null);

            this.weapons.map(weapon => {
                updates.push({
                    _id: weapon._id,
                    "system.equipped": activeWeaponIds.includes(weapon._id)
                })
            })

            await this.actor.updateEmbeddedDocuments("Item", updates);
        }
    }
}