import { OnStart, Service } from "@flamework/core";
import playerEntity from "server/modules/classes/player-entity";
import { OnPlayerJoin } from "./player/player-service";

@Service({})
export class CharacterService implements OnPlayerJoin, OnStart {
	onStart() {}

	onPlayerJoin(playerEntity: playerEntity): void {}
}
