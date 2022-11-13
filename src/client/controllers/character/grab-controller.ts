import { Controller, OnInit, OnPhysics, OnStart } from "@flamework/core";
import { Mouse } from "@rbxts/clack";
import Make from "@rbxts/make";
import { CollectionService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { Events } from "client/network";
import { Tag } from "types/enum/tags";

const MAX_RANGE = 20;
const HOLD_DISTANCE = 15;

@Controller({})
export class GrabController implements OnStart, OnInit, OnPhysics {
	private currentlyGrabbed?: BasePart;
	private alignPosition?: AlignPosition;

	private mouse = new Mouse();
	private trove = new Trove();

	onInit() {}

	onStart() {
		this.mouse.getButtonDownSignal(Enum.UserInputType.MouseButton1).Connect((position) => {
			const result = this.mouse.raycast(new RaycastParams(), MAX_RANGE);
			if (result && result.Instance && CollectionService.HasTag(result.Instance, Tag.Draggable)) {
				this.currentlyGrabbed = result.Instance;
				Events.requestNetworkOwner.fire(this.currentlyGrabbed);

				const dragAttachment = Make("Attachment", {
					Name: "DragAttachment",
					Position: this.currentlyGrabbed.CFrame.PointToObjectSpace(result.Position),
					Parent: this.currentlyGrabbed,
				});

				const dragPosition = Make("AlignPosition", {
					Name: "DragForce",
					Attachment0: dragAttachment,
					MaxForce: 100000,
					Mode: Enum.PositionAlignmentMode.OneAttachment,
					Parent: this.currentlyGrabbed,
				});

				const highlight = Make("Highlight", {
					Name: "Highlight",
					DepthMode: Enum.HighlightDepthMode.Occluded,
					FillTransparency: 1,
					Parent: this.currentlyGrabbed,
				});

				this.alignPosition = dragPosition;

				this.trove.add(dragAttachment);
				this.trove.add(dragPosition);
				this.trove.add(highlight);
			}
		});

		this.mouse.getButtonUpSignal(Enum.UserInputType.MouseButton1).Connect(() => {
			this.trove.clean();
		});
	}

	onPhysics() {
		if (this.currentlyGrabbed === undefined || this.alignPosition === undefined) return;

		const idealPosition = this.mouse.project(HOLD_DISTANCE);
		this.alignPosition.Position = idealPosition;
	}
}
