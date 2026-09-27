// app/loading.tsx - Home Page Loading Skeleton
'use client';

import {
  AnimatedItem,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import { Card } from '@/app/components/ui/Card';

export default function ComumnLoading() {
  return (
    <AnimatedItem
      direction="scale"
      className="absolute inset-0 bg-veu backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
    >
      <Card
        densidade="larga"
        className="flex flex-col justify-center items-center gap-6 text-center"
      >
        <LoadingSpinner size="lg" />
        <p className="text-theme-primary font-medium mt-4">
          Carregando página...
        </p>
      </Card>
    </AnimatedItem>
  );
}
