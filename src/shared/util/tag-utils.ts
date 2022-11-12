import Log from "@rbxts/log";
import Signal from "@rbxts/signal";
import { t } from "@rbxts/t";
import { CollectionService } from "@rbxts/services";

export function attachSetToTag<T extends Instance>(set: Set<T>, tag: string, instanceGuard: t.check<T>) {
	const onAdded = new Signal<(obj: T) => void>();

	const handleInstance = (obj: Instance) => {
		if (!instanceGuard(obj)) {
			Log.Warn(`Instance "{@Instance}" cannot be added to array`, obj.GetFullName());
			return;
		}

		set.add(obj);
		onAdded.Fire(obj);
	};

	task.defer(() => {
		CollectionService.GetTagged(tag).forEach(handleInstance);
		CollectionService.GetInstanceAddedSignal(tag).Connect(handleInstance);
		CollectionService.GetInstanceRemovedSignal(tag).Connect((obj) => set.delete(obj as T));
	});

	return onAdded;
}
