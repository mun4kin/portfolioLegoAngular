export interface IBlock{
	id?:number
	iWidth: number,
	iHeight: number,

	iCount?: number,
	isActive?: boolean,
	sBrickColor: string,
	x?:number;
	y?:number;
	z?:number;
	light?:boolean;
}
