export class WallstickCamera {
	constructor(private player: Player) {
		const playerModuleScript = player.FindFirstChild("PlayerScripts")?.WaitForChild("PlayerModule") as
			| ModuleScript
			| undefined;
		if (playerModuleScript === undefined) return;

		const playerModule = require(playerModuleScript);
	}
}
