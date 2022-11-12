import { Interaction, OnInteracted } from "client/controllers/interactions/interactions-decorator";

@Interaction({
	interactionId: "Test",
	interactionText: "Interact",
	objectText: "Test Interaction",
	useCameraPosition: true,
})
export class TestInteractions implements OnInteracted {
	public onInteracted(obj: BasePart) {
		obj.BrickColor = BrickColor.random();
	}
}
