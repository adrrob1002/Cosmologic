import { Action } from "@rbxts/rodux";
import { IPlayerData } from "shared/meta/default-player-data";

export interface ActionSetPlayerData extends Action<"SetPlayerData"> {
	newPlayerData: Partial<IPlayerData>;
}
