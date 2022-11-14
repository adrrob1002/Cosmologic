import Make from "@rbxts/make";
import { CollectionService, Workspace } from "@rbxts/services";
import { Interaction, OnInteracted } from "client/controllers/interactions/interactions-decorator";
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

		switch (spawnerType) {
			case "WoodenCrate": {
				const crate = Make("Part", {
					Name: "WoodenCrate",
					Anchored: false,
					BrickColor: new BrickColor("Brown"),
					CanCollide: true,
					FormFactor: Enum.FormFactor.Custom,
					Material: Enum.Material.Wood,
					Position: obj.Position,
					Size: new Vector3(2, 2, 2),
					Parent: Workspace,
				});

				CollectionService.AddTag(crate, Tag.Draggable);
				CollectionService.AddTag(crate, Tag.GravityAffected);

				break;
			}

			default:
				break;
		}
	}
}
