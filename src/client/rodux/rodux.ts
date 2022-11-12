import { combineReducers, Store, thunkMiddleware } from "@rbxts/rodux";
import { DataActions, dataReducer, IDataReducer } from "./reducers/data-reducer";
import { GameActions, gameReducer, IGameReducer } from "./reducers/game-reducer";

export interface IClientStore {
	gameState: IGameReducer;
	playerData: IDataReducer;
}

export type StoreActions = GameActions | DataActions;

export const StoreReducer = combineReducers<IClientStore, StoreActions>({
	gameState: gameReducer,
	playerData: dataReducer,
});

export const ClientStore = new Store<IClientStore, StoreActions>(StoreReducer, {}, [thunkMiddleware] as never);
