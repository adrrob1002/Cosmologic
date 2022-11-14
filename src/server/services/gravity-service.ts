import { Service, OnStart, OnInit } from "@flamework/core";
import { ReplicatedStorage, StarterPlayer } from "@rbxts/services";

@Service({})
export class GravityService implements OnStart, OnInit {
	onInit() {
		const StarterPlayerScripts = StarterPlayer.WaitForChild("StarterPlayerScripts");

		const replace = (child: Instance, parent: Instance) => {
			const found = parent.FindFirstChild(child.Name);
			if (found !== undefined) found.Destroy();
			child.Parent = parent;
		};

		replace(ReplicatedStorage.PlayerScriptsLoader, StarterPlayerScripts);
	}

	onStart() {}
}
