
export const SET_BLOCK = '[3D] установливаем текущий блок';

export class SetCurrentBlock {
	public readonly type: string = SET_BLOCK;
	public constructor(public currentBlockName: string) {}
}
