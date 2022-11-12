import { Flamework } from "@flamework/core";
import Log, { Logger, LogLevel } from "@rbxts/log";
import { RunService } from "@rbxts/services";

Flamework.addPaths("src/client/components");
Flamework.addPaths("src/client/controllers");
Flamework.addPaths("src/client/interactions");
Flamework.addPaths("src/client/apps");
Flamework.addPaths("src/shared/components");

Log.SetLogger(
	Logger.configure()
		.SetMinLogLevel(RunService.IsStudio() ? LogLevel.Verbose : LogLevel.Information)
		.EnrichWithProperty("Version", _VERSION)
		.WriteTo(Log.RobloxOutput())
		.Create(),
);

Flamework.ignite();
