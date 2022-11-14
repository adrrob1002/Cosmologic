import { Service, OnStart, OnInit } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import { Events } from "server/network";

@Service({})
export class GrabService implements OnStart {
	onStart() {
		Events.requestNetworkOwner.connect((player, part) => {
			if (CollectionService.HasTag(part, "Grabbable") && part.Parent !== undefined) {
				// TODO - Add check if it doesn't already belong to another player
				part.SetNetworkOwner(player);
			}
		});
	}
}
