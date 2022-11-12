import { createReducer } from "@rbxts/rodux";
import { Scene } from "types/enum/scene";
import { ActionSetScene } from "../actions/scene-actions";

export interface IGameReducer {
	currentScene: Scene;
}

const InitialState: IGameReducer = {
	currentScene: Scene.World,
};

export type GameActions = ActionSetScene;

export const gameReducer = createReducer<IGameReducer, GameActions>(InitialState, {
	SetScene: (state, action) => {
		return {
			...state,
			currentScene: action.scene,
		};
	},
});
