import { Action } from "@rbxts/rodux";
import { Scene } from "types/enum/scene";

export interface ActionSetScene extends Action<"SetScene"> {
	scene: Scene;
}
