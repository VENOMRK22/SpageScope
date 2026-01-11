import React, { createContext, useState, useEffect } from 'react';
import {
    fetchSkyEvents,
    fetchSolarData,
    fetchLaunches,
    type SkyEvent,
    type SolarData,
    type Launch
} from '../services/spaceData';
import type { ReactNode } from 'react';

interface DataContextType {
    events: SkyEvent[];
    weather: SolarData | null;
    launches: Launch[];
    loading: boolean;
}

const defaultContext: DataContextType = {
    events: [],
    weather: null,
    launches: [],
    loading: true,
};

export const DataContext = createContext<DataContextType>(defaultContext);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<SkyEvent[]>([]);
    const [weather, setWeather] = useState<SolarData | null>(null);
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch all data in parallel
                const [eventsData, weatherData, launchesData] = await Promise.all([
                    fetchSkyEvents(),
                    fetchSolarData(),
                    fetchLaunches()
                ]);

                setEvents(eventsData);
                setWeather(weatherData);
                setLaunches(launchesData);
            } catch (error) {
                console.error("Failed to load space data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <DataContext.Provider value={{ events, weather, launches, loading }}>
            {children}
        </DataContext.Provider>
    );
};
