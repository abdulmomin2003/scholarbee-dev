import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  unreadConversationsCount: number;
}

const initialState: ChatState = {
  unreadConversationsCount: 0
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUnreadConversationsCount: (state, action: PayloadAction<number>) => {
      state.unreadConversationsCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadConversationsCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadConversationsCount > 0) {
        state.unreadConversationsCount -= 1;
      }
    },
    resetUnreadCount: (state) => {
      state.unreadConversationsCount = 0;
    }
  }
});

export const {
  setUnreadConversationsCount,
  incrementUnreadCount,
  decrementUnreadCount,
  resetUnreadCount
} = chatSlice.actions;

export default chatSlice.reducer;
