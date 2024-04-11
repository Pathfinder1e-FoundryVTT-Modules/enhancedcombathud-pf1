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

        async _getSets() {
            const sets = mergeObject(await this.getDefaultSets(), deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));

            for (const [set, slots] of Object.entries(sets)) {
                slots.primary = slots.primary ? await this.actor.items.get(slots.primary) : null;
                slots.secondary = slots.secondary ? await this.actor.items.get(slots.secondary) : null;
            }
            return sets;
        }

        async getDefaultSets() {
            const attacks = this.actor.itemTypes.attack;

            return {
                1: {
                    primary: attacks[0]?.id,
                    secondary: attacks[1]?.id
                },
                2: {
                    primary: attacks[2]?.id,
                    secondary: attacks[3]?.id
                },
                3: {
                    primary: attacks[4]?.id,
                    secondary: attacks[5]?.id
                },
            }
        }
    }
}