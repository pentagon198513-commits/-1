import Link from 'next/link';
import { Card, Container, LinkButton, SectionTitle } from '@/components/UI';

export default function HomePage() {
  return (
    <Container>
      <section className="mx-auto mb-12 max-w-3xl text-center">
        <span className="inline-block rounded-full border border-border bg-bg-elev px-3 py-1 text-xs text-fg-muted">
          Современный тренажёр для сотрудников
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Научитесь печатать вслепую на русском
        </h1>
        <p className="mt-4 text-lg text-fg-muted">
          От домашнего ряда до 300 знаков в минуту. Методичные уроки, живая
          статистика и виртуальная клавиатура с подсказкой пальцев.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/lessons">Начать обучение</LinkButton>
          <LinkButton href="/train/L1-1" variant="outline">
            Попробовать первый урок
          </LinkButton>
        </div>
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

function Feature({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <Card>
      <div className="text-xs font-semibold text-accent">{num}</div>
      <div className="mt-1 text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm text-fg-muted">{text}</p>
    </Card>
  );
}
