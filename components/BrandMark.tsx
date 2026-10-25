import Svg, { Circle, Rect } from 'react-native-svg';

interface BrandMarkProps {
  size?: number;
}

// assets/brand/mark.svg 와 같은 도형
export const BrandMark = ({ size = 32 }: BrandMarkProps) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Rect width={64} height={64} rx={14} fill="#0B1B2B" />
    <Rect x={14.5} y={35.5} width={8.5} height={14} rx={2.75} fill="#24425C" />
    <Rect x={27.75} y={27} width={8.5} height={22.5} rx={2.75} fill="#2F5D80" />
    <Rect x={40.75} y={18.5} width={8.5} height={31} rx={2.75} fill="#12B76A" />
    <Circle cx={45} cy={12.25} r={3.6} fill="#F79009" />
  </Svg>
);
