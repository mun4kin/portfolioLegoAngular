import { IBlock } from '../types/block.type';

export const SET_CURRENT_BLOCK = '[Set] установливаем текущий блок активным';


export class SetCurrentBlock {
	public readonly type: string = SET_CURRENT_BLOCK;
	public constructor(public currentBlock: IBlock) {}
}

export type blockActions = SetCurrentBlock;
