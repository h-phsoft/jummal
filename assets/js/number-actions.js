// === إجراءات الأرقام: قائمة الانتقال إلى صفحات الدراسة ===
const NUMBER_URL_PARAM = 'n';

const NUMBER_ACTIONS = [
  {label: 'دراسة الرقم', icon: 'bi-123', page: 'number-study.html'},
  {label: 'دراسة الرقم في الأوفاق', icon: 'bi-grid-3x3', page: 'awfaq-shamil.html'},
  {label: 'بحث عن الرقم في الكلمات', icon: 'bi-search', page: 'search.html'}
];

// بناء رابط الصفحة مع الرقم
function buildNumberActionUrl(page, number) {
  return `${page}?${NUMBER_URL_PARAM}=${encodeURIComponent(number)}`;
}

// إنشاء القائمة مرة واحدة في الصفحة
function ensureNumberActionsMenu() {
  let menu = $('#numberActionsMenu');
  if (menu.length > 0) {
    return menu;
  }

  menu = $('<div id="numberActionsMenu" class="number-actions-menu" role="menu"></div>');
  menu.append('<div class="number-actions-title"></div>');
  NUMBER_ACTIONS.forEach(action => {
    const item = $(`
      <button type="button" class="number-actions-item" role="menuitem">
        <i class="bi ${action.icon}"></i> ${action.label}
      </button>`);
    item.on('click', function () {
      const number = menu.data('number');
      hideNumberActionsMenu();
      if (number !== undefined && number !== null && number !== '') {
        // فتح الصفحة المطلوبة في تبويب جديد
        window.open(buildNumberActionUrl(action.page, number), '_blank');
      }
    });
    menu.append(item);
  });
  $('body').append(menu);

  // إخفاء القائمة عند النقر خارجها أو الضغط على Esc أو التمرير
  $(document).on('mousedown', function (e) {
    if ($(e.target).closest('#numberActionsMenu, .number-actions-btn').length === 0) {
      hideNumberActionsMenu();
    }
  });
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      hideNumberActionsMenu();
    }
  });
  $(window).on('scroll resize', hideNumberActionsMenu);
  $('.glass-card').on('scroll', hideNumberActionsMenu);

  return menu;
}

function hideNumberActionsMenu() {
  $('#numberActionsMenu').removeClass('show');
}

// إظهار القائمة عند الإحداثيات المحددة مع إبقائها داخل الشاشة
function showNumberActionsMenu(number, x, y) {
  const menu = ensureNumberActionsMenu();
  menu.data('number', number);
  menu.find('.number-actions-title').text(Number(number).toLocaleString());
  menu.css({left: 0, top: 0}).addClass('show');

  const width = menu.outerWidth();
  const height = menu.outerHeight();
  let left = x;
  let top = y;
  if (left + width > window.innerWidth - 8) {
    left = window.innerWidth - width - 8;
  }
  if (top + height > window.innerHeight - 8) {
    top = window.innerHeight - height - 8;
  }
  if (left < 8) {
    left = 8;
  }
  if (top < 8) {
    top = 8;
  }
  menu.css({left: left, top: top});
}

// ربط القائمة بكل عنصر يحمل data-number داخل الحاوية
function initNumberActions(containerSelector) {
  ensureNumberActionsMenu();
  const container = $(containerSelector);

  // القائمة بالزر الأيمن
  container.on('contextmenu', '[data-number]', function (e) {
    e.preventDefault();
    showNumberActionsMenu($(this).data('number'), e.clientX, e.clientY);
  });

  // الزر الصغير الذي يظهر عند المرور
  container.on('click', '.number-actions-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const cell = $(this).closest('[data-number]');
    const rect = this.getBoundingClientRect();
    showNumberActionsMenu(cell.data('number'), rect.left, rect.bottom + 2);
  });
}

// إنشاء محتوى خلية رقمية مع الزر الصغير
// formatted = false يعرض الرقم كما هو دون فواصل الآلاف
function numberCellContent(value, formatted = true) {
  const display = formatted ? Number(value).toLocaleString() : String(value);
  return `<span class="number-value">${display}</span>` +
    '<button type="button" class="number-actions-btn" title="خيارات الرقم"><i class="bi bi-three-dots-vertical"></i></button>';
}

// قراءة الرقم من الرابط ووضعه كقيمة افتراضية في الحقل
function applyNumberFromUrl(inputSelector) {
  const value = new URLSearchParams(window.location.search).get(NUMBER_URL_PARAM);
  if (value === null || !/^\d+$/.test(value.trim())) {
    return false;
  }
  const input = $(inputSelector);
  if (input.length === 0) {
    return false;
  }
  input.val(value.trim()).trigger('focus');
  return true;
}
