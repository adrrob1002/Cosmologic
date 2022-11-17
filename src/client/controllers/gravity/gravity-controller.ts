import { Controller, OnInit, OnRender, OnStart, OnTick } from "@flamework/core";
import { CharacterRigR15, CharacterRigR6 } from "@rbxts/promise-character";
import { CollectionService, Players, ReplicatedStorage, StarterPlayer, Workspace } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { CharacterController } from "../character/character-controller";
import { Collider } from "./collider";
import { GRAVITY } from "shared/shared-constants";
import { Control } from "./control";
import { attachSetToTag } from "shared/util/tag-utils";
import { Tag } from "types/enum/tags";
import { t } from "@rbxts/t";
import { CameraController } from "../camera-controller";
import Signal from "@rbxts/signal";

const player = Players.LocalPlayer;

const TRANSITION = 0.15;
const WALK_FORCE = 200 / 3;
const JUMP_MODIFIER = 1.2;

@Controller({})
export class GravityController implements OnStart, OnInit, OnTick, OnRender {
	private trove = new Trove();

	public character?: CharacterRigR6 | CharacterRigR15;
	private characterMass = 0;

	private collider?: Collider;
	private control: Control;

	private gravityUp = new Vector3(0, 1, 0);
	private onUpVectorChanged = new Signal<(newUp: Vector3) => void>();

	private previousPart: BasePart;
	private previousCFrame = new CFrame();

	private gravityInfluences = new Set<BasePart>();

	constructor(private readonly characterController: CharacterController) {
		this.previousPart = Workspace.Terrain;
		this.control = new Control(player);
	}

	onInit() {
		attachSetToTag(this.gravityInfluences, Tag.GravityInfluence, t.instanceIsA("BasePart"));
	}

	onStart() {
		this.characterController.onCharacterAdded.Connect((character) => {
			this.character = character;
			this.collider = new Collider(character);
			this.characterMass = this.getModelMass(character);

			this.character.Humanoid.PlatformStand = true;
			this.trove.add(
				this.character.Humanoid.GetPropertyChangedSignal("Jump").Connect(() => {
					if (this.character?.Humanoid.Jump === true) {
						this.onRequestJump();
						this.character.Humanoid.Jump = false;
					}
				}),
			);

			player.CharacterRemoving.Connect(() => this.collider?.destroy());
		});
	}

	onTick() {
		if (this.character === undefined) return;

		const standingPart = this.collider?.getStandingPart(this.gravityUp);
		if (standingPart === undefined) return;

		if (standingPart === this.previousPart) {
			const offset = this.previousCFrame.ToObjectSpace(this.character.HumanoidRootPart.CFrame);
			this.character.HumanoidRootPart.CFrame = standingPart.CFrame.mul(offset);
		}

		this.previousPart = standingPart;
		this.previousCFrame = standingPart.CFrame;
	}

	onRender(dt: number) {
		if (this.character === undefined) return;

		const camera = Workspace.CurrentCamera!;

		const oldGravity = this.gravityUp;
		const newGravity = this.getGravityUp(oldGravity);

		if (newGravity !== oldGravity) {
			this.onUpVectorChanged.Fire(newGravity);
		}

		const sphericalArc = this.getCFrameRotationBetween(oldGravity, newGravity, camera.CFrame.XVector);
		const lerpedArc = new CFrame().Lerp(sphericalArc, TRANSITION);

		this.gravityUp = lerpedArc.mul(oldGravity);

		const fDot = camera.CFrame.ZVector.Dot(this.gravityUp);
		const cForward = math.abs(fDot) > 0.5 ? camera.CFrame.YVector.mul(math.sign(fDot)) : camera.CFrame.LookVector;

		const left = cForward.mul(-1).Cross(this.gravityUp).Unit;
		const forward = left.mul(-1).Cross(this.gravityUp).Unit;

		const move = this.control.getMoveVector();
		let worldMove = forward.mul(move.Z).sub(left.mul(move.X));

		let isInputMoving = false;
		const length = worldMove.Magnitude;
		if (length > 0) {
			isInputMoving = true;
			worldMove = worldMove.div(length);
		}

		const humanoidRootPartLookVector = this.character.HumanoidRootPart.CFrame.LookVector;
		const characterForward = forward
			.mul(humanoidRootPartLookVector.Dot(forward))
			.add(left.mul(humanoidRootPartLookVector.Dot(left)));
		const characterRight = characterForward.Cross(this.gravityUp).Unit;

		let newCharacterRotation = new CFrame();
		const newCharacterCFrame = CFrame.fromMatrix(
			new Vector3(),
			characterRight,
			this.gravityUp,
			characterForward.mul(-1),
		);

		if (isInputMoving) {
			newCharacterRotation = newCharacterRotation.Lerp(
				this.getCFrameRotationBetween(characterForward, worldMove, this.gravityUp),
				0.7,
			);
		}

		const gForce = this.gravityUp.mul(-GRAVITY * this.characterMass);

		const cVelocity = this.character.HumanoidRootPart.Velocity;
		const tVelocity = worldMove.mul(this.character.Humanoid.WalkSpeed);
		const gVelocity = this.gravityUp.mul(cVelocity.Dot(this.gravityUp));
		let hVelocity = cVelocity.sub(gVelocity);

		if (hVelocity.Dot(hVelocity) < 1) {
			hVelocity = new Vector3();
		}

		const dVelocity = tVelocity.sub(hVelocity);

		const walkForceM = math.min(10000, (WALK_FORCE * this.characterMass * dVelocity.Magnitude) / (dt * 60));
		const walkForce = walkForceM > 0 ? dVelocity.Unit.mul(walkForceM) : new Vector3();

		const charRotation = newCharacterRotation.mul(newCharacterCFrame);

		this.collider?.update(gForce.add(walkForce), charRotation);
	}

	private getCFrameRotationBetween(v1: Vector3, v2: Vector3, axis: Vector3) {
		const dot = v1.Dot(v2);
		const cross = v1.Cross(v2);
		if (dot < -0.99999) return CFrame.fromAxisAngle(axis, math.pi);
		return new CFrame(0, 0, 0, cross.X, cross.Y, cross.Z, 1 + dot);
	}

	private getModelMass(model: Model) {
		return model
			.GetDescendants()
			.filter((d) => d.IsA("BasePart") && !d.Massless)
			.reduce((sum, part) => sum + (part as BasePart).GetMass(), 0);
	}

	private getGravityUp(oldGravity: Vector3): Vector3 {
		if (this.character === undefined) return oldGravity;

		let closestPart: BasePart | undefined;
		let closestDistance = math.huge;

		for (const part of this.gravityInfluences) {
			const distance = part.Position.sub(this.character.HumanoidRootPart.Position).Magnitude;
			if (distance < closestDistance) {
				closestPart = part;
				closestDistance = distance;
			}
		}

		if (closestPart === undefined) return oldGravity;

		const newGravity = this.character.HumanoidRootPart.Position.sub(closestPart.Position).Unit;
		return newGravity;
	}

	public getUpVector() {
		return this.gravityUp;
	}

	private onRequestJump() {
		if (this.character === undefined || this.collider === undefined) return;
		if (!this.collider.isGrounded(true)) return;

		const velocity = this.character.HumanoidRootPart.Velocity;
		this.character.HumanoidRootPart.Velocity = velocity.add(
			this.gravityUp.mul(JUMP_MODIFIER * this.character.Humanoid.JumpPower),
		);
	}
}
