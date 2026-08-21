/**
 * Chat Demo page: a warm, Swiss-influenced messenger workspace.
 * The screen intentionally contains no personal contacts or fabricated conversation messages.
 */
import { useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  Clock3,
  LockKeyhole,
  Menu,
  MessageCircleMore,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Area = "chats" | "updates" | "groups";

const navigation = [
  { id: "chats" as Area, label: "Чаты", icon: MessageCircleMore },
  { id: "updates" as Area, label: "Обновления", icon: Clock3 },
  { id: "groups" as Area, label: "Сообщества", icon: UsersRound },
];

const emptyCopy: Record<Area, { title: string; detail: string; action: string }> = {
  chats: {
    title: "Личных чатов нет",
    detail: "В этой визуальной демо-версии контакты и переписки не загружаются.",
    action: "Локальная демонстрация",
  },
  updates: {
    title: "Обновлений нет",
    detail: "Статусы и каналы не подключены к этому безопасному макету.",
    action: "Без внешней синхронизации",
  },
  groups: {
    title: "Сообществ нет",
    detail: "Демонстрационный интерфейс не создаёт группы и не добавляет участников.",
    action: "Работа только в браузере",
  },
};

export default function Home() {
  const [area, setArea] = useState<Area>("chats");
  const [query, setQuery] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const copy = useMemo(() => emptyCopy[area], [area]);

  function signalLocalAction(label: string) {
    toast(`${label}: доступно только как визуальный элемент`, {
      description: "Демо не подключается к контактам, аккаунтам или перепискам.",
    });
  }

  return (
    <main className="min-h-screen bg-[#e6eee9] px-0 py-0 text-[#14352a] lg:flex lg:items-center lg:justify-center lg:p-7">
      <section className="relative min-h-screen w-full overflow-hidden bg-[#f7faf8] lg:min-h-0 lg:max-w-[1520px] lg:rounded-[26px] lg:shadow-[0_26px_80px_rgba(25,67,51,0.18)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#1fae7a]" />
        <div className="flex h-screen min-h-[620px] w-full">
          <aside className="hidden w-[76px] flex-col items-center border-r border-[#dce7e1] bg-[#fbfdfc] py-5 md:flex">
            <button className="group mb-7 grid h-11 w-11 place-items-center rounded-2xl bg-[#e4f6ef] transition-transform duration-150 active:scale-95" aria-label="Главная">
              <img src="/manus-storage/chat-demo-logo_a4acb765.png" alt="Chat Demo" className="h-8 w-8 object-contain" />
            </button>
            <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Разделы">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.id === area;
                return (
                  <button
                    key={item.id}
                    onClick={() => setArea(item.id)}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    className={`relative grid h-11 w-11 place-items-center rounded-xl transition-all duration-150 active:scale-95 ${active ? "bg-[#daf3e9] text-[#13865e]" : "text-[#70867d] hover:bg-[#edf4f0] hover:text-[#315b4b]"}`}
                  >
                    <Icon className="h-[21px] w-[21px] stroke-[1.7]" />
                    {active && <span className="absolute -left-[18px] h-5 w-[3px] rounded-r-full bg-[#1fae7a]" />}
                  </button>
                );
              })}
            </nav>
            <div className="flex flex-col gap-2">
              <button onClick={() => setPrivacyOpen(true)} aria-label="Приватность" className="grid h-11 w-11 place-items-center rounded-xl text-[#70867d] transition hover:bg-[#edf4f0] hover:text-[#315b4b] active:scale-95">
                <ShieldCheck className="h-[20px] w-[20px] stroke-[1.7]" />
              </button>
              <button onClick={() => signalLocalAction("Настройки")} aria-label="Настройки" className="grid h-11 w-11 place-items-center rounded-xl text-[#70867d] transition hover:bg-[#edf4f0] hover:text-[#315b4b] active:scale-95">
                <Settings2 className="h-[20px] w-[20px] stroke-[1.7]" />
              </button>
            </div>
          </aside>

          <section className={`${sideOpen ? "absolute inset-0 z-30 flex w-full md:relative md:z-auto md:w-[356px]" : "hidden md:flex"} w-full flex-col border-r border-[#dce7e1] bg-[#fbfdfc] md:w-[356px]`} aria-label="Список">
            <header className="flex items-center justify-between px-5 pb-4 pt-7">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1a9a6e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1fae7a]" /> только локальный режим
                </div>
                <h1 className="text-[26px] font-extrabold tracking-[-0.04em] text-[#173c2f]">{area === "chats" ? "Чаты" : area === "updates" ? "Обновления" : "Сообщества"}</h1>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => signalLocalAction("Новая запись")} className="grid h-9 w-9 place-items-center rounded-xl text-[#5d766b] transition hover:bg-[#eef5f1] hover:text-[#176445] active:scale-95" aria-label="Создать">
                  <Plus className="h-[19px] w-[19px]" />
                </button>
                <button onClick={() => signalLocalAction("Дополнительное меню")} className="grid h-9 w-9 place-items-center rounded-xl text-[#5d766b] transition hover:bg-[#eef5f1] hover:text-[#176445] active:scale-95" aria-label="Дополнительное меню">
                  <MoreHorizontal className="h-[20px] w-[20px]" />
                </button>
                <button onClick={() => setSideOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-[#5d766b] md:hidden" aria-label="Закрыть список">
                  <X className="h-[20px] w-[20px]" />
                </button>
              </div>
            </header>

            <div className="px-4 pb-4">
              <label className="flex h-11 items-center gap-3 rounded-xl bg-[#edf3f0] px-3 text-[#6b8178] transition focus-within:ring-2 focus-within:ring-[#94ddbf]" htmlFor="search">
                <Search className="h-[18px] w-[18px]" />
                <input id="search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#254b3d] outline-none placeholder:text-[#7d9188]" placeholder="Поиск по локальному макету" />
                {query && <button onClick={() => setQuery("")} className="text-[#648075]" aria-label="Очистить поиск"><X className="h-4 w-4" /></button>}
              </label>
            </div>

            <div className="border-y border-[#e3ece7] px-5 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#658078]">
                <Archive className="h-4 w-4" /> Архив пуст
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-9 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-[21px] bg-[#e8f5ef] text-[#1a9a6e]">
                <UsersRound className="h-6 w-6 stroke-[1.6]" />
              </div>
              <p className="text-sm font-bold text-[#284b3e]">{query ? "Совпадений не найдено" : copy.title}</p>
              <p className="mt-2 max-w-[226px] text-[12px] leading-5 text-[#7b9086]">{query ? "Поиск выполняется только по данным, которые вы добавите сами." : copy.detail}</p>
            </div>

            <footer className="m-4 mt-0 rounded-2xl border border-[#d9ebe2] bg-[#f3faf6] p-3.5">
              <div className="flex gap-2.5">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#1a966a]" />
                <div>
                  <p className="text-[11px] font-bold text-[#3a6152]">Не подключено к WhatsApp</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-[#789087]">Это отдельная визуальная демонстрация интерфейса.</p>
                </div>
              </div>
            </footer>
          </section>

          <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#e9f1ed]" aria-label="Рабочая область">
            <div className="absolute inset-0 bg-cover bg-center opacity-[0.84]" style={{ backgroundImage: "url('/manus-storage/chat-demo-wallpaper_84d6a701.jpg')" }} />
            <div className="absolute inset-0 bg-[#e7efe9]/70" />

            <header className="relative z-10 flex h-[76px] shrink-0 items-center justify-between border-b border-[#d8e4de]/90 bg-[#fbfdfc]/90 px-4 backdrop-blur-md sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setSideOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl text-[#547166] hover:bg-[#eef5f1] md:hidden" aria-label="Открыть список">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[15px] border border-[#d4ebe0] bg-[#e8f7ef]">
                  <img src="/manus-storage/chat-demo-logo_a4acb765.png" alt="" className="h-7 w-7 object-contain" />
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#1fae7a]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-extrabold tracking-[-0.02em] text-[#1b4031]">Chat Demo</h2>
                    <span className="hidden rounded-md bg-[#e4f6ed] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#13835d] sm:inline">локально</span>
                  </div>
                  <p className="truncate text-[11px] font-medium text-[#71877d]">Данные пользователя не загружаются</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPrivacyOpen(true)} className="hidden h-9 items-center gap-2 rounded-xl border border-[#d6e9df] bg-white/75 px-3 text-[11px] font-bold text-[#40705d] transition hover:border-[#a6d9c0] hover:bg-white sm:flex active:scale-[0.97]" aria-label="Открыть информацию о приватности">
                  <ShieldCheck className="h-4 w-4 text-[#1b9a6e]" /> Защита данных
                </button>
                <button onClick={() => signalLocalAction("Дополнительное меню")} className="grid h-9 w-9 place-items-center rounded-xl text-[#5d766b] transition hover:bg-[#edf5f0] active:scale-95" aria-label="Дополнительное меню">
                  <MoreHorizontal className="h-[20px] w-[20px]" />
                </button>
              </div>
            </header>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-8 text-center panel-enter">
              <div className="relative mb-2 w-[210px] sm:w-[260px]">
                <div className="absolute -inset-5 rounded-full bg-[#d3f3e4]/60 blur-2xl" />
                <img src="/manus-storage/chat-demo-empty-state_43f62d74.png" alt="Абстрактная иллюстрация закрытого локального чата" className="relative mx-auto w-full object-contain drop-shadow-[0_18px_24px_rgba(35,96,70,0.16)]" />
              </div>
              <div className="max-w-[430px] rounded-[22px] border border-white/80 bg-[#fbfdfc]/75 px-7 py-5 shadow-[0_12px_32px_rgba(51,94,76,0.08)] backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#198d64]"><Sparkles className="h-3.5 w-3.5" /> {copy.action}</div>
                <h3 className="text-[21px] font-extrabold tracking-[-0.035em] text-[#1b4333] sm:text-[25px]">{copy.title}</h3>
                <p className="mx-auto mt-2 max-w-[345px] text-[12px] leading-5 text-[#6c8479]">{copy.detail}</p>
                <button onClick={() => setPrivacyOpen(true)} className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold text-[#16855e] underline decoration-[#9bdaba] decoration-2 underline-offset-4 transition hover:text-[#0f6e4c]">
                  <LockKeyhole className="h-3.5 w-3.5" /> Как устроена защита в демо
                </button>
              </div>
            </div>

            <footer className="relative z-10 border-t border-[#d8e5df] bg-[#f5f9f7]/90 px-3 py-3 backdrop-blur-md sm:px-5">
              <div className="flex items-center gap-2 rounded-2xl border border-[#d9e7e0] bg-[#edf3f0]/90 px-3 py-1.5 opacity-90">
                <button disabled className="grid h-9 w-9 place-items-center rounded-xl text-[#9eaea7]" aria-label="Дополнительно"><Plus className="h-[19px] w-[19px]" /></button>
                <div className="flex h-9 min-w-0 flex-1 items-center rounded-xl px-2 text-[12px] font-medium text-[#92a29b]">Ввод сообщений отключён в визуальном режиме</div>
                <button disabled className="grid h-9 w-9 place-items-center rounded-xl text-[#9eaea7]" aria-label="Отправить"><ChevronDown className="h-[18px] w-[18px] rotate-[-90deg]" /></button>
              </div>
            </footer>
          </section>
        </div>

        {privacyOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#153d2e]/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="О приватности демо">
            <section className="relative w-full max-w-[620px] overflow-hidden rounded-[28px] border border-white/80 bg-[#fcfefc] shadow-[0_24px_80px_rgba(19,60,44,0.27)] panel-enter">
              <button onClick={() => setPrivacyOpen(false)} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl bg-white/85 text-[#547369] shadow-sm transition hover:bg-white active:scale-95" aria-label="Закрыть"><X className="h-5 w-5" /></button>
              <div className="relative h-[165px] overflow-hidden bg-[#e7f2ec]">
                <img src="/manus-storage/chat-demo-privacy-art_a5092664.jpg" alt="Абстрактное изображение защищённой беседы" className="h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#e5f5ed]/65 via-transparent to-transparent" />
              </div>
              <div className="px-6 pb-7 pt-5 sm:px-8">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#16865f]"><ShieldCheck className="h-4 w-4" /> визуальная демо-версия</div>
                <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-[#174332]">Личные данные остаются вне макета</h3>
                <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#638075]">Страница не запрашивает доступ к WhatsApp, телефонной книге или содержимому переписок. Кнопки показывают состояние интерфейса и не создают контакты, чаты или сообщения.</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {["Без аккаунта", "Без синхронизации", "Без отправки"].map((item) => <div key={item} className="rounded-xl bg-[#eff8f3] px-3 py-2 text-center text-[11px] font-bold text-[#36725a]">{item}</div>)}
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 right-5 hidden items-center gap-2 rounded-full border border-[#d5e8dd] bg-white/85 px-3 py-1.5 text-[10px] font-bold text-[#658278] shadow-sm backdrop-blur-md lg:flex"><PanelLeft className="h-3.5 w-3.5" /> Визуальный макет</div>
      </section>
    </main>
  );
}
