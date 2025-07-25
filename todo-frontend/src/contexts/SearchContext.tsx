import { createContext, useState, useContext } from 'react';
import type {ReactNode, Dispatch, SetStateAction } from 'react'

type Priority = "urgent" | "medium" | "low";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  priorityFilters: Priority[];
  setPriorityFilters: Dispatch<SetStateAction<Priority[]>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilters, setPriorityFilters] = useState<Priority[]>([]);

  const value = {
    searchTerm,
    setSearchTerm,
    priorityFilters,
    setPriorityFilters,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};