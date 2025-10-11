// Custom type declarations for lucide-react icons
/// <reference types="react" />

declare module 'lucide-react' {
  import * as React from 'react';
  
  export interface LucideProps extends Partial<Omit<React.SVGProps<SVGSVGElement>, "ref">> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  
  // All icons used in the application
  export const Package2: LucideIcon;
  export const ShoppingCart: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const Users: LucideIcon;
  export const BarChart: LucideIcon;
  export const Facebook: LucideIcon;
  export const Instagram: LucideIcon;
  export const Twitter: LucideIcon;
  export const Settings: LucideIcon;
  export const Home: LucideIcon;
  export const Bolt: LucideIcon;
  export const Store: LucideIcon;
  export const Tags: LucideIcon;
  export const Hash: LucideIcon;
  export const Palette: LucideIcon;
  export const Image: LucideIcon;
  export const Calendar: LucideIcon;
  export const Activity: LucideIcon;
  export const Share2: LucideIcon;
  export const Satellite: LucideIcon;
  export const Server: LucideIcon;
  export const Monitor: LucideIcon;
  export const MapPin: LucideIcon;
  export const Cloud: LucideIcon;
  export const Star: LucideIcon;
  export const Bot: LucideIcon;
  export const CreditCard: LucideIcon;
  export const BookOpen: LucideIcon;
  export const FileQuestion: LucideIcon;
  export const Percent: LucideIcon;
  export const Gift: LucideIcon;
  export const Mail: LucideIcon;
  export const Truck: LucideIcon;
  export const Building2: LucideIcon;
  export const UserCheck: LucideIcon;
  export const Handshake: LucideIcon;
  export const Crown: LucideIcon;
  export const Shield: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Search: LucideIcon;
  export const X: LucideIcon;
  export const Pin: LucideIcon;
  export const PinOff: LucideIcon;
  export const FolderKanban: LucideIcon;
  export const Package: LucideIcon;
  export const Clock: LucideIcon;
  export const LayoutList: LucideIcon;
  export const LogOut: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Save: LucideIcon;
  export const Eye: LucideIcon;
  export const Plus: LucideIcon;
  export const Sparkles: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Target: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Webhook: LucideIcon;
  export const Copy: LucideIcon;
  export const Check: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Tag: LucideIcon;
  export const Filter: LucideIcon;
  export const Grid: LucideIcon;
  export const List: LucideIcon;
  export const Video: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ArrowDownRight: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Power: LucideIcon;
  export const PowerOff: LucideIcon;
  export const Tool: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const XCircle: LucideIcon;
  export const Timer: LucideIcon;
  export const RotateCw: LucideIcon;
  export const Play: LucideIcon;
  export const Code: LucideIcon;
  export const Database: LucideIcon;
  export const FileText: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
}
