import {
  fetchAllSightings,
  subscribeToNewSightings,
} from "@/services/sightings.service";
import { Sighting } from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type SightingsContextType = {
  sightings: Sighting[];
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const SightingsContext = createContext<SightingsContextType | null>(null);

export function SightingsProvider({ children }: { children: ReactNode }) {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadSightings() {
    try {
      const data = await fetchAllSightings();
      setSightings(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSightings();

    const unsubscribe = subscribeToNewSightings((newSighting) => {
      setSightings((prev) => [newSighting, ...prev]);
    });

    return unsubscribe;
  }, []);

  return (
    <SightingsContext.Provider
      value={{
        sightings,
        isLoading,
        refetch: loadSightings,
      }}
    >
      {children}
    </SightingsContext.Provider>
  );
}

export function useSightings() {
  const context = useContext(SightingsContext);

  if (!context) {
    throw new Error("useSightings must be used inside SightingsProvider");
  }

  return context;
}
