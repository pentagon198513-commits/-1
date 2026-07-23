import Link from 'next/link';
import { Card, Container, LinkButton, SectionTitle } from '@/components/UI';
import { ContinueButton } from '@/components/ContinueButton';

export default function HomePage() {
  return (
    <Container>
      <section className="mb-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="neon-panel console-grid overflow-hidden rounded-lg border border-accent/25 p-5 shadow-soft sm:p-7">
          <span className="inline-block rounded-full border border-accent/40 bg-bg-elev/70 px-3 py-1 text-xs font-semibold text-accent shadow-[0_0_24px_rgb(var(--accent)/0.18)]">
            Игровой тренажёр русской раскладки
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Прокачайте печать как навык в игре
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            Яркие уроки, живые подсказки пальцев, цели по точности и скорости.
            Всё работает как тренировка: короткий заход, понятный результат, следующий уровень.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <LinkButton href="/lessons">Открыть программу</LinkButton>
            <LinkButton href="/train/L1-1" variant="outline">
              Начать первый урок
            </LinkButton>
          </div>
        </div>

        <div className="grid gap-3">
          <Card className="bg-gradient-to-br from-accent via-[rgb(var(--neon-cyan))] to-[rgb(var(--neon-pink))] text-accent-fg">
            <div className="text-xs uppercase tracking-wide opacity-80">План на сегодня</div>
            <div className="mt-2 text-2xl font-semibold">10 минут практики</div>
            <p className="mt-2 text-sm opacity-85">
              Разминка, один урок и короткое повторение слабых букв.
            </p>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Цель" value="92%" />
            <MiniStat label="Темп" value="20+" />
            <MiniStat label="Серия" value="0 дн." />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <ContinueButton />
      </section>

      <SectionTitle title="Как это работает" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Feature
          num="1"
          title="Пошаговые уроки"
          text="8 уровней — от домашнего ряда до скоростной печати. Каждый новый урок вводит минимум новых букв."
        />
        <Feature
          num="2"
          title="Адаптивное обучение"
          text="Система замечает проблемные буквы и создаёт упражнения именно на них."
        />
        <Feature
          num="3"
          title="Мотивация и прогресс"
          text="Ачивки, уровни, серии ежедневных занятий и лидерборд сотрудников."
        />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Уровни обучения</h3>
          <ol className="mt-3 space-y-1 text-sm text-fg-muted">
            <li>1. Домашний ряд: ф ы в а — о л д ж</li>
            <li>2. Добавление букв: г ш п р</li>
            <li>3. Верхний ряд: й ц у к е н</li>
            <li>4. Нижний ряд: я ч с м и т ь</li>
            <li>5. Слова</li>
            <li>6. Предложения</li>
            <li>7. Абзацы</li>
            <li>8. Скоростная печать</li>
          </ol>
          <Link href="/lessons" className="mt-4 inline-block text-sm text-accent">
            Открыть уроки →
          </Link>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Что вы получите</h3>
          <ul className="mt-3 space-y-1 text-sm text-fg-muted">
            <li>· Скорость 250–350 знаков в минуту</li>
            <li>· Правильная посадка пальцев</li>
            <li>· Автоматическая коррекция слабых мест</li>
            <li>· Личная статистика и графики прогресса</li>
            <li>· Соревнование внутри команды</li>
          </ul>
        </Card>
      </div>
    </Container>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="neon-card rounded-lg border border-border bg-bg-elev p-4 shadow-soft">
      <div className="text-xs uppercase tracking-wide text-fg-subtle">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Feature({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <Card>
      <div className="text-xs font-semibold text-accent">{num}</div>
      <div className="mt-1 text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm text-fg-muted">{text}</p>
    </Card>
  );
}
