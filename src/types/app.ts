export type TabType = 'qa1' | 'qa2' | 'endOfTerm' | 'reportCard';

export interface TabItem {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}