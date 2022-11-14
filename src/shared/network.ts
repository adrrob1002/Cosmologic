import { Networking } from "@flamework/networking";
import { BlockType } from "types/enum/block-types";
import { IServerResponse } from "types/interfaces/network-types";
import { IPlayerData } from "./meta/default-player-data";

interface ServerEvents {
	/** Fired by the client when the client wishes to gain network ownership of a BasePart */
	requestNetworkOwner(part: BasePart): void;
	/** Called by the client when a block needs to be spawned */
	spawnBlock(blockType: string, position: Vector3): void;
}

interface ClientEvents {
	/** Fired by the server when the player data changes */
	playerDataChanged(newPlayerData: Partial<IPlayerData>): void;
}

interface ServerFunctions {
	/** Called on the client to request updated player data */
	requestPlayerData(): IServerResponse<IPlayerData>;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
