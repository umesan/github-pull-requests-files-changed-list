class Entry {
  files: HTMLDivElement | any;
  wrap: HTMLDivElement | any;
  wrapHeader: HTMLDivElement | any;
  button: HTMLButtonElement | any;
  svg1: SVGSVGElement | undefined;
  path1: SVGPathElement | undefined;
  svg2: SVGSVGElement | undefined;
  path2: SVGPathElement | undefined;
  svg3: SVGSVGElement | undefined;
  path3: SVGPathElement | undefined;
  span: HTMLSpanElement | any;
  wrapBody: HTMLDivElement | undefined;
  input: HTMLInputElement | any;
  textarea: HTMLTextAreaElement | any;
  fileList: (string | null)[] | any;
  loaded: boolean | any;
  limitOver: boolean | any;
  toggleOpen: boolean | any;
  filesTabCounterLength: number | any;

  constructor() {
    this.files = document.getElementById('files');
    if (this.files) {
      this.init();
    } else {
      this.checkDomChanged();
    }
  }

  /**
   * Initialization
   */
  init() {
    this.loaded = false;
    this.limitOver = false;
    this.toggleOpen = false;
    this.filesTabCounterLength = 0;
    this.createListArea();
    this.checkChangeFileLimit();
    this.setListAreaData();
    this.setTextAreaHeight();
    this.setToggleEvent();
    this.setTextAreaFocusEvent();
    this.setFilterEvent();
  }

  /**
   * Monitor Dom changes
   */
  checkDomChanged() {
    const target:any = document.getElementById('js-repo-pjax-container');
    if (target) {
      const observer = new MutationObserver(() => {
        this.files = document.getElementById('files');
        if (this.files) {
          this.init();
        }
      });
      const config = {
        childList: true
      };
      observer.observe(target, config);
    }
  }

  /**
   * Create List Area
   */
  createListArea() {
    // warp
    this.wrap = document.createElement('div');
    this.wrap.classList.add('github-pull-requests-files-changed-list', 'Details', 'is-loading');

    // warp header
    this.wrapHeader = document.createElement('div');
    this.wrapHeader.classList.add('github-pull-requests-files-changed-list__header');

    // button
    this.button = document.createElement('button');
    this.button.classList.add('btn-octicon');

    // svg1
    this.svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg1.setAttribute("viewBox", "0 0 16 16");
    this.svg1.setAttribute("version", "1.1");
    this.svg1.setAttribute("width", "16");
    this.svg1.setAttribute("height", "16");
    this.svg1.setAttribute("aria-hidden", "true");
    this.svg1.classList.add('octicon', 'octicon-chevron-down', 'Details-content--hidden');
    this.path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path1.setAttributeNS(null, 'fill-rule', 'evenodd');
    this.path1.setAttributeNS(null, 'd', 'M12.78 6.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L3.22 7.28a.75.75 0 011.06-1.06L8 9.94l3.72-3.72a.75.75 0 011.06 0z');
    this.svg1.appendChild(this.path1);

    // svg2
    this.svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg2.setAttribute("viewBox", "0 0 16 16");
    this.svg2.setAttribute("version", "1.1");
    this.svg2.setAttribute("width", "16");
    this.svg2.setAttribute("height", "16");
    this.svg2.setAttribute("aria-hidden", "true");
    this.svg2.classList.add('octicon', 'octicon-chevron-right', 'Details-content--shown');
    this.path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path2.setAttributeNS(null, 'fill-rule', 'evenodd');
    this.path2.setAttributeNS(null, 'd', 'M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z');
    this.svg2.appendChild(this.path2);

    // title
    this.span = document.createElement('span');
    this.span.classList.add('github-pull-requests-files-changed-list__title');

    // input
    this.input = document.createElement('input');
    this.input.setAttribute('type', 'text');
    this.input.setAttribute('placeholder', 'filter');
    this.input.setAttribute('disabled', true);
    this.input.classList.add('github-pull-requests-files-changed-list__input');

    // body
    this.wrapBody = document.createElement('div');
    this.wrapBody.classList.add('github-pull-requests-files-changed-list__body');

    // svg3
    this.svg3 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg3.setAttribute("viewBox", "0 0 340 84");
    this.svg3.setAttribute("height", "84");
    this.svg3.setAttribute("style", "max-width: 340px;");
    this.svg3.setAttribute("aria-hidden", "true");
    this.svg3.classList.add('width-full');
    this.path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path3.setAttributeNS(null, 'fill-rule', 'evenodd');
    this.path3.setAttributeNS(null, 'clip-path', 'url(#diff-placeholder)');
    this.path3.setAttributeNS(null, 'd', 'M0 0h340v84H0z');
    this.path3.setAttributeNS(null, 'fill', '#eee');
    this.path3.classList.add('js-diff-placeholder');
    this.svg3.appendChild(this.path3);

    // textarea
    this.textarea = document.createElement('textarea');
    this.textarea.classList.add('github-pull-requests-files-changed-list__textarea');

    // append
    this.wrap.appendChild(this.wrapHeader);
    this.wrapHeader.appendChild(this.button);
    this.button.appendChild(this.svg1);
    this.button.appendChild(this.svg2);

    this.wrapHeader.appendChild(this.span);
    this.wrapHeader.appendChild(this.input);
    this.wrap.appendChild(this.wrapBody);
    this.wrapBody.appendChild(this.svg3);
    this.wrapBody.appendChild(this.textarea);

    this.files.parentNode.insertBefore(this.wrap, this.files);
  }

  /**
   * Check whether the display limit is exceeded while acquiring the number of changed files
   */
  checkChangeFileLimit() {
    const filesTabCounter:any = document.getElementById('files_tab_counter');
    let filesTabCounterTitle = filesTabCounter.getAttribute('title');
    if (filesTabCounterTitle.indexOf('+') !== -1) {
      this.limitOver = true;
      this.filesTabCounterLength = 3000;
    } else {
      filesTabCounterTitle = filesTabCounterTitle.replace(',', '');
      this.filesTabCounterLength = Number(filesTabCounterTitle);
    }
  }

  /**
   * Set Data
   */
  setListAreaData() {
    this.span.innerText = 'GitHub Pull requests Files changed list (loading...)';
    this.fileList = this.getFileList();
    if (this.fileList) {
      this.loaded = true;
      this.wrap.classList.remove('is-loading');
      this.input.removeAttribute('disabled');
      const message = this.limitOver ? 'We only load the first 3000 changed files.' : this.fileList.length;
      this.span.innerText = `GitHub Pull requests Files changed list (${message})`;

      if (this.toggleOpen) {
        this.textarea.innerHTML = this.fileList.join('\n');
        this.setTextAreaHeight();
      }
    } else {
      setTimeout(() => {
        this.setListAreaData();
      }, 1000);
    }
  }


  /**
   * Get all changed file names
   */
  getFileList() {
    const fileInfo = document.getElementsByClassName('file-info');
    if (this.filesTabCounterLength === fileInfo.length) {
      const fileList = [];
      for(let i = 0; i < fileInfo.length; i += 1) {
        let title:any = fileInfo[i].getElementsByTagName('a')[0].getAttribute('title');
        if (title.indexOf(' → ') !== -1) {
          const titles = title.split(' → ');
          title = titles[1];
        }
        fileList.push(title);
      }
      return fileList;
    }
    return false;
  }


  /**
   * Set height of textarea
   */
  setTextAreaHeight() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }


  /**
   * Toggle Open/Close processing
   */
  setToggleEvent() {
    this.wrapHeader.addEventListener('click', (e:any) => {
      if (this.wrap.classList.contains('Details--on')) {
        // close
        this.wrap.classList.remove('Details--on');
        this.wrap.classList.add('Details');
        this.toggleOpen = false;
      } else {
        // open
        this.wrap.classList.remove('Details');
        this.wrap.classList.add('Details--on');
        if (this.loaded) {
          this.textarea.innerHTML = this.fileList.join('\n');
          this.setTextAreaHeight();
        }
        this.toggleOpen = true;
      }
    });
  }

  /**
   * Select all when focus on text area
   */
  setTextAreaFocusEvent() {
    this.textarea.addEventListener('focus', (e:any) => {
      e.target.select();
    });
  }

  /**
   * Filter setting
   */
  setFilterEvent() {
    this.input.addEventListener('click', (e:any) => {
      e.stopPropagation();
    });
    this.input.addEventListener('keyup', (e:any) => {
      // e.stopPropagation();
      const filterFileList = this.fileList.filter((item:any) => {
        if (item.indexOf(e.target.value) !== -1) {
          return true;
        }
      });
      this.textarea.innerHTML = filterFileList.join('\n');
      this.setTextAreaHeight();
    });
  }
}

(function () {
  new Entry();
})();
