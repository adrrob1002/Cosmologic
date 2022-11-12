import { Service, OnStart, OnInit } from "@flamework/core";
import ProfileService from "@rbxts/profileservice";
import { Players } from "@rbxts/services";
import DefaultPlayerData, { IPlayerData, PlayerDataProfile } from "shared/meta/default-player-data";
import { KickCode } from "types/enum/kick-reasons";
import { PlayerRemovalService } from "./player-removal-service";

@Service({})
export class PlayerDataService {
	constructor(private readonly removalService: PlayerRemovalService) {}

	private gameProfileStore = ProfileService.GetProfileStore<IPlayerData>("PlayerData", DefaultPlayerData);

	public async loadPlayerProfile(player: Player): Promise<PlayerDataProfile | void> {
		const dataKey = tostring(player.UserId);
		const profile = this.gameProfileStore.LoadProfileAsync(dataKey, "ForceLoad");

		// The profile was not able to be loaded
		// Most likely due to other Roblox servers trying to load this profile at the same time
		if (profile === undefined) return this.removalService.removeForBug(player, KickCode.PlayerProfileUndefined);

		// The player left before the profile was able to be loaded
		if (!player.IsDescendantOf(Players)) profile.Release();

		// Fill in the missing data from default data
		profile.Reconcile();

		// Listen for when profile releases. This happens when the player's profile
		// is loaded on another server, or when the player leaves the game.
		profile.ListenToRelease(() => {
			if (!player.IsDescendantOf(game)) return;
			this.removalService.removeForBug(player, KickCode.PlayerProfileReleased);
		});

		return profile;
	}
}
