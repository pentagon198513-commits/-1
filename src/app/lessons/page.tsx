import Link from 'next/link';
import { Container, SectionTitle, Card } from '@/components/UI';
import { LESSONS, LEVELS, getLessonsByLevel } from '@/features/lessons/data';

export default function LessonsPage() {
  return (
    <Container>
      <SectionTitle
        title="Программа обучения"
        subtitle={`${LESSONS.length} уроков в ${LEVELS.length} уровнях. Проходите по порядку — программа ведёт от основ до скоростной печати.`}
      />

      <div className="space-y-8">
        {LEVELS.map((level) => {
          const lessons = getLessonsByLevel(level);
          return (
            <section key={level}>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Уровень {level}
                </span>
                <h2 className="text-xl font-semibold">{levelTitle(level)}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {lessons.map((l) => (
                  <Link key={l.id} href={`/train/${l.id}`} className="block">
                    <Card className="h-full transition hover:border-accent/50">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-fg-subtle">#{l.order}</div>
                        <div className="text-xs text-fg-muted">
                          цель: {l.minWPM} WPM · {l.minAccuracy}%
                        </div>
                      </div>
                      <div className="mt-2 text-base font-semibold">{l.title}</div>
                      <p className="mt-1 text-sm text-fg-muted">{l.description}</p>
                      {l.newChars && l.newChars.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {l.newChars.map((c) => (
                            <span
                              key={c}
                              className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-mono text-accent"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Container>
  );
}

function levelTitle(level: number): string {
  return (
    {
      1: 'Домашний ряд',
      2: 'Расширение букв',
      3: 'Верхний ряд',
      4: 'Нижний ряд',
      5: 'Слова',
      6: 'Предложения',
      7: 'Абзацы',
      8: 'Скоростная печать',
    }[level] ?? 'Уровень'
  );
}

// Предгенерация статических параметров не нужна — roзрутинг на клиенте
