import { Controller, OnInit, OnRender, OnStart } from "@flamework/core";
import { Mouse } from "@rbxts/clack";
import { Players, Workspace } from "@rbxts/services";
import { CharacterController } from "./character/character-controller";
import { GravityController } from "./gravity/gravity-controller";

const player = Players.LocalPlayer;

@Controller({})
export class CameraController implements OnInit, OnStart, OnRender {
	private humanoidRootPart?: BasePart;
	private angle = new Vector2();

	private mouse!: Mouse;
	private lastMousePosition = new Vector2();

	constructor(
		private readonly gravityController: GravityController,
		private readonly characterController: CharacterController,
	) {}

	onInit() {
		this.mouse = new Mouse();
	}

	onStart() {
		this.characterController.onCharacterAdded.Connect((character) => {
			this.humanoidRootPart = character.HumanoidRootPart;
		});
	}

	onRender(dt: number) {
		if (this.humanoidRootPart === undefined) return;

		const camera = Workspace.CurrentCamera;
		if (camera === undefined) return;

		if (this.mouse.isButtonDown(Enum.UserInputType.MouseButton2)) {
			const mouseDelta = this.mouse.getPosition().sub(this.lastMousePosition);
			this.angle = this.angle.add(mouseDelta.mul(new Vector2(-1, 1)).mul(0.01));
		}

		this.lastMousePosition = this.mouse.getPosition();

		const upVector = this.gravityController.getUpVector();
		// get a vector that is angle.Y radians from the up vector
		const rightVector = this.rotateVectorAboutVector(upVector, new Vector3(0, 0, 1), this.angle.Y).Unit;
		const offset = this.rotateVectorAboutVector(rightVector.mul(10), upVector, this.angle.X);

		camera.CameraType = Enum.CameraType.Scriptable;

		camera.CFrame = CFrame.lookAt(
			this.humanoidRootPart.Position.add(offset),
			this.humanoidRootPart.Position
			upVector,
		);

		// this.angle = this.angle.add(new Vector2(((2 * math.pi) / 10) * dt, -((2 * math.pi) / 10) * dt));
	}

	private rotateVectorAboutVector(vectorA: Vector3, vectorB: Vector3, angle: number) {
		const rotationMatrix = CFrame.fromAxisAngle(vectorB, angle);
		return rotationMatrix.mul(vectorA);
	}
}
