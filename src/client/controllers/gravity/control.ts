type ControlsModule = {
	GetMoveVector: (this: ControlsModule) => Vector3;
};

type PlayerModule = {
	GetControls: (this: PlayerModule) => ControlsModule;
};

export class Control {
	private controlModule: ControlsModule;

	constructor(player: Player) {
		const playerScripts = player.FindFirstChild("PlayerScripts");
		assert(playerScripts !== undefined, "PlayerScripts is undefined");

		const module = playerScripts.WaitForChild("PlayerModule") as ModuleScript | undefined;
		assert(module !== undefined, "PlayerModule is undefined");

		const playerModule = require(module) as PlayerModule;
		this.controlModule = playerModule.GetControls();
	}

	public getMoveVector(): Vector3 {
		return this.controlModule.GetMoveVector();
	}
}
