import { IBlock } from '../types/block.type';
import { blockActions, SET_CURRENT_BLOCK } from '../actions/block.action';


export interface IBlockStore {
	blocks: IBlock[];
  activeBlock:IBlock;

}
export const initialState:IBlockStore = {
  blocks: [
    {
      id: -1,
      iWidth: 1,
      iHeight: 1,
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      id: 0,
      iWidth: 2,
      iHeight: 2,
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      id: 2,
      iWidth: 2,
      iHeight: 4,
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      id: 3,
      iWidth: 2,
      iHeight: 6,
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      id: 4,
      iWidth: 2,
      iHeight: 8,
      iCount: 100,
      isActive: false,
      sBrickColor: '#e53935'
    },
    {
      id: 5,
      iWidth: 2,
      iHeight: 10,
      iCount: 100,
      isActive: true,
      sBrickColor: '#e53935'
    }
  ],
  activeBlock:
    {
      id: 5,
      iWidth: 2,
      iHeight: 10,
      iCount: 100,
      isActive: true,
      sBrickColor: '#e53935'
    }

};

export function blockStoreReducer(state: IBlockStore = initialState, action: blockActions) {
  const newBlock = {
    ...action.currentBlock,
    isActive: true
  };

  switch ( action.type) {
  case SET_CURRENT_BLOCK:
    return {
      ...state,
      blocks: state.blocks.map(item => ( (item.id === action.currentBlock.id) ? newBlock : {
        ...item,
        isActive: false
      })),
      activeBlock: newBlock
    };

  default:
    return state;
  }
}
