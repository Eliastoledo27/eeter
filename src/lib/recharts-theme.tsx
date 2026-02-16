/**
 * ÉTER STORE - Recharts Custom Theme & Styling
 * Consistent chart styling aligned with design system
 */

/* ============================================
   COLOR SCHEMES
   ============================================ */

export const chartColors = {
    primary: '#C88A04',
    primaryLight: '#ECA413',
    primaryDark: '#A67203',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Multi-series colors
    series: [
        '#C88A04', // Gold
        '#ECA413', // Light Gold
        '#10B981', // Green
        '#3B82F6', // Blue
        '#F59E0B', // Orange
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#14B8A6', // Teal
    ],

    // Gradient colors
    gradientStart: 'rgba(200, 138, 4, 0.8)',
    gradientEnd: 'rgba(200, 138, 4, 0)',

    // Grid & Axis
    grid: 'rgba(255, 255, 255, 0.05)',
    axis: '#A0A0A0',
    axisLine: 'rgba(255, 255, 255, 0.1)',

    // Background
    chartBg: 'transparent',
    tooltipBg: 'rgba(26, 26, 26, 0.95)',
    tooltipBorder: 'rgba(200, 138, 4, 0.3)',
};

/* ============================================
   TYPOGRAPHY STYLES
   ============================================ */

export const chartTypography = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
        small: 12,
        normal: 14,
        large: 16,
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700,
    },
};

/* ============================================
   DEFAULT CHART PROPS
   ============================================ */

export const defaultChartMargin = {
    top: 20,
    right: 30,
    left: 0,
    bottom: 20,
};

export const defaultCartesianGridProps = {
    strokeDasharray: '3 3',
    stroke: chartColors.grid,
    strokeOpacity: 0.5,
    vertical: false,
};

export const defaultXAxisProps = {
    stroke: chartColors.axis,
    tick: {
        fill: chartColors.axis,
        fontSize: chartTypography.fontSize.small,
        fontFamily: chartTypography.fontFamily,
    },
    axisLine: {
        stroke: chartColors.axisLine,
    },
    tickLine: false,
    dy: 10,
};

export const defaultYAxisProps = {
    stroke: chartColors.axis,
    tick: {
        fill: chartColors.axis,
        fontSize: chartTypography.fontSize.small,
        fontFamily: chartTypography.fontFamily,
    },
    axisLine: false,
    tickLine: false,
    dx: -10,
};

export const defaultTooltipProps = {
    contentStyle: {
        backgroundColor: chartColors.tooltipBg,
        border: `1px solid ${chartColors.tooltipBorder}`,
        borderRadius: '12px',
        padding: '12px 16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
    },
    labelStyle: {
        color: '#F5F5F5',
        fontFamily: chartTypography.fontFamily,
        fontSize: chartTypography.fontSize.small,
        fontWeight: chartTypography.fontWeight.medium,
        marginBottom: '8px',
    },
    itemStyle: {
        color: '#FFFFFF',
        fontFamily: chartTypography.fontFamily,
        fontSize: chartTypography.fontSize.normal,
        fontWeight: chartTypography.fontWeight.bold,
        padding: '4px 0',
    },
    cursor: {
        stroke: chartColors.primary,
        strokeWidth: 2,
        strokeDasharray: '5 5',
    },
};

export const defaultLegendProps = {
    wrapperStyle: {
        paddingTop: '20px',
        fontFamily: chartTypography.fontFamily,
        fontSize: chartTypography.fontSize.small,
        color: chartColors.axis,
    },
    iconType: 'circle' as const,
    iconSize: 10,
};

/* ============================================
   CUSTOM TOOLTIP COMPONENTS
   ============================================ */

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        dataKey: string;
    }>;
    label?: string;
    formatter?: (value: number) => string;
    labelFormatter?: (label: string) => string;
}

