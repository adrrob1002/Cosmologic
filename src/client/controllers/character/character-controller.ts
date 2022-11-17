import { Controller, OnStart } from "@flamework/core";
import promiseR15, { CharacterRigR15, CharacterRigR6, promiseR6 } from "@rbxts/promise-character";
import { promiseChildOfClass } from "@rbxts/promise-child";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";

const player = Players.LocalPlayer;

@Controller({})
export class CharacterController implements OnStart {
	public readonly onCharacterAdded = new Signal<(character: CharacterRigR6 | CharacterRigR15) => void>();
	private currentCharacter?: CharacterRigR6 | CharacterRigR15;

	/** @hidden */
	onStart() {
		if (player.Character) this.onCharacterAddedCallback(player.Character);
		player.CharacterAdded.Connect((c) => this.onCharacterAddedCallback(c));
		player.CharacterRemoving.Connect(() => (this.currentCharacter = undefined));
	}

	private async onCharacterAddedCallback(model: Model): Promise<void> {
		const rigType = (await promiseChildOfClass(model, "Humanoid")).RigType.Name;

		let character;

		if (rigType === "R6") {
			character = await promiseR6(model);
		} else if (rigType === "R15") {
			character = await promiseR15(model);
		} else {
			throw `${model.Name} has an invalid rig type: ${rigType}`;
		}

		this.currentCharacter = character;
		this.onCharacterAdded.Fire(character);
	}

	/**
	 * Get the current character
	 * @returns The current character, or undefined if the character is not loaded yet
	 */
	public getCharacter(): CharacterRigR6 | CharacterRigR15 | undefined {
		return this.currentCharacter;
	}
}
