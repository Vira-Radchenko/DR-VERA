/* =========================================================
   DR. VERA — інтерактив сайту (демо-макет)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = id => `<svg class="i"><use href="#i-${id}"></use></svg>`;

  /* ---------- Sticky header ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-sticky', window.scrollY > 140);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger'), nav = $('.nav');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    nav.classList.toggle('open');
    document.body.classList.toggle('no-scroll', nav.classList.contains('open'));
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open'); nav.classList.remove('open'); document.body.classList.remove('no-scroll');
  }));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Toast ---------- */
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(text) {
    toast.innerHTML = ICON('check') + `<span>${text}</span>`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ---------- Accordion ---------- */
  $$('.faq__q').forEach(q => q.addEventListener('click', () => {
    const item = q.parentElement, answer = item.querySelector('.faq__a');
    const isOpen = item.classList.toggle('open');
    answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : 0;
  }));
  $$('.faq__item.open .faq__a').forEach(a => a.style.maxHeight = a.scrollHeight + 'px');

  /* ---------- Modals ---------- */
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('open');
    document.body.classList.add('no-scroll');
  }
  function closeModals() {
    $$('.modal.open').forEach(m => m.classList.remove('open'));
    document.body.classList.remove('no-scroll');
  }
  document.addEventListener('click', e => {
    if (e.target.closest('.modal__close, .modal__overlay')) closeModals();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModals(); chat.classList.remove('open'); } });

  /* ---------- Calendar ---------- */
  const MONTHS = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
  const MONTHS_GEN = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
  const TIMES = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  function createBooking(root, onChange) {
    const cal = $('.calendar', root), slotsBox = $('.slots', root);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    const state = { date: null, time: null };

    function firstAvailable() {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      while (d.getDay() === 0) d.setDate(d.getDate() + 1);
      return d;
    }
    state.date = firstAvailable();

    function renderCal() {
      const y = view.getFullYear(), m = view.getMonth();
      const startDow = (new Date(y, m, 1).getDay() + 6) % 7;
      const days = new Date(y, m + 1, 0).getDate();
      let html = `<div class="calendar__head">
        <button type="button" data-cal="-1" aria-label="Попередній місяць">‹</button>
        <span>${MONTHS[m]} ${y}</span>
        <button type="button" data-cal="1" aria-label="Наступний місяць">›</button></div>
        <div class="calendar__grid">${['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => `<span class="dow">${d}</span>`).join('')}`;
      for (let i = 0; i < startDow; i++) html += '<span></span>';
      for (let d = 1; d <= days; d++) {
        const date = new Date(y, m, d);
        const disabled = date <= today || date.getDay() === 0;
        const cls = [state.date && +date === +state.date ? 'selected' : '', +date === +today ? 'today' : ''].join(' ');
        html += `<button type="button" class="${cls}" data-day="${d}" ${disabled ? 'disabled' : ''}>${d}</button>`;
      }
      cal.innerHTML = html + '</div>';
    }
    function renderSlots() {
      const seed = state.date ? state.date.getDate() + state.date.getMonth() : 0;
      const isSat = state.date && state.date.getDay() === 6;
      slotsBox.innerHTML = TIMES.map((t, i) => {
        const busy = (seed * 7 + i * 3) % 5 === 0 || (isSat && i > 3);
        return `<button type="button" class="slot ${state.time === t ? 'selected' : ''}" data-time="${t}" ${busy ? 'disabled' : ''}>${t}</button>`;
      }).join('');
    }
    cal.addEventListener('click', e => {
      const nav = e.target.closest('[data-cal]'), day = e.target.closest('[data-day]');
      if (nav) {
        const next = new Date(view.getFullYear(), view.getMonth() + +nav.dataset.cal, 1);
        if (next >= new Date(today.getFullYear(), today.getMonth(), 1)) view = next;
        renderCal();
      }
      if (day && !day.disabled) {
        state.date = new Date(view.getFullYear(), view.getMonth(), +day.dataset.day);
        state.time = null;
        renderCal(); renderSlots(); onChange?.(state);
      }
    });
    slotsBox.addEventListener('click', e => {
      const s = e.target.closest('[data-time]');
      if (!s || s.disabled) return;
      state.time = s.dataset.time;
      renderSlots(); onChange?.(state);
    });
    renderCal(); renderSlots(); onChange?.(state);
    return state;
  }
  const fmtDate = d => d ? `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}` : '';

  /* ---------- Booking modal (у кожній сторінці) ---------- */
  const bookingModal = document.createElement('div');
  bookingModal.className = 'modal';
  bookingModal.id = 'booking';
  bookingModal.innerHTML = `
    <div class="modal__overlay"></div>
    <div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="bk-title">
      <button class="modal__close" aria-label="Закрити">×</button>
      <div class="bk-step">
        <span class="eyebrow">Онлайн-запис</span>
        <h3 id="bk-title">Записатися на прийом</h3>
        <p class="modal__lead">Оберіть зручну дату та час — адміністратор підтвердить запис.</p>
        <div class="modal__grid">
          <div class="calendar"></div>
          <div>
            <p class="slots__title">Доступний час</p>
            <div class="slots"></div>
            <form class="form bk-form" novalidate>
              <select class="input select" name="service">
                <option>Первинна консультація</option><option>Повторна консультація</option><option>Підбір домашнього догляду</option>
                <option>Комбінована чистка обличчя</option><option>Зволожувальний догляд</option><option>Хімічний пілінг</option>
                <option>Апаратні процедури</option><option>Біоревіталізація</option><option>Ботулінотерапія</option><option>Контурна пластика</option>
              </select>
              <input class="input" name="name" placeholder="Ваше ім’я" required>
              <input class="input" name="phone" type="tel" placeholder="Телефон" required>
              <label class="check"><input type="checkbox" required> Погоджуюсь з політикою конфіденційності</label>
              <p class="booking-summary bk-summary"></p>
              <button class="btn btn--dark btn--block" type="submit">Підтвердити запис ${ICON('arrow')}</button>
            </form>
          </div>
        </div>
      </div>
      <div class="success" hidden>
        <div class="success__icon">${ICON('check')}</div>
        <h3>Заявку надіслано!</h3>
        <p class="modal__lead bk-done"></p>
        <button class="btn btn--dark modal__close-btn" type="button">Добре</button>
      </div>
    </div>`;
  document.body.appendChild(bookingModal);
  const bkSummary = $('.bk-summary', bookingModal);
  const bkState = createBooking(bookingModal, st => {
    bkSummary.textContent = st.time ? `Обрано: ${fmtDate(st.date)}, ${st.time}` : `Дата: ${fmtDate(st.date)} — оберіть час`;
  });
  const bkForm = $('.bk-form', bookingModal);
  bkForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate(bkForm)) return;
    if (!bkState.time) { bkSummary.textContent = 'Будь ласка, оберіть час прийому'; bkSummary.style.color = '#c0566e'; return; }
    bkSummary.style.color = '';
    $('.bk-done', bookingModal).textContent =
      `${bkForm.name.value}, ви записані на «${bkForm.service.value}» — ${fmtDate(bkState.date)} о ${bkState.time}. Це демо-версія сайту, заявка нікуди не надсилається.`;
    $('.bk-step', bookingModal).hidden = true;
    $('.success', bookingModal).hidden = false;
  });
  $('.modal__close-btn', bookingModal).addEventListener('click', closeModals);

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-book]');
    if (!btn) return;
    e.preventDefault();
    $('.bk-step', bookingModal).hidden = false;
    $('.success', bookingModal).hidden = true;
    bkForm.reset();
    const service = btn.dataset.book;
    if (service) [...bkForm.service.options].forEach(o => { if (o.text === service) o.selected = true; });
    openModal('booking');
  });

  /* ---------- Info modal (Детальніше) ---------- */
  const infoModal = document.createElement('div');
  infoModal.className = 'modal';
  infoModal.id = 'info';
  infoModal.innerHTML = `<div class="modal__overlay"></div>
    <div class="modal__box modal__box--sm" role="dialog" aria-modal="true">
      <button class="modal__close" aria-label="Закрити">×</button>
      <img class="modal__img" alt="">
      <span class="eyebrow info-cat"></span>
      <h3 class="info-title"></h3>
      <p class="modal__text info-text"></p>
      <button class="btn btn--dark info-book" data-book>Записатися ${ICON('arrow')}</button>
    </div>`;
  document.body.appendChild(infoModal);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-info]');
    if (!el) return;
    e.preventDefault();
    const card = el.closest('[data-card]') || el;
    const img = card.querySelector('img');
    const title = el.dataset.title || card.querySelector('.card__title, h4, h3')?.textContent || '';
    $('.modal__img', infoModal).src = el.dataset.img || img?.src || '';
    $('.modal__img', infoModal).hidden = !(el.dataset.img || img);
    $('.info-cat', infoModal).textContent = el.dataset.label || card.querySelector('.card__cat')?.textContent || 'Детальніше';
    $('.info-title', infoModal).textContent = title;
    $('.info-text', infoModal).textContent = el.dataset.info ||
      'Детальний опис послуги буде додано. На консультації лікар оцінить стан шкіри, пояснить можливі варіанти та узгодить з вами план і вартість.';
    $('.info-book', infoModal).dataset.book = el.dataset.service || title;
    openModal('info');
  });
  $('.info-book', infoModal).addEventListener('click', () => infoModal.classList.remove('open'));

  /* ---------- Inline booking (головна) ---------- */
  const inline = $('[data-inline-booking]');
  if (inline) {
    const summary = $('.booking-summary', inline);
    const st = createBooking(inline, s => {
      summary.textContent = s.time ? `Обрано: ${fmtDate(s.date)}, ${s.time}` : `Дата: ${fmtDate(s.date)} — оберіть час`;
    });
    $('[data-inline-submit]', inline).addEventListener('click', () => {
      if (!st.time) { summary.textContent = 'Спочатку оберіть вільний час'; return; }
      $('.bk-step', bookingModal).hidden = false;
      $('.success', bookingModal).hidden = true;
      bkForm.reset();
      openModal('booking');
      // переносимо вибір у модальне вікно
      bkState.date = st.date; bkState.time = st.time;
      $$('.calendar__grid button', bookingModal).forEach(b => b.classList.toggle('selected', +b.dataset.day === st.date.getDate()));
      $$('.slot', bookingModal).forEach(b => b.classList.toggle('selected', b.dataset.time === st.time));
      bkSummary.textContent = `Обрано: ${fmtDate(st.date)}, ${st.time}`;
    });
  }

  /* ---------- Forms ---------- */
  function validate(form) {
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
      (f.type === 'checkbox' ? f.closest('.check') : f).classList.toggle('error', bad);
      if (bad) ok = false;
    });
    return ok;
  }
  $$('[data-form]').forEach(form => {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(form)) { showToast('Будь ласка, заповніть обов’язкові поля'); return; }
      form.reset();
      showToast(form.dataset.form || 'Дякуємо! Ми зв’яжемося з вами найближчим часом');
    });
    form.addEventListener('input', e => e.target.classList.remove('error'));
    form.addEventListener('change', e => e.target.closest('.check')?.classList.remove('error'));
  });

  /* ---------- Contact method switch ---------- */
  const method = $('[data-method]');
  if (method) {
    const target = $('[data-method-target]');
    const ph = { 'Телефон': 'Номер телефону', 'Email': 'Ваш email', 'Telegram': 'Нікнейм у Telegram', 'Viber': 'Номер у Viber' };
    method.addEventListener('change', () => target.placeholder = ph[method.value]);
  }

  /* ---------- Filters + search ---------- */
  const scope = $('[data-filter-scope]');
  if (scope) {
    const items = [...scope.children].filter(el => el.dataset.cat);
    const searchInput = $('[data-search]');
    const empty = $('.empty-msg');
    const moreBtn = $('[data-more]');
    let cat = 'all', concern = '', query = '';

    const params = new URLSearchParams(location.search);
    if (params.get('cat')) cat = params.get('cat');
    if (params.get('concern')) concern = params.get('concern');
    if (params.get('q')) { query = params.get('q').toLowerCase(); if (searchInput) searchInput.value = params.get('q'); }

    function apply() {
      const filtering = cat !== 'all' || concern || query;
      let visible = 0;
      $$('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
      $$('[data-concern]').forEach(b => b.classList.toggle('active', b.dataset.concern === concern));
      items.forEach(item => {
        const text = (item.textContent + ' ' + (item.dataset.tags || '')).toLowerCase();
        let show = (cat === 'all' || item.dataset.cat.split(' ').includes(cat)) &&
                   (!concern || (item.dataset.tags || '').includes(concern));
        // рядки таблиці прайсу
        const rows = $$('tbody tr', item);
        if (rows.length) {
          let rowsVisible = 0;
          const groupMatch = query && item.querySelector('h3').textContent.toLowerCase().includes(query);
          rows.forEach(r => {
            const ok = !query || groupMatch || r.textContent.toLowerCase().includes(query);
            r.hidden = !ok; if (ok) rowsVisible++;
          });
          if (!rowsVisible) show = false;
        } else if (query && !text.includes(query)) show = false;
        // «Показати ще» — приховані картки, коли немає фільтра
        const collapsed = item.classList.contains('more-item') && !filtering && !scope.classList.contains('expanded');
        item.classList.toggle('is-hidden', !show || collapsed);
        if (show) visible++;
      });
      if (empty) empty.classList.toggle('show', visible === 0);
      if (moreBtn) moreBtn.hidden = filtering || scope.classList.contains('expanded');
    }
    $$('[data-filter]').forEach(b => b.addEventListener('click', () => { cat = b.dataset.filter; apply(); }));
    $$('[data-concern]').forEach(b => b.addEventListener('click', () => { concern = concern === b.dataset.concern ? '' : b.dataset.concern; apply(); }));
    searchInput?.addEventListener('input', () => { query = searchInput.value.trim().toLowerCase(); apply(); });
    searchInput?.closest('form')?.addEventListener('submit', e => { e.preventDefault(); apply(); scope.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    moreBtn?.addEventListener('click', () => { scope.classList.add('expanded'); apply(); });
    $$('[data-reset]').forEach(b => b.addEventListener('click', () => {
      cat = 'all'; concern = ''; query = ''; if (searchInput) searchInput.value = ''; apply();
    }));
    apply();
  }

  /* ---------- Before / After ---------- */
  $$('.ba').forEach(ba => {
    const range = $('.ba__range', ba), before = $('.ba__before', ba);
    const line = $('.ba__line', ba), handle = $('.ba__handle', ba);
    const set = v => {
      before.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
      line.style.left = handle.style.left = v + '%';
    };
    range.addEventListener('input', () => set(range.value));
    set(range.value);
  });

  /* ---------- Reviews slider ---------- */
  $$('[data-slider]').forEach(sl => {
    const slides = $('.slider__slides', sl), count = slides.children.length;
    const dots = $('.slider__dots', sl);
    let i = 0, timer;
    dots.innerHTML = Array.from({ length: count }, (_, k) => `<button aria-label="Слайд ${k + 1}"></button>`).join('');
    const go = n => {
      i = (n + count) % count;
      slides.style.transform = `translateX(-${i * 100}%)`;
      $$('button', dots).forEach((d, k) => d.classList.toggle('active', k === i));
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); };
    $('[data-prev]', sl).addEventListener('click', () => { go(i - 1); auto(); });
    $('[data-next]', sl).addEventListener('click', () => { go(i + 1); auto(); });
    $$('button', dots).forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
    go(0); auto();
  });

  /* ---------- Chat widget ---------- */
  const chatBtn = document.createElement('button');
  chatBtn.className = 'chat-btn';
  chatBtn.innerHTML = `<svg class="i"><use href="#i-chat-fill"></use></svg><span>Чат підтримки</span>`;
  const chat = document.createElement('div');
  chat.className = 'chat';
  chat.innerHTML = `
    <div class="chat__head"><div><b>Підтримка DR. VERA</b><small>Зазвичай відповідаємо за кілька хвилин</small></div>
      <button class="chat__close" aria-label="Закрити чат">×</button></div>
    <div class="chat__body"><div class="msg msg--bot">Вітаю! 🌸 Я допоможу із записом, цінами та вибором послуги. Що вас цікавить?</div></div>
    <div class="chat__quick">
      <button>Допомога із записом</button><button>Уточнення послуги</button><button>Скільки коштує консультація?</button>
    </div>
    <form class="chat__form"><input placeholder="Ваше повідомлення..." aria-label="Повідомлення"><button aria-label="Надіслати">${ICON('send')}</button></form>`;
  document.body.append(chatBtn, chat);
  const chatBody = $('.chat__body', chat);
  const answers = [
    [/запис|час|дат/i, 'Записатися можна онлайн — натисніть «Записатися» вгорі сторінки, оберіть дату та час. Або залиште номер, і адміністратор передзвонить.'],
    [/ціна|кошт|вартість|прайс|грн/i, 'Первинна консультація — 1 000 грн (демо-прайс). Повний перелік цін є на сторінці «Ціни».'],
    [/послуг|процедур|уточн/i, 'Якщо не знаєте, що обрати — почніть з консультації. Лікар оцінить стан шкіри та підбере оптимальний план.'],
    [/адрес|де|карт/i, 'Адресу кабінету буде додано на сторінці «Контакти».'],
  ];
  function addMsg(text, who) {
    const m = document.createElement('div');
    m.className = `msg msg--${who}`; m.textContent = text;
    chatBody.appendChild(m); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function reply(text) {
    addMsg(text, 'me');
    const a = answers.find(([re]) => re.test(text));
    setTimeout(() => addMsg(a ? a[1] : 'Дякую за повідомлення! Адміністратор відповість найближчим часом. (Це демо-чат)', 'bot'), 700);
  }
  chatBtn.addEventListener('click', () => chat.classList.toggle('open'));
  $('.chat__close', chat).addEventListener('click', () => chat.classList.remove('open'));
  $$('.chat__quick button', chat).forEach(b => b.addEventListener('click', () => reply(b.textContent)));
  $('.chat__form', chat).addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', e.target);
    if (input.value.trim()) { reply(input.value.trim()); input.value = ''; }
  });
  $$('[data-chat]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); chat.classList.add('open'); }));

  /* ---------- Demo links (# без цілі) ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href="#"]');
    if (a && !a.matches('[data-book],[data-info],[data-chat]')) {
      e.preventDefault();
      showToast(a.dataset.toast || 'Цей розділ з’явиться у повній версії сайту');
    }
  });
});
