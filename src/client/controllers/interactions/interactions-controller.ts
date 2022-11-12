import { Controller, OnStart, OnInit, OnTick, Modding } from "@flamework/core";
import Log from "@rbxts/log";
import Make from "@rbxts/make";
import { Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import { ClientStore } from "client/rodux/rodux";
import { attachSetToTag } from "shared/util/tag-utils";
import { CollisionGroup } from "types/enum/collision-groups";
import { Tag } from "types/enum/tags";
import { CharacterController } from "../character/character-controller";
import { IInteractionConfig, Interaction, OnInteracted } from "./interactions-decorator";

type Ctor = OnInteracted;

interface IInteractionInfo {
	ctor: Ctor;
	config: IInteractionConfig;
}

const overlapParams = new OverlapParams();
overlapParams.CollisionGroup = CollisionGroup.Interactable;
overlapParams.MaxParts = 20;

const maxInteractionDistance = 20;

@Controller({})
export class InteractionsController implements OnStart, OnInit, OnTick {
	private log = Log.ForScript();

	private registeredInteractions = new Map<string, IInteractionInfo>();
	private interactableInstances = new Set<BasePart>();

	private currentRoduxState = ClientStore.getState();

	constructor(private readonly characterController: CharacterController) {}

	onInit() {
		const onInteractableAdded = attachSetToTag(
			this.interactableInstances,
			Tag.Interactable,
			t.instanceIsA("BasePart"),
		);
		this.interactableInstances.forEach((o) => this.handleInteractable(o));
		onInteractableAdded.Connect((o) => this.handleInteractable(o));
	}

	onStart() {
		const constructors = Modding.getDecorators<typeof Interaction>();
		for (const { object, arguments: args } of constructors) {
			this.registeredInteractions.set(args[0].interactionId, {
				ctor: object as unknown as Ctor,
				config: args[0],
			});
		}
		this.log.Info(`Registered {Interactions} interactions`, this.registeredInteractions.size());

		ClientStore.changed.connect((newState) => {
			this.currentRoduxState = newState;
		});
	}

	onTick() {
		debug.profilebegin("Interaction_Tick");

		// only run if we have a character
		const character = this.characterController.getCharacter();
		if (character === undefined) return debug.profileend();

		// find all interactable parts around the character
		const currentPosition = character.HumanoidRootPart.Position;
		for (const interactable of this.interactableInstances) {
			const prompt = interactable.FindFirstChildWhichIsA("ProximityPrompt");
			if (prompt === undefined) continue;

			const interactionId = interactable.GetAttribute("InteractionId");
			const interactionInfo =
				interactionId !== undefined && t.string(interactionId)
					? this.registeredInteractions.get(interactionId)
					: undefined;
			if (interactionInfo === undefined) {
				prompt.Enabled = false;
				continue;
			}

			const { config } = interactionInfo;

			const shouldOpen =
				(config.shouldShowInteraction
					? config.shouldShowInteraction(interactable, this.currentRoduxState)
					: true) &&
				(config.useCameraPosition && Workspace.CurrentCamera
					? Workspace.CurrentCamera.CFrame.Position
					: currentPosition
				)
					// eslint-disable-next-line roblox-ts/lua-truthiness
					.sub(interactable.Position).Magnitude <= (config.maxDistance || maxInteractionDistance);

			prompt.Enabled = shouldOpen;
		}
	}

	private handleInteractable(interactable: BasePart) {
		const interactionId = interactable.GetAttribute("InteractionId");
		if (interactionId === undefined || !t.string(interactionId)) {
			return this.log.Warn(
				`{@Interactable} missing valid 'InteractionId' attribute (got {@Attribute})`,
				interactable,
				interactionId,
			);
		}

		const interactionInfo = this.registeredInteractions.get(interactionId);
		if (interactionInfo === undefined) {
			return this.log.Warn(
				"{@InteractionId} is not a registered interaction (Interactable '{@Interactable}')",
				interactionId,
				interactable,
			);
		}

		const { config } = interactionInfo;

		// eslint-disable-next-line prettier/prettier
		const interactionText = typeIs(config.interactionText, "function") ? config.interactionText(interactable) : config.interactionText;
		const objectText = typeIs(config.objectText, "function") ? config.objectText(interactable) : config.objectText;

		const prompt = Make("ProximityPrompt", {
			Name: `ManagedInteractionPrompt_${interactionId}`,
			Parent: interactable,

			ActionText: interactionText,
			ObjectText: objectText,
			UIOffset: config.uiOffset,
			KeyboardKeyCode: config.keyboardKeyCode,
			GamepadKeyCode: config.gamepadKeyCode,
			HoldDuration: config.holdDuration,
			MaxActivationDistance: config.maxDistance ?? maxInteractionDistance,
			RequiresLineOfSight: config.requireLineOfSight ?? false,
		});

		prompt.Triggered.Connect(() => {
			this.log.Verbose("Interactable {@Interactable} triggered", interactable);
			interactionInfo.ctor.onInteracted(interactable);
		});

		this.log.Verbose("Interactable {@Interactable} setup", interactable);
	}
}
