import { createContext, useContext, useReducer, useEffect } from 'react';

const QueryContext = createContext();

const queryReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_QUERY':
      const updatedQueriesAdd = [...state.queries, action.payload];
      localStorage.setItem('queries', JSON.stringify(updatedQueriesAdd));
      return { ...state, queries: updatedQueriesAdd };
    case 'UPDATE_QUERY':
      const updatedQueriesUpdate = state.queries.map(q =>
        q.id === action.payload.id ? { ...q, ...action.payload.updatedData } : q
      );
      localStorage.setItem('queries', JSON.stringify(updatedQueriesUpdate));
      return { ...state, queries: updatedQueriesUpdate };
    case 'DELETE_QUERY':
      const updatedQueriesDelete = state.queries.filter(q => q.id !== action.payload.id);
      localStorage.setItem('queries', JSON.stringify(updatedQueriesDelete));
      return { ...state, queries: updatedQueriesDelete };
    case 'ADD_NOTIFICATION':
      const updatedNotifications = [...state.notifications, action.payload];
      return { ...state, notifications: updatedNotifications };
    default:
      return state;
  }
};

export const QueryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(queryReducer, {
    queries: JSON.parse(localStorage.getItem('queries') || '[]'),
    notifications: ['Query #1 updated to In Progress'],
  });

  return (
    <QueryContext.Provider value={{ state: { ...state, dispatch }, dispatch }}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQuery = () => useContext(QueryContext);