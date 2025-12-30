// Chart theme colors that adapt to dark mode
// Uses CSS variables defined in index.css

export const getChartColors = () => {
    // Check if we're in dark mode
    const isDark = document.documentElement.classList.contains('dark');

    return {
        // Grid and axis colors
        grid: isDark ? 'hsl(217 33% 17%)' : 'hsl(214 32% 91%)',
        text: isDark ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)',

        // Data colors - vibrant but dark-mode friendly
        primary: isDark ? 'hsl(217 91% 60%)' : 'hsl(221 83% 53%)',
        secondary: isDark ? 'hsl(262 83% 58%)' : 'hsl(262 83% 58%)',
        success: isDark ? 'hsl(142 71% 45%)' : 'hsl(142 76% 36%)',
        warning: isDark ? 'hsl(48 96% 53%)' : 'hsl(45 93% 47%)',
        slate: isDark ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)',
    };
};

// Recharts-specific configuration
export const chartConfig = {
    margin: { top: 10, right: 10, left: 0, bottom: 0 },

    // Axis styling
    axisStyle: (colors: ReturnType<typeof getChartColors>) => ({
        tick: { fill: colors.text, fontSize: 12 },
        tickLine: { stroke: colors.grid },
        axisLine: { stroke: colors.grid },
    }),

    // Grid styling
    gridStyle: (colors: ReturnType<typeof getChartColors>) => ({
        stroke: colors.grid,
        strokeDasharray: '3 3',
    }),
};
