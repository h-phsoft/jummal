class OracleLovModal {
  constructor(options = {}) {
    this.title = options.title || "List of Values (LOV)";
    this.columns = options.columns || [];
    this.data = options.data || [];
    this.onSelect = options.onSelect || function () {};

    this.filteredData = [...this.data];
    this.selectedIndex = 0;
    this.selectedIndices = new Set();
    this.isOpen = false;

    this.createModalDOM();
    this.addEventListeners();
  }

  createModalDOM() {
    if (document.getElementById('oracleLovModal'))
      return;

    const modalHTML = `
      <div id="oracleLovModal" class="oracle-lov-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1050; align-items: center; justify-content: center; direction: rtl;">
        <div class="oracle-lov-dialog" style="background: #f0f0f0; border: 2px solid #0055ea; border-radius: 4px; width: 650px; max-width: 90%; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-family: Tahoma, sans-serif;">
          <!-- Oracle 6i Style Title Bar -->
          <div class="oracle-lov-header" style="background: linear-gradient(to bottom, #0055ea, #003399); color: white; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 14px;">
            <span id="oracleLovTitle">${this.title}</span>
            <button type="button" id="oracleLovCloseBtn" style="background: transparent; border: none; color: white; font-size: 16px; cursor: pointer;">&times;</button>
          </div>

          <!-- Content Body -->
          <div style="padding: 15px;">
            <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: center;">
              <label style="font-size: 13px; font-weight: bold;">البحث:</label>
              <input type="text" id="oracleLovSearchInput" class="form-control form-control-sm" placeholder="اكتب للبحث..." style="flex: 1;">
            </div>

            <!-- Table Container -->
            <div style="background: white; border: 1px solid #7f9db9; max-height: 50vh; overflow-y: auto;">
              <table class="table table-sm table-bordered table-hover mb-0" style="font-size: 13px;">
                <thead style="background: #ebeadb; position: sticky; top: 0; z-index: 1;">
                  <tr>
                    <th style="width: 40px; text-align: center;">✓</th>
                    ${this.columns.map(col => `<th>${col.label}</th>`).join('')}
                  </tr>
                </thead>
                <tbody id="oracleLovTableBody">
                  <!-- Dynamic rows -->
                </tbody>
              </table>
            </div>

            <!-- Action Buttons Footer -->
            <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
              <small class="text-muted">انقر مباشرة على أي صف لتحديده أو إلغاء تحديده</small>
              <div style="display: flex; gap: 8px;">
                <button type="button" id="oracleLovSelectBtn" class="btn btn-sm btn-primary px-4">موافق</button>
                <button type="button" id="oracleLovCancelBtn" class="btn btn-sm btn-secondary px-4">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    this.modalEl = document.getElementById('oracleLovModal');
    this.searchInputEl = document.getElementById('oracleLovSearchInput');
    this.tableBodyEl = document.getElementById('oracleLovTableBody');
  }

  addEventListeners() {
    document.getElementById('oracleLovCloseBtn').addEventListener('click', () => this.close());
    document.getElementById('oracleLovCancelBtn').addEventListener('click', () => this.close());

    // Explicit binding to confirmSelection method
    document.getElementById('oracleLovSelectBtn').addEventListener('click', (e) => {
      e.preventDefault();
      this.confirmSelection();
    });

    this.searchInputEl.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      this.filterData(query);
    });

    this.modalEl.addEventListener('keydown', (e) => {
      if (!this.isOpen)
        return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredData.length - 1);
        this.renderTable();
        this.scrollToSelected();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderTable();
        this.scrollToSelected();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.toggleSelection(this.selectedIndex);
        this.renderTable();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.filteredData.length > 0) {
          this.confirmSelection();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });
  }

  setData(newData) {
    this.data = newData;
    this.filteredData = [...newData];
    this.selectedIndex = 0;
    this.selectedIndices.clear();
  }

  open(initialQuery = '') {
    this.isOpen = true;
    this.modalEl.style.display = 'flex';
    this.searchInputEl.value = initialQuery;
    this.filterData(initialQuery.toLowerCase());
    setTimeout(() => {
      this.searchInputEl.focus();
      this.searchInputEl.select();
    }, 50);
  }

  close() {
    this.isOpen = false;
    this.modalEl.style.display = 'none';
  }

  filterData(query) {
    if (!query) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(item => {
        return this.columns.some(col => {
          const val = String(item[col.field] || '').toLowerCase();
          return val.includes(query);
        });
      });
    }
    this.selectedIndex = 0;
    this.selectedIndices.clear();
    this.renderTable();
  }

  toggleSelection(index) {
    if (this.selectedIndices.has(index)) {
      this.selectedIndices.delete(index);
    } else {
      this.selectedIndices.add(index);
    }
  }

  renderTable() {
    this.tableBodyEl.innerHTML = '';
    if (this.filteredData.length === 0) {
      this.tableBodyEl.innerHTML = `<tr><td colspan="${this.columns.length + 1}" class="text-center text-muted py-3">لا توجد نتائج مطابقة</td></tr>`;
      return;
    }

    this.filteredData.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'oracle-lov-row';
      tr.style.cursor = 'pointer';

      const isSelected = this.selectedIndices.has(index);
      const isFocused = (index === this.selectedIndex);

      if (isSelected) {
        tr.style.backgroundColor = '#0055ea';
        tr.style.color = '#ffffff';
        tr.style.fontWeight = 'bold';
      } else {
        tr.style.backgroundColor = '#ffffff';
        tr.style.color = '#000000';
        tr.style.fontWeight = 'normal';
      }

      if (isFocused && !isSelected) {
        tr.style.outline = '2px solid #0055ea';
      }

      const checkboxHtml = `<td style="text-align: center;"><input type="checkbox" ${isSelected ? 'checked' : ''} style="pointer-events: none;"></td>`;
      const dataHtml = this.columns.map(col => `<td>${item[col.field] || ''}</td>`).join('');

      tr.innerHTML = checkboxHtml + dataHtml;

      tr.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.selectedIndex = index;
        this.toggleSelection(index);
        this.renderTable();
      });

      tr.addEventListener('dblclick', () => {
        this.selectedIndex = index;
        this.selectedIndices.clear();
        this.selectedIndices.add(index);
        this.confirmSelection();
      });

      this.tableBodyEl.appendChild(tr);
    });
  }

  scrollToSelected() {
    const selectedRow = this.tableBodyEl.children[this.selectedIndex];
    if (selectedRow) {
      selectedRow.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    }
  }

  confirmSelection() {
    // If nothing is explicitly checked/selected, default to highlighting/selecting the currently focused index row
    if (this.selectedIndices.size === 0 && this.filteredData.length > 0) {
      this.selectedIndices.add(this.selectedIndex);
    }

    if (this.selectedIndices.size > 0) {
      const selectedItems = Array.from(this.selectedIndices)
        .map(i => this.filteredData[i])
        .filter(item => item !== undefined); // Prevents undefined items from getting passed

      if (selectedItems.length > 0) {
        this.onSelect(selectedItems.length === 1 ? selectedItems[0] : selectedItems);
        this.close();
      }
    }
  }
}