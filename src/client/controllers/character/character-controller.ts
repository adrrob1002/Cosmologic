import { Controller, OnStart, OnTick } from "@flamework/core";
import Make from "@rbxts/make";
import promiseR15, { CharacterRigR15, CharacterRigR6, promiseR6 } from "@rbxts/promise-character";
import { promiseChild, promiseChildOfClass } from "@rbxts/promise-child";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { t } from "@rbxts/t";
import { attachSetToTag } from "shared/util/tag-utils";

const player = Players.LocalPlayer;

@Controller({})
export class CharacterController implements OnStart, OnTick {
	private readonly onCharacterAdded = new Signal<(character: CharacterRigR6 | CharacterRigR15) => void>();
	private currentCharacter?: CharacterRigR6 | CharacterRigR15;

	private gravityInfluences = new Set<BasePart>();

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

	/** @hidden */
	onTick(dt: number): void {
		if (this.currentCharacter === undefined) return;

		const humanoidRootPart = this.currentCharacter.HumanoidRootPart;

		const gravityForce = humanoidRootPart.FindFirstChildOfClass("VectorForce");
		if (gravityForce === undefined) return;

		// Get closest gravity influence
		// let closestGravityInfluence: BasePart | undefined;
		// let closestDistance = math.huge;

		// for (const gravityInfluence of this.gravityInfluences) {
		// 	const distance = humanoidRootPart.Position.mul(-1).Magnitude;
		// 	if (distance < closestDistance) {
		// 		closestGravityInfluence = gravityInfluence;
		// 		closestDistance = distance;
		// 	}
		// }

		// if (closestGravityInfluence === undefined) return;

		// Calculate gravity force
		const gravityForceMagnitude = 19620 * dt;
		const gravityForceDirection = humanoidRootPart.Position.mul(-1).Unit;

		gravityForce.Force = gravityForceDirection.mul(gravityForceMagnitude);
	}

	private setupGravity() {
		if (this.currentCharacter === undefined) return;

		const humanoidRootPart = this.currentCharacter.HumanoidRootPart;

		// Make GravityAttachment and GravityForce
		const gravityAttachment = Make("Attachment", {
			Name: "GravityAttachment",
			Parent: humanoidRootPart,
		});

		const gravityForce = Make("VectorForce", {
			Name: "GravityForce",
			Parent: humanoidRootPart,
			RelativeTo: Enum.ActuatorRelativeTo.World,
			Attachment0: gravityAttachment,
			Force: new Vector3(0, 0, 0),
			Enabled: true,
		});
	}

	/**
	 * Get the current character
	 * @returns The current character, or undefined if the character is not loaded yet
	 */
	public getCharacter(): CharacterRigR6 | CharacterRigR15 | undefined {
		return this.currentCharacter;
	}
}
