import { Controller, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";
import { GravityController } from "./gravity/gravity-controller";

const player = Players.LocalPlayer;

type CameraModule = {
	GetUpVector: (this: CameraModule) => Vector3;
};

type PlayerModule = {
	GetCameras: (this: PlayerModule) => CameraModule;
};

@Controller({})
export class CameraController implements OnInit {
	private cameraModule!: CameraModule;

	constructor(private readonly gravityController: GravityController) {}

	onInit() {
		const playerModule = require((player.FindFirstChild("PlayerScripts")! as PlayerScripts).WaitForChild(
			"PlayerModule",
		) as ModuleScript) as PlayerModule;
		this.cameraModule = playerModule.GetCameras();

		this.enableGravityCamera();
	}

	public enableGravityCamera() {
		this.cameraModule.GetUpVector = () => this.gravityController.getUpVector();
	}

	public disableGravityCamera() {
		this.cameraModule.GetUpVector = () => new Vector3(0, 1, 0);
	}
}
