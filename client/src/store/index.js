import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import tasksReducer from './slices/tasksSlice'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  tasks: tasksReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['tasks'] // Only persist tasks
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store) 