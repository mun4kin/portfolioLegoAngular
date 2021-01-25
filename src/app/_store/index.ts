import { blockStoreReducer, IBlockStore } from './reducers/block.reducer';
import { ActionReducerMap } from '@ngrx/store';

/** Состояние стора*/
export interface IStore {
 blocks:IBlockStore
}

/** Текущие редьюсеры*/
export const mainReducer: ActionReducerMap<IStore> = { blocks: blockStoreReducer };
