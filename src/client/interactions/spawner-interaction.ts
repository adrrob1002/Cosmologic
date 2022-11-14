import Make from "@rbxts/make";
import { CollectionService, Workspace } from "@rbxts/services";
import { Interaction, OnInteracted } from "client/controllers/interactions/interactions-decorator";
import { Events } from "client/network";
import { BlockType } from "types/enum/block-types";
import { Tag } from "types/enum/tags";

@Interaction({
	interactionId: "Spawner",
	interactionText: (interactable) => {
		return `Spawn ${interactable.GetAttribute("SpawnerType")}`;
	},
})
export class SpawnerInteraction implements OnInteracted {
	public onInteracted(obj: BasePart) {
		const spawnerType = obj.GetAttribute("SpawnerType");
		if (spawnerType === undefined) return;
		Events.spawnBlock.fire(tostring(spawnerType), obj.Position);
	}
}
