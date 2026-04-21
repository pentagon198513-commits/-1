import { LESSONS } from '@/features/lessons/data';
import TrainClient from './TrainClient';

// Статическая генерация всех уроков для экспорта
export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

export default function TrainPage({ params }: { params: { id: string } }) {
  return <TrainClient lessonId={params.id} />;
}
