import type { Achievement, UserProfile, UserStats } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'Первый шаг',
    description: 'Завершите первый урок',
    icon: '🎯',
    check: (p) => p.completedLessons.length >= 1,
  },
  {
    id: 'streak-3',
    title: 'Три дня подряд',
    description: 'Занимайтесь три дня подряд',
    icon: '🔥',
    check: (p) => p.streakDays >= 3,
  },
  {
    id: 'streak-7',
    title: 'Неделя дисциплины',
    description: 'Занимайтесь семь дней подряд',
    icon: '⚡',
    check: (p) => p.streakDays >= 7,
  },
  {
    id: 'wpm-40',
    title: 'Уверенный пользователь',
    description: 'Достигните 40 WPM',
    icon: '⌨️',
    check: (_p, s) => s.bestWPM >= 40,
  },
  {
    id: 'wpm-60',
    title: 'Быстрые пальцы',
    description: 'Достигните 60 WPM',
    icon: '🚀',
    check: (_p, s) => s.bestWPM >= 60,
  },
  {
    id: 'wpm-80',
    title: 'Мастер клавиатуры',
    description: 'Достигните 80 WPM',
    icon: '🏆',
    check: (_p, s) => s.bestWPM >= 80,
  },
  {
    id: 'accuracy-99',
    title: 'Снайпер',
    description: 'Точность 99% и выше',
    icon: '🎯',
    check: (_p, s) => s.bestAccuracy >= 99,
  },
  {
    id: 'level-3',
    title: 'Новичок',
    description: 'Достигните 3 уровня',
    icon: '✨',
    check: (p) => p.level >= 3,
  },
  {
    id: 'level-10',
    title: 'Профессионал',
    description: 'Достигните 10 уровня',
    icon: '💎',
    check: (p) => p.level >= 10,
  },
];

export function getUnlockedAchievements(p: UserProfile, s: UserStats): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.check(p, s));
}
