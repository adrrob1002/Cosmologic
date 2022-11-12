import { Controller, OnStart, OnInit, OnPhysics, OnTick } from "@flamework/core";
import Luanoid from "@rbxts/luanoid";
import { Players, Workspace } from "@rbxts/services";

const localPlayer = Players.LocalPlayer;
const camera = Workspace.CurrentCamera!;

@Controller({})
export class LuanoidController implements OnStart, OnTick {
	private currentLuanoid?: Luanoid;

	onStart() {
		Players.GetPlayers().forEach((player) => this.playerAdded(player));
		Players.PlayerAdded.Connect((player) => this.playerAdded(player));
	}

	onTick(dt: number): void {
		if (this.currentLuanoid === undefined || this.currentLuanoid.Character.Parent === undefined) return;
	}

	private playerAdded(player: Player) {
		this.makeLuanoidForPlayer(player);
		player.CharacterAdded.Connect(() => this.makeLuanoidForPlayer(player));
	}

	private makeLuanoidForPlayer(player: Player) {
		const character = player.Character;
		if (character === undefined) return;

		const humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

		const luanoid = new Luanoid(character);
		luanoid.ApplyDescription(this.getHumanoidDescription(player), Enum.HumanoidRigType.R15);

		if (player !== localPlayer) return;

		luanoid.CharacterController.Start();
		camera.CameraSubject = luanoid.RootPart;
		camera.CameraType = Enum.CameraType.Custom;
		this.currentLuanoid = luanoid;
	}

	private getHumanoidDescription(player: Player): HumanoidDescription {
		if (player.UserId > 0) {
			return Players.GetHumanoidDescriptionFromUserId(player.UserId);
		} else {
			return new Instance("HumanoidDescription");
		}
	}
}
