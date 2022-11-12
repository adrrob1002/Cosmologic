import { Controller, OnStart, OnInit, Modding } from "@flamework/core";
import Log from "@rbxts/log";
import Roact from "@rbxts/roact";
import RoactRodux, { StoreProvider } from "@rbxts/roact-rodux";
import Rodux from "@rbxts/rodux";
import { Players } from "@rbxts/services";
import { ClientStore, IClientStore, StoreActions } from "client/rodux/rodux";
import { Scene } from "types/enum/scene";
import { SceneController } from "./scene-controller";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = Roact.Component> = new (...args: any[]) => T;

const noop = () => {};

export type StoreDispatch = Rodux.Dispatch<StoreActions>;

export interface IAppConfig {
	/** Debug name for the app */
	name: string;
	/** Only show the app if we are in one of these scenes */
	requiredScenes?: Scene[];
	/** Display order  */
	displayOrder?: number;
	/** Ignore top bar GUI inset */
	ignoreGuiInset?: boolean;
	mapStateToProps?: (state: IClientStore) => unknown;
	mapDispatchToProps?: (dispatch: StoreDispatch) => unknown;
}

export const App = Modding.createMetaDecorator<[IAppConfig]>("Class");

@Controller({})
export class AppController implements OnInit {
	private apps = new Map<Constructor, IAppConfig>();
	private appHandles = new Map<Constructor, Roact.Tree>();

	private playerGui = Players.LocalPlayer.FindFirstChildOfClass("PlayerGui")!;

	constructor(private readonly sceneController: SceneController) {}

	onInit() {
		this.sceneController.onSceneChanged.Connect((n, o) => this.onSceneChanged(n, o));

		const constructors = Modding.getDecorators<typeof App>();
		for (const { object, arguments: args } of constructors) {
			this.apps.set(object as unknown as Constructor, args[0]);
		}
	}

	private onSceneChanged(newScene: Scene, oldScene?: Scene) {
		for (const [constructor, config] of this.apps) {
			if (config.requiredScenes === undefined) continue;

			const usedToBeOpen = oldScene !== undefined ? config.requiredScenes.includes(oldScene) : false;
			const isOpen = config.requiredScenes.includes(newScene);

			if (usedToBeOpen && !isOpen) {
				// Close the app
				Log.Debug(`HIDING app "{Name}"`, config.name);
				this.hideApp(constructor);
			} else if (!usedToBeOpen && isOpen) {
				// Open the app
				Log.Debug(`SHOWING app "{Name}"`, config.name);
				this.showApp(constructor);
			}
		}
	}

	private showApp(element: Constructor) {
		const config = this.apps.get(element);
		if (config === undefined) return;

		let component = element as unknown as Roact.FunctionComponent;
		if (config.mapStateToProps !== undefined || config.mapDispatchToProps !== undefined) {
			const mapStateToProps = config.mapStateToProps || noop;
			const mapDispatchToProps = config.mapDispatchToProps || noop;

			component = RoactRodux.connect(
				(state: IClientStore) => mapStateToProps(state),
				(dispatch: StoreDispatch) => mapDispatchToProps(dispatch),
			)(component);
		}

		const content = <StoreProvider store={ClientStore}>{Roact.createElement(component)}</StoreProvider>;

		const handle = Roact.mount(
			<screengui
				Key={config.name}
				DisplayOrder={config.displayOrder}
				IgnoreGuiInset={config.ignoreGuiInset}
				ResetOnSpawn={false}
				ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
			>
				{content}
			</screengui>,
			this.playerGui,
			config.name,
		);

		this.appHandles.set(element, handle);
		Log.Debug(`Mounted app "{Name}"`, config.name);
	}

	private hideApp(element: Constructor) {
		const handle = this.appHandles.get(element);
		if (handle === undefined) return Log.Warn(`No handle for element {@Element}`, element);

		Roact.unmount(handle);
		this.appHandles.delete(element);
	}
}
