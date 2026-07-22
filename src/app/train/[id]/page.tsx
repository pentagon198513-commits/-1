import { LESSONS } from '@/features/lessons/data';
import TrainClient from './TrainClient';

// Статическая генерация всех уроков для экспорта
export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

export default async function TrainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrainClient lessonId={id} />;
}
