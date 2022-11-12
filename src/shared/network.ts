import { Networking } from "@flamework/networking";
import { IServerResponse } from "types/interfaces/network-types";
import { IPlayerData } from "./meta/default-player-data";

interface ServerEvents {}

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
