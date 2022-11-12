import { Controller, OnStart } from "@flamework/core";
import Log from "@rbxts/log";
import Signal from "@rbxts/signal";
import { ClientStore } from "client/rodux/rodux";
import { Scene } from "types/enum/scene";

@Controller({})
export class SceneController implements OnStart {
	public readonly onSceneChanged = new Signal<(scene: Scene, oldScene?: Scene) => void>();

	onStart() {
		// Call onSceneChangedCallback to capture current scene
		this.onSceneChangedCallback(this.getCurrentScene());

		// Subscribe to scene changes
		ClientStore.changed.connect((newState, oldState) => {
			if (newState.gameState.currentScene !== oldState.gameState.currentScene) {
				this.onSceneChangedCallback(newState.gameState.currentScene, oldState.gameState.currentScene);
			}
		});
	}

	/**
	 * Get the current scene
	 * @returns The current scene
	 */
	public getCurrentScene(): Scene {
		return ClientStore.getState().gameState.currentScene;
	}

	/**
	 * Get a signal for when a certain scene is entered
	 * @param scene Fire the signal when this scene is entered
	 * @returns A signal that fires when the given scene is entered
	 */
	public getSceneEnteredSignal(scene: Scene): Signal {
		const signal = new Signal();

		this.onSceneChanged.Connect((newScene, oldScene) => {
			if (newScene === scene) signal.Fire();
		});

		return signal;
	}

	/**
	 * Set the current scene
	 * @param scene The desired scene
	 */
	public setScene(scene: Scene) {
		ClientStore.dispatch({
			type: "SetScene",
			scene,
		});
	}

	/**
	 * Callback for when the scene changes
	 * @param newScene The new scene
	 * @param oldScene The old scene
	 */
	private onSceneChangedCallback(newScene: Scene, oldScene?: Scene) {
		if (oldScene !== undefined) {
			Log.Info(`Scene changed from {OldScene} to {NewScene}`, oldScene, newScene);
		} else {
			Log.Info(`Scene changed to {Scene}`, newScene);
		}

		this.onSceneChanged.Fire(newScene, oldScene);
	}
}
