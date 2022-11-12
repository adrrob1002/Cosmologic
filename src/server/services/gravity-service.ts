import { Service, OnStart, OnInit, OnTick } from "@flamework/core";
import Make from "@rbxts/make";
import { t } from "@rbxts/t";
import { attachSetToTag } from "shared/util/tag-utils";
import { Tag } from "types/enum/tags";

@Service({})
export class GravityService implements OnStart, OnInit, OnTick {
	private gravityInfluences = new Set<BasePart>();
	private gravityAffected = new Set<BasePart>();

	onInit() {}

	onStart() {}

	onTick(dt: number): void {}

	private calculateForce(part: BasePart, influence: BasePart, dt: number) {}

	private handleGravityAffected(part: BasePart) {}
}
