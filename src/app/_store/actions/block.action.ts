export const SET_CURRENT_BLOCK = '[Set] установливаем текущий блок активным';
export const SET_BLOCK_COLOR = '[Set] установливаем цвет текущего блока';

export class SetCurrentBlock {
	public readonly type: string = SET_CURRENT_BLOCK;
	public constructor(public currentBlockName: string) {}
}
export class SetBlockColor {
	public readonly type: string = SET_BLOCK_COLOR;
	public constructor( public color:string) {}
}
export type blockActions = SetCurrentBlock & SetBlockColor;