export const CustomTooltip: React.FC<TooltipProps> = ({
    active,
    payload,
    label,
    formatter = (value) => value.toLocaleString(),
    labelFormatter = (label) => label,
}) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                backgroundColor: chartColors.tooltipBg,
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: '12px',
                padding: '12px 16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
            }}
        >
            {label && (
                <p
                    style={{
                        color: '#F5F5F5',
                        fontFamily: chartTypography.fontFamily,
                        fontSize: chartTypography.fontSize.small,
                        fontWeight: chartTypography.fontWeight.medium,
                        marginBottom: '8px',
                    }}
                >
                    {labelFormatter(label)}
                </p>
            )}
            {payload.map((entry, index) => (
                <div
                    key={`tooltip-${index}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 0',
                    }}
                >
                    <div
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: entry.color,
                        }}
                    />
                    <span
                        style={{
                            color: chartColors.axis,
                            fontFamily: chartTypography.fontFamily,
                            fontSize: chartTypography.fontSize.small,
                            marginRight: '8px',
                        }}
                    >
                        {entry.name}:
                    </span>
                    <span
                        style={{
                            color: '#FFFFFF',
                            fontFamily: chartTypography.fontFamily,
                            fontSize: chartTypography.fontSize.normal,
                            fontWeight: chartTypography.fontWeight.bold,
                        }}
                    >
                        {formatter(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ============================================
   CUSTOM AXIS TICK COMPONENTS
   ============================================ */

interface CustomAxisTickProps {
    x?: number;
    y?: number;
    payload?: {
        value: string | number;
    };
    formatter?: (value: string | number) => string;
}

export const CustomXAxisTick: React.FC<CustomAxisTickProps> = ({
    x = 0,
    y = 0,
    payload,
    formatter,
}) => {
    if (!payload) return null;

    const value = formatter ? formatter(payload.value) : payload.value;

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={16}
                textAnchor="middle"
                fill={chartColors.axis}
                fontSize={chartTypography.fontSize.small}
                fontFamily={chartTypography.fontFamily}
            >
                {value}
            </text>
        </g>
    );
};

export const CustomYAxisTick: React.FC<CustomAxisTickProps> = ({
    x = 0,
    y = 0,
    payload,
    formatter,
}) => {
    if (!payload) return null;

    const value = formatter ? formatter(payload.value) : payload.value;

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dx={-10}
                dy={4}
                textAnchor="end"
                fill={chartColors.axis}
                fontSize={chartTypography.fontSize.small}
                fontFamily={chartTypography.fontFamily}
            >
                {value}
            </text>
        </g>
    );
};

/* ============================================
   GRADIENT DEFINITIONS
   ============================================ */

export const ChartGradients: React.FC = () => (
    <defs>
        {/* Primary Gradient */}
        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
        </linearGradient>

        {/* Success Gradient */}
        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8} />
            <stop offset="95%" stopColor={chartColors.success} stopOpacity={0} />
        </linearGradient>

        {/* Warning Gradient */}
        <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.warning} stopOpacity={0.8} />
            <stop offset="95%" stopColor={chartColors.warning} stopOpacity={0} />
        </linearGradient>

        {/* Error Gradient */}
        <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.error} stopOpacity={0.8} />
            <stop offset="95%" stopColor={chartColors.error} stopOpacity={0} />
        </linearGradient>

        {/* Info Gradient */}
        <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.info} stopOpacity={0.8} />
            <stop offset="95%" stopColor={chartColors.info} stopOpacity={0} />
        </linearGradient>

        {/* Multi-color gradient for special effects */}
        <linearGradient id="colorMulti" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={chartColors.primary} />
            <stop offset="50%" stopColor={chartColors.primaryLight} />
            <stop offset="100%" stopColor={chartColors.success} />
        </linearGradient>
    </defs>
);

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Format currency values
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};

/**
 * Format date for axis labels
 */
export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(d);
};

/**
 * Format month for axis labels
 */
export const formatMonth = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
    }).format(d);
};

/**
 * Get color from series palette by index
 */
export const getSeriesColor = (index: number): string => {
    return chartColors.series[index % chartColors.series.length];
};

/* ============================================
   CHART COMPONENT EXAMPLES
   ============================================ */

/*
// Line Chart Example
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  chartColors,
  defaultChartMargin,
  defaultCartesianGridProps,
  defaultXAxisProps,
  defaultYAxisProps,
  CustomTooltip,
  ChartGradients,
  formatCurrency
} from '@/lib/recharts-theme';

function SalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={defaultChartMargin}>
        <ChartGradients />
        <CartesianGrid {...defaultCartesianGridProps} />
        <XAxis 
          dataKey="date" 
          {...defaultXAxisProps}
        />
        <YAxis 
          {...defaultYAxisProps}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          content={<CustomTooltip formatter={formatCurrency} />}
        />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke={chartColors.primary}
          strokeWidth={3}
          dot={{ fill: chartColors.primaryLight, r: 6 }}
          activeDot={{ r: 8, stroke: chartColors.primary, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Area Chart Example
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={defaultChartMargin}>
        <ChartGradients />
        <CartesianGrid {...defaultCartesianGridProps} />
        <XAxis dataKey="month" {...defaultXAxisProps} />
        <YAxis {...defaultYAxisProps} tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={chartColors.primary}
          strokeWidth={2}
          fill="url(#colorPrimary)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Bar Chart Example
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

function ProductSalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={defaultChartMargin}>
        <CartesianGrid {...defaultCartesianGridProps} />
        <XAxis dataKey="product" {...defaultXAxisProps} />
        <YAxis {...defaultYAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="sales" 
          fill={chartColors.primary}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Pie Chart Example
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

function CategoryDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill={chartColors.primary}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getSeriesColor(index)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend {...defaultLegendProps} />
      </PieChart>
    </ResponsiveContainer>
  );
}
*/
