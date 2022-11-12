import { Service, OnStart, OnInit } from "@flamework/core";
import { GAME_NAME } from "shared/shared-constants";
import { KickCode } from "types/enum/kick-reasons";

@Service({})
export class PlayerRemovalService {
	/**
	 * Kick a player due to a reason
	 * @param player The player to remove
	 * @param code The related kick code
	 */
	public removeForBug(player: Player, code: KickCode) {
		player.Kick(
			"\n\nYou were kicked from the game due to a bug. Please report" +
				"this bug in our communications server.\n\n" +
				`(${GAME_NAME} Error Code: ${code})`,
		);
	}
}
