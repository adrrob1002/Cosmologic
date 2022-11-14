import Make from "@rbxts/make";
import { CharacterRigR15, CharacterRigR6 } from "@rbxts/promise-character";
import { Workspace } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { GravityController } from "./gravity-controller";

const CUSTOM_PHYSICAL_PROPERTIES = new PhysicalProperties(0.7, 0, 0, 1, 100);

export class Collider {
	private trove = new Trove();

	private model: Model;
	private sphere: Part;
	private floorDetector: Part;
	private jumpDetector: Part;

	private vectorForce: VectorForce;
	private alignOrientation: AlignOrientation;

	constructor(private character: CharacterRigR6 | CharacterRigR15) {
		this.model = new Instance("Model");
		this.model.Name = "Collider";

		const hipHeight = this.getHipHeight();
		const attachment = this.getAttachment();
		assert(attachment !== undefined, "Attachment is undefined");

		attachment.Orientation = new Vector3(0, 90, 0);

		this.sphere = Make("Part", {
			Name: "Sphere",
			Massless: true,
			Size: new Vector3(2, 2, 2),
			Shape: Enum.PartType.Ball,
			Transparency: 1,
			CustomPhysicalProperties: CUSTOM_PHYSICAL_PROPERTIES,
			Parent: this.model,
		});

		this.floorDetector = Make("Part", {
			Name: "FloorDetector",
			CanCollide: false,
			Massless: true,
			Size: new Vector3(2, 1, 1),
			Transparency: 1,
			Parent: this.model,
		});

		this.jumpDetector = Make("Part", {
			Name: "JumpDetector",
			CanCollide: false,
			Massless: true,
			Size: new Vector3(2, 0.2, 1),
			Transparency: 1,
			Parent: this.model,
		});

		Make("Weld", {
			C0: new CFrame(0, -hipHeight, 0.1),
			Part0: character.HumanoidRootPart,
			Part1: this.sphere,
			Parent: this.sphere,
		});

		Make("Weld", {
			C0: new CFrame(0, -hipHeight - 1.5, 0),
			Part0: character.HumanoidRootPart,
			Part1: this.floorDetector,
			Parent: this.floorDetector,
		});

		Make("Weld", {
			C0: new CFrame(0, -hipHeight - 1.1, 0),
			Part0: character.HumanoidRootPart,
			Part1: this.jumpDetector,
			Parent: this.jumpDetector,
		});

		this.vectorForce = Make("VectorForce", {
			Force: new Vector3(0, 0, 0),
			ApplyAtCenterOfMass: true,
			RelativeTo: Enum.ActuatorRelativeTo.World,
			Attachment0: attachment,
			Parent: character.HumanoidRootPart,
		});

		this.alignOrientation = Make("AlignOrientation", {
			Mode: Enum.OrientationAlignmentMode.OneAttachment,
			Attachment0: attachment,
			PrimaryAxis: character.HumanoidRootPart.CFrame.LookVector,
			SecondaryAxis: character.HumanoidRootPart.CFrame.UpVector,
			MaxTorque: 100000,
			Responsiveness: 50,
			Parent: character.HumanoidRootPart,
		});

		this.floorDetector.Touched.Connect((part) => {});
		this.jumpDetector.Touched.Connect((part) => {});

		this.trove.add(this.model);
		this.trove.add(this.vectorForce);
		this.trove.add(this.alignOrientation);

		this.model.Parent = this.character;
	}

	private getHipHeight(): number {
		if (this.character === undefined) return 0;
		const humanoid = this.character.Humanoid;

		if (humanoid.RigType === Enum.HumanoidRigType.R15) return humanoid.HipHeight + 0.05;
		return 2;
	}

	private getAttachment(): Attachment | undefined {
		if (this.character === undefined) return;
		const humanoid = this.character.Humanoid;

		if (humanoid.RigType === Enum.HumanoidRigType.R15) {
			return (this.character as CharacterRigR15).HumanoidRootPart.RootRigAttachment;
		}

		return (this.character as CharacterRigR6).HumanoidRootPart.RootAttachment;
	}

	public update(force: Vector3, cframe: CFrame) {
		this.vectorForce.Force = force;
		this.alignOrientation.PrimaryAxis = cframe.LookVector;
		this.alignOrientation.SecondaryAxis = cframe.UpVector;
	}

	public isGrounded(isJumpCheck: boolean): boolean {
		const parts = (isJumpCheck ? this.jumpDetector : this.floorDetector).GetTouchingParts();
		for (const part of parts) {
			if (!part.IsDescendantOf(this.character) && part.CanCollide) return true;
		}
		return false;
	}

	public getStandingPart(gravityUp: Vector3): BasePart | undefined {
		const raycastParams = new RaycastParams();
		raycastParams.FilterType = Enum.RaycastFilterType.Blacklist;
		raycastParams.FilterDescendantsInstances = [this.character];

		const result = Workspace.Raycast(this.sphere.Position, gravityUp.mul(-1.1), raycastParams);

		if (result && result.Instance.IsA("BasePart")) return result.Instance;
	}

	public destroy() {
		this.trove.destroy();
	}
}
