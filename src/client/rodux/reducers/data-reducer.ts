import { createReducer } from "@rbxts/rodux";
import DefaultPlayerData, { IPlayerData } from "shared/meta/default-player-data";
import { ActionSetPlayerData } from "../actions/data-actions";

export type IDataReducer = IPlayerData;

const InitialState: IDataReducer = DefaultPlayerData;

export type DataActions = ActionSetPlayerData;

export const dataReducer = createReducer<IDataReducer, DataActions>(InitialState, {
	SetPlayerData: (state, action) => {
		return { ...state, ...action.newPlayerData };
	},
});
