import { Service, OnStart, OnInit } from "@flamework/core";
import promiseR15 from "@rbxts/promise-character";
import { promiseChild } from "@rbxts/promise-child";
import { CollectionService } from "@rbxts/services";
import playerEntity from "server/modules/classes/player-entity";
import { Tag } from "types/enum/tags";
import { OnPlayerJoin } from "./player/player-service";

@Service({})
export class CharacterService implements OnPlayerJoin, OnStart {
	onStart() {}

	onPlayerJoin(playerEntity: playerEntity): void {
		const { player } = playerEntity;
		if (player.Character) this.characterAdded(player.Character);
		player.CharacterAdded.Connect((c) => this.characterAdded(c));
	}

	private async characterAdded(_c: Model) {
		const humanoidRootPart = await promiseChild(_c, "HumanoidRootPart");
		if (humanoidRootPart === undefined) return;
		// CollectionService.AddTag(humanoidRootPart, Tag.GravityAffected);
	}
}
