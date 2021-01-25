import { IBlock } from '../types/block.type';
import {
  blockActions, SET_BLOCK_COLOR, SET_CURRENT_BLOCK
} from '../actions/block.action';


export interface IBlockStore {
	blocks: IBlock[];
  activeBlock:IBlock;

}
export const initialState:IBlockStore = {
  blocks: [
    {
      iWidth: 2,
      iHeight: 2,
      sName: '2X2',
      iCount: 100,
      isActive: true,
      sBrickColor: '#e53935'
    },
    {
      iWidth: 2,
      iHeight: 4,
      sName: '2X4',
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      iWidth: 2,
      iHeight: 6,
      sName: '2X6',
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      iWidth: 2,
      iHeight: 8,
      sName: '2X8',
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      iWidth: 2,
      iHeight: 10,
      sName: '2X10',
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    }
  ],
  activeBlock: {
    iWidth: 2,
    iHeight: 2,
    sName: '2X2',
    iCount: 100,
    isActive: true,
    sBrickColor: '#e53935'
  }

};

export function blockStoreReducer(state: IBlockStore = initialState, action: blockActions) {
  switch ( action.type) {
  case SET_CURRENT_BLOCK:
    return {
      ...state,
      blocks: state.blocks.map(item => ({
        ...item,
        isActive: item.sName === action.currentBlockName
      }))
    };
  case SET_BLOCK_COLOR:
    return {
      ...state,
      blocks: state.blocks.map(item => ({
        ...item,
        sBrickColor: item.isActive ? action.color : item.sBrickColor
      }))
    };
  default:
    return state;
  }
}
