import { OnStart, Service } from "@flamework/core";
import Make from "@rbxts/make";
import { CollectionService, Workspace } from "@rbxts/services";
import { Events } from "server/network";
import { BlockType } from "types/enum/block-types";
import { Tag } from "types/enum/tags";

@Service({})
export class SpawningService implements OnStart {
	onStart() {
		Events.spawnBlock.connect((player, blockType, position) => {
			if (blockType === "Wood") {
				const woodBlock = Make("Part", {
					Name: "Wood",
					Anchored: false,
					BrickColor: new BrickColor("Brown"),
					CanCollide: true,
					FormFactor: Enum.FormFactor.Custom,
					Material: Enum.Material.Wood,
					Position: position,
					Size: new Vector3(2, 2, 2),
					Parent: Workspace,
				});

				CollectionService.AddTag(woodBlock, Tag.Draggable);
				CollectionService.AddTag(woodBlock, Tag.GravityAffected);

				woodBlock.SetNetworkOwner(player);
			} else if (blockType === "Stone") {
				const stoneBlock = Make("Part", {
					Name: "Stone",
					Anchored: false,
					BrickColor: new BrickColor("Dark stone grey"),
					CanCollide: true,
					FormFactor: Enum.FormFactor.Custom,
					Material: Enum.Material.Concrete,
					Position: position,
					Size: new Vector3(2, 2, 2),
					Parent: Workspace,
				});

				CollectionService.AddTag(stoneBlock, Tag.Draggable);
				CollectionService.AddTag(stoneBlock, Tag.GravityAffected);

				stoneBlock.SetNetworkOwner(player);
			}
		});
	}
}
