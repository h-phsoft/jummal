/* global qAyatData */

class AyatAutocomplete {
  constructor(inputSelector, options = {}) {
    this.input = document.querySelector(inputSelector);
    if (!this.input)
      return;

    this.onSelect = options.onSelect || function () {};
    this.createDropdown();
    this.addListeners();
  }

  createDropdown() {
    // Create dropdown container if it doesn't exist
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ayat-autocomplete-dropdown shadow-sm';
    this.dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      direction: rtl;
      text-align: right;
    `;

    // Ensure parent input group has relative positioning for proper absolute alignment
    const parent = this.input.parentElement;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(this.dropdown);
  }

  addListeners() {
    this.input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (!query || typeof qAyatData === 'undefined') {
        this.hide();
        return;
      }
      this.search(query);
    });

    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hide();
      }
    });
  }

  search(query) {
    // Filter qAyatData where ayatSearch includes the typed text
    const matches = qAyatData.filter(item => item.ayatSearch && item.ayatSearch.includes(query)).slice(0, 15); // limit to 15 results for performance

    if (matches.length === 0) {
      this.hide();
      return;
    }

    this.render(matches);
  }

  render(matches) {
    this.dropdown.innerHTML = '';
    matches.forEach(item => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item p-2 border-bottom';
      div.style.cssText = 'cursor: pointer; font-size: 0.9rem; transition: background 0.2s;';
      div.textContent = item.ayat28Text; // Display ayat28Text as requested

      div.addEventListener('mouseenter', () => div.style.backgroundColor = '#f8f9fa');
      div.addEventListener('mouseleave', () => div.style.backgroundColor = '#fff');

      div.addEventListener('click', () => {
        this.input.value = item.ayat28Text; // Set input value to ayat28Text
        this.onSelect(item);
        this.hide();
      });

      this.dropdown.appendChild(div);
    });

    this.dropdown.style.display = 'block';
  }

  hide() {
    this.dropdown.style.display = 'none';
  }
}