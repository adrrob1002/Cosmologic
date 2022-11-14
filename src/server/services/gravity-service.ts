import { Service, OnStart, OnInit, OnPhysics } from "@flamework/core";
import Log from "@rbxts/log";
import Make from "@rbxts/make";
import { ReplicatedStorage, StarterPlayer } from "@rbxts/services";
import { t } from "@rbxts/t";
import { GRAVITY } from "shared/shared-constants";
import { attachSetToTag } from "shared/util/tag-utils";
import { Tag } from "types/enum/tags";

@Service({})
export class GravityService implements OnInit, OnPhysics {
	private gravityInfluences = new Set<BasePart>();
	private gravityAffected = new Set<BasePart | Model>();

	onInit(): void {
		const influenceAdded = attachSetToTag(this.gravityInfluences, Tag.GravityInfluence, t.instanceIsA("BasePart"));
		const affectedAdded = attachSetToTag(
			this.gravityAffected,
			Tag.GravityAffected,
			t.union(t.instanceIsA("BasePart"), t.instanceIsA("Model")),
		);

		this.gravityAffected.forEach((part) => this.initialiseAffectedInstance(part));
		affectedAdded.Connect((part) => this.initialiseAffectedInstance(part));
	}

	onPhysics(dt: number): void {
		this.gravityAffected.forEach((object) => {
			const vectorForce = object.FindFirstChild("GravityVectorForce", true) as VectorForce | undefined;
			if (vectorForce === undefined) return;

			const attachment = object.FindFirstChild("GravityAttachment", true) as Attachment | undefined;
			if (attachment === undefined) return;

			const position = attachment.WorldPosition;
			const gravityDirection = this.getGravityDirection(position);

			const mass = this.getAffectedInstanceMass(object);

			vectorForce.Force = gravityDirection.mul(-GRAVITY * mass);
		});
	}

	private initialiseAffectedInstance(object: BasePart | Model) {
		const part = object.IsA("Model")
			? object.PrimaryPart !== undefined
				? object.PrimaryPart
				: object.FindFirstChildWhichIsA("BasePart")
			: object;
		if (part === undefined) return Log.Error("{@Instance} does not have a valid part", object);

		// Make an attachment
		const attachment = Make("Attachment", {
			Name: "GravityAttachment",
			Parent: part,
		});

		// Give the part a VectorForce
		const vectorForce = Make("VectorForce", {
			Name: "GravityVectorForce",
			RelativeTo: Enum.ActuatorRelativeTo.World,
			Attachment0: attachment,
			ApplyAtCenterOfMass: true,
			Force: new Vector3(),
			Parent: part,
		});
	}

	private getAffectedInstanceMass(object: BasePart | Model): number {
		if (object.IsA("Model")) {
			// loop through all descendants of the model and add up their masses
			return object
				.GetDescendants()
				.filter((descendant) => descendant.IsA("BasePart"))
				.reduce((totalMass, part) => totalMass + (part as BasePart).GetMass(), 0);
		} else {
			return object.GetMass();
		}
	}

	private getGravityDirection(position: Vector3): Vector3 {
		let closestPart: BasePart | undefined;
		let closestDistance = math.huge;

		for (const part of this.gravityInfluences) {
			const distance = part.Position.sub(position).Magnitude;
			if (distance < closestDistance) {
				closestPart = part;
				closestDistance = distance;
			}
		}

		if (closestPart === undefined) return new Vector3();

		const newGravity = position.sub(closestPart.Position).Unit;
		return newGravity;
	}
}
