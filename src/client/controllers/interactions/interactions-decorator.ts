import { Modding } from "@flamework/core";
import { IClientStore } from "client/rodux/rodux";

export interface IInteractionConfig {
	/** `InteractionId` attribute to connect this interaction to */
	interactionId: string;
	/** String to show next to interaction keycode */
	interactionText: ((interactable: BasePart) => string) | string;
	/** String to show above interaction text */
	objectText?: ((interactable: BasePart) => string) | string;
	/** Callback for deciding if the interaction should be shown */
	shouldShowInteraction?: (interactable: BasePart, state: IClientStore) => boolean;
	/** Decides whether the camera position is used in whether or not the interaction is shown */
	useCameraPosition?: boolean;
	/** The keyboard key code required to interact */
	keyboardKeyCode?: Enum.KeyCode;
	/** The gamepad key code required to interact */
	gamepadKeyCode?: Enum.KeyCode;
	/** The maximum distance you can be away from the interaction and still interact */
	maxDistance?: number;
	/** Decides whether the interaction requires line of sight or not */
	requireLineOfSight?: boolean;
	/** Offset of the interaction UI */
	uiOffset?: Vector2;
	/** How long must the interaction be held for to be interacted with */
	holdDuration?: number;
}

export interface OnInteracted {
	/**
	 * Called when the player interacts.
	 * @param obj BasePart the player interacted with.
	 */
	onInteracted(obj: BasePart): void;
}

export const Interaction = Modding.createMetaDecorator<[IInteractionConfig]>("Class");
