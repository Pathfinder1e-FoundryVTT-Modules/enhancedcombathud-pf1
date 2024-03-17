import {drawerButton} from "../buttons/drawerButton.mjs";
import {ucFirst} from "../../util.mjs";

export function drawerPanel(ARGON) {
    return class Pathfinder1eDrawerPanel extends ARGON.DRAWER.DrawerPanel {
        get title() {
            return `${game.i18n.localize("PF1.Attributes")}, ${game.i18n.localize("PF1.SavingThrowPlural")} & ${game.i18n.localize("PF1.Skills")}`;
        }

        get categories() {
            const DrawerButton = drawerButton(ARGON);

            const actor = this.actor;

            return [
                {
                    gridCols: "7fr 2fr",
                    captions: [
                        {
                            label: game.i18n.localize("PF1.Attributes")
                        },
                        {
                            label: game.i18n.localize("PF1.Roll")
                        }
                    ],
                    buttons: ["str", "dex", "con", "int", "wis", "cha"].map(ability =>
                        new DrawerButton([
                            {
                                label: game.i18n.localize(`PF1.Ability${ucFirst(ability)}`),
                                onClick: () => actor.rollAbilityTest(ability)
                            },
                            {
                                label: actor.system.abilities[ability].total,
                                onClick: () => actor.rollAbilityTest(ability),
                                style: "display: flex; justify-content: flex-end;"
                            }
                        ]))
                },
                {
                    gridCols: "7fr 2fr",
                    captions: [
                        {
                            label: game.i18n.localize("PF1.SavingThrowPlural")
                        },
                        {
                            label: game.i18n.localize("PF1.Roll")
                        }
                    ],
                    buttons: ["fort", "ref", "will"].map(save => new DrawerButton([
                        {
                            label: game.i18n.localize(`PF1.SavingThrow${ucFirst(save)}`),
                            onClick: () => actor.rollSavingThrow(save)
                        },
                        {
                            label: actor.system.attributes.savingThrows[save].total,
                            onClick: () => actor.rollSavingThrow(save),
                            style: "display: flex; justify-content: flex-end;"
                        }
                    ]))
                },
                // TODO: Thin out or remove the skill buttons, they're massive
                {
                    gridCols: "7fr 2fr",
                    captions: [
                        {
                            label: game.i18n.localize("PF1.Skills")
                        },
                        {
                            label: game.i18n.localize("PF1.Roll")
                        }
                    ],
                    buttons: Object.entries(actor.system.skills).map((skillData) => {
                        const [skillId, skill] = skillData;

                        let nameId = skillId;
                        switch (skillId) {
                            case "umd":
                                nameId = "UMD";
                                break;
                            case "kar":
                            case "kdu":
                            case "ken":
                            case "kge":
                            case "khi":
                            case "klo":
                            case "kna":
                            case "kno":
                            case "kpl":
                            case "kre":
                                nameId = nameId.charAt(0) + nameId.charAt(1).toUpperCase() + nameId.charAt(2);
                        }

                        let skillButtonGroup = [
                            new DrawerButton([
                                {
                                    label: skill.name || game.i18n.localize(`PF1.Skill${ucFirst(nameId)}`),
                                    onClick: () => actor.rollSkill(skillId)
                                },
                                {
                                    label: skill.mod,
                                    onClick: () => actor.rollSkill(skillId),
                                    style: "display: flex; justify-content: flex-end;"
                                }
                            ])
                        ]

                        if (skill.subSkills) {
                            Object.entries(skill.subSkills).map(subSkillData => {
                                const [subSkillId, subSkill] = subSkillData;

                                skillButtonGroup.push(new DrawerButton([
                                    {
                                        label: '- ' + (subSkill.name || game.i18n.localize(`PF1.Skill${ucFirst(subSkillId)}`)),
                                        onClick: () => actor.rollSkill(subSkillId)
                                    },
                                    {
                                        label: subSkill.mod,
                                        onClick: () => actor.rollSkill(subSkillId),
                                        style: "display: flex; justify-content: flex-end;"
                                    }
                                ]))
                            })
                        }

                        return skillButtonGroup;
                    }).flat(1)
                }
            ]
        }
    }
}