/* eslint-disable no-undef*/
/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-inner-declarations */
/* eslint-disable func-names */
/* eslint-disable no-alert */

let user = JSON.parse(sessionStorage.getItem('user'));
let ARTICLES_INDEX_FROM = 0;
let ARTICLES_INDEX_TO = 10;

const articlesModule = (function () {
  let articles;
  let tags;
  loadArticles();
  loadTags();

  function loadArticles() {
    const xhr = new XMLHttpRequest();

    function loadHandler() {
      articles = JSON.parse(this.responseText, (key, value) => {
        if (key === 'createdAt') {
          return new Date(value);
        }

        return value;
      });
      cleanUp();
    }

    function cleanUp() {
      xhr.removeEventListener('load', loadHandler);
    }

    xhr.addEventListener('load', loadHandler);
    xhr.open('GET', '/article', false);
    xhr.send();
  }

  function loadTags() {
    const xhr = new XMLHttpRequest();

    function loadHandler() {
      tags = JSON.parse(this.responseText);
      cleanUp();
    }

    function cleanUp() {
      xhr.removeEventListener('load', loadHandler);
    }

    xhr.addEventListener('load', loadHandler);
    xhr.open('GET', '/tags', false);
    xhr.send();
  }

  function getArticles(skip, top, filterConfig) {
    let resultArticles = articles.filter(currentElement => !currentElement.isHidden);
    const from = skip || 0;
    const amount = top || 10;
    if (filterConfig) {
      if (filterConfig.dateFrom) {
        resultArticles = resultArticles.filter(currentElement => currentElement.createdAt.getTime() >= filterConfig.dateFrom.getTime());
      }
      if (filterConfig.dateTo) {
        resultArticles = resultArticles.filter(currentElement => currentElement.createdAt.getTime() <= filterConfig.dateTo.getTime());
      }
      if (filterConfig.author && filterConfig.author !== '') {
        resultArticles = resultArticles.filter(currentElement => currentElement.author === filterConfig.author);
      }
      if (filterConfig.tags && filterConfig.tags.length !== 0) {
        resultArticles = resultArticles.filter(currentElement => filterConfig.tags.every(tag => currentElement.tags.indexOf(tag) >= 0));
      }
    }
    resultArticles.sort((firstArticle, secondArticle) => secondArticle.createdAt.getTime() - firstArticle.createdAt.getTime());
    articles = resultArticles;

    return resultArticles.slice(from, from + amount);
  }

  function getArticle(findId) {
    resetArticles();

    return articles.filter(currentElement => currentElement.id === findId)[0];
  }

  function validateAddArticle(article) {
    if (!article.id || (typeof (article.id) !== 'string')) {
      return false;
    } else if (!article.title || (typeof (article.title) !== 'string' || article.title.length === 0 ||
            article.title.length > 100)) {
      return false;
    } else if (!article.summary || (typeof (article.summary) !== 'string' || article.summary.length === 0 ||
            article.summary.length > 200)) {
      return false;
    } else if (!article.createdAt || !(article.createdAt instanceof Date)) {
      return false;
    } else if (!article.author || (typeof (article.author) !== 'string' || article.author.length === 0)) {
      return false;
    } else if (!article.content || (typeof (article.content) !== 'string' || article.content.length === 0)) {
      return false;
    } else if (!article.tags || (!(article.tags instanceof Array) || article.tags.length === 0 ||
            article.tags.length > 5)) {
      return false;
    }

    return !(!article.tags || (!article.tags.every(tag => tags.indexOf(tag) >= 0) || !article.tags.every(tag => typeof (tag) === 'string')));
  }

  function validateEditArticle(article) {
    if (article.id && (typeof (article.id) !== 'string' || article.id.length === 0)) {
      return false;
    } else if (article.title && (typeof (article.title) !== 'string' || article.title.length === 0 ||
            article.title.length > 100)) {
      return false;
    } else if (article.summary && (typeof (article.summary) !== 'string' || article.summary.length === 0 ||
            article.summary.length > 200)) {
      return false;
    } else if (article.createdAt && !(article.createdAt instanceof Date)) {
      return false;
    } else if (article.author && (typeof (article.author) !== 'string' || article.author.length === 0)) {
      return false;
    } else if (article.content && (typeof (article.content) !== 'string' || article.content.length === 0)) {
      return false;
    } else if (article.tags && (!(article.tags instanceof Array) || article.tags.length === 0 ||
            article.tags.length > 5)) {
      return false;
    } else if (article.tags && (!article.tags.every(tag => tags.indexOf(tag) >= 0) || !article.tags.every(tag => typeof (tag) === 'string'))) {
      return false;
    }

    return true;
  }

  function addArticle(article) {
    resetArticles();
    const prevSize = articles.length;
    const success = articles.push(article);
    sendArticle();
    function sendArticle() {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/article', false);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify(article));
    }

    return prevSize !== success;
  }

  function editArticle(newArticle) {
    resetArticles();
    sendArticle();
    function sendArticle() {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', '/article', false);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify(newArticle));
    }

    return true;
  }

  function numberOfArticles() {
    return articles.length;
  }

  function formatArticleDate(date) {
    return `${(date.getDate() > 9) ? date.getDate() : (`0${date.getDate()}`)}.${
            (date.getMonth() + 1 > 9) ? (date.getMonth() + 1) : `0${date.getMonth() + 1}`}.${
            date.getFullYear()} ${(date.getHours() > 9) ? date.getHours() : (`0${date.getHours()}`)}:${
            (date.getMinutes() > 9) ? date.getMinutes() : (`0${date.getMinutes()}`)}`;
  }

  function resetArticles() {
    ARTICLES_INDEX_FROM = 0;
    ARTICLES_INDEX_TO = 10;
    loadArticles();
    loadTags();
    sessionStorage.removeItem('filters');
  }

  function hideArticle(id) {
    sendArticle();
    function sendArticle() {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', '/article', false);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify({ id }));
    }
    const article = getArticle(id);
    if (article) {
      article.isHidden = true;
    }
  }

  return {
    getArticles,
    getArticle,
    validateAddArticle,
    validateEditArticle,
    addArticle,
    editArticle,
    numberOfArticles,
    formatArticleDate,
    resetArticles,
    hideArticle,
  };
}());

const newsPageRenderer = (function () {
  const MAIN_BLOCK = document.querySelector('.main-block');
  let CONTENT;
  const ARTICLE_TEMPLATE = document.querySelector('#template-article');
  const TAGS_LIST_NODE = ARTICLE_TEMPLATE.content.querySelector('.article-tags');
  const ARTICLE_TAGS_TEMPLATE = document.querySelector('#template-article-tags');

  const FILTERS_TEMPLATE = document.querySelector('#template-filters');

  const PAGINATOR_TEMPLATE = document.querySelector('#template-paginator');
  const NEXT_BUTTON_TEMPLATE = document.querySelector('#template-pagination-next-button');
  const PREV_BUTTON_TEMPLATE = document.querySelector('#template-pagination-prev-button');
  let PAGINATOR;

  function renderNewsPage(articles) {
    renderHeader();
    MAIN_BLOCK.innerHTML = '';
    MAIN_BLOCK.innerHTML = '<div class="content"></div>\n';
    CONTENT = document.querySelector('.content');
    const articlesNodes = getRenderArticles(articles);
    articlesNodes.forEach((node) => {
      CONTENT.appendChild(node);
    });

    CONTENT.querySelectorAll('.more-info-button').forEach((MORE_INFO_BUTTON) => {
      MORE_INFO_BUTTON.addEventListener('click', handleArticleListButtonClick);
    });
    if (user != null) {
      CONTENT.querySelectorAll('.edit-button').forEach((EDIT_BUTTON) => {
        EDIT_BUTTON.addEventListener('click', handleArticleEditButtonClick);
      });
      CONTENT.querySelectorAll('.delete-button').forEach((DELETE_BUTTON) => {
        DELETE_BUTTON.addEventListener('click', handleArticleDeleteButtonClick);
      });
    }

    document.addEventListener('click', handleMainButtonClick);

    MAIN_BLOCK.appendChild(renderFiltersBar());

    MAIN_BLOCK.appendChild(PAGINATOR_TEMPLATE.content.querySelector('.paginator').cloneNode(true));
    PAGINATOR = document.querySelector('.paginator');
    if (ARTICLES_INDEX_FROM > 0) {
      PAGINATOR.appendChild(PREV_BUTTON_TEMPLATE.content.querySelector('.pagination-prev-button').cloneNode(true));
    }
    if (articlesModule.numberOfArticles() > ARTICLES_INDEX_TO) {
      PAGINATOR.appendChild(NEXT_BUTTON_TEMPLATE.content.querySelector('.pagination-next-button').cloneNode(true));
    }
    PAGINATOR.addEventListener('click', handlePaginatorClick);

    document.querySelector('.add-tag-small-button').addEventListener('click', handleAddTagButtonClick);
    document.querySelector('.confirm-small-button').addEventListener('click', handleConfirmFilterButtonClick);
    document.querySelector('.reset-small-button').addEventListener('click', handleResetFilterButtonClick);
    document.querySelectorAll('.filter-tags').forEach((tag) => {
      tag.addEventListener('click', handleChosenTagClick);
    });
  }

  function renderFiltersBar() {
    const AUTHORS_DATALIST = FILTERS_TEMPLATE.content.querySelector('#authors');
    const TAGS_DATALIST = FILTERS_TEMPLATE.content.querySelector('#tags');
    const TAGS_LIST = FILTERS_TEMPLATE.content.querySelector('.tags-list');
    const FILTER_TAG_TEMPLATE = document.querySelector('#template-filter-tag');
    const OPTION_TEMPLATE = document.querySelector('#template-option');
    const filters = getCurrentFilters();
    let authors;
    let tags;

    loadAuthors();
    loadTags();

    function loadAuthors() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        authors = JSON.parse(this.responseText).map(user => user.login);
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/user', false);
      xhr.send();
    }

    function loadTags() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        tags = JSON.parse(this.responseText);
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/tags', false);
      xhr.send();
    }

    AUTHORS_DATALIST.innerHTML = '';
    TAGS_DATALIST.innerHTML = '';
    TAGS_LIST.innerHTML = '';
    if (filters && filters != null) {
      FILTERS_TEMPLATE.content.querySelector('.date-from').value =
                (filters.dateFrom && filters.dateFrom != null) ? formatFilterDate(filters.dateFrom) : '';
      FILTERS_TEMPLATE.content.querySelector('.date-to').value =
                (filters.dateTo && filters.dateTo != null) ? formatFilterDate(filters.dateTo) : '';
      FILTERS_TEMPLATE.content.querySelector('.author-input').value = (filters.author) ? filters.author : '';
      if (filters.tags) {
        filters.tags.forEach((tag) => {
          FILTER_TAG_TEMPLATE.content.querySelector('.filter-tags').textContent = tag;
          TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector('.tags-list-element').cloneNode(true));
        });
      }
    } else {
      FILTERS_TEMPLATE.content.querySelector('.date-from').value = '';
      FILTERS_TEMPLATE.content.querySelector('.date-to').value = '';
      FILTERS_TEMPLATE.content.querySelector('.author-input').value = '';
      FILTERS_TEMPLATE.content.querySelector('.tags-input').value = '';
    }
    if (authors) {
      authors.forEach((author) => {
        OPTION_TEMPLATE.content.querySelector('.option').value = author;
        AUTHORS_DATALIST.appendChild(OPTION_TEMPLATE.content.querySelector('.option').cloneNode(true));
      });
    }
    if (tags) {
      tags.forEach((tag) => {
        OPTION_TEMPLATE.content.querySelector('.option').value = tag;
        TAGS_DATALIST.appendChild(OPTION_TEMPLATE.content.querySelector('.option').cloneNode(true));
      });
    }

    return FILTERS_TEMPLATE.content.querySelector('.filters-block').cloneNode(true);
  }

  function getRenderArticles(articles) {
    return articles.map(renderArticle);
  }

  function renderArticle(article) {
    ARTICLE_TEMPLATE.content.querySelector('.article-item').dataset.id = article.id;
    ARTICLE_TEMPLATE.content.querySelector('.article-title').textContent = article.title;
    ARTICLE_TEMPLATE.content.querySelector('.article-author').textContent = article.author;
    ARTICLE_TEMPLATE.content.querySelector('.article-date').textContent = articlesModule.formatArticleDate(article.createdAt);
    ARTICLE_TEMPLATE.content.querySelector('.article-content-container').innerHTML = '';
    ARTICLE_TEMPLATE.content.querySelector('.article-summary-container').innerHTML = '';
    ARTICLE_TEMPLATE.content.querySelector('.article-summary-container').innerHTML = '<p class="article-summary"></p>';
    ARTICLE_TEMPLATE.content.querySelector('.article-summary').textContent = article.summary;

    const ARTICLE_BUTTONS = ARTICLE_TEMPLATE.content.querySelector('.article-buttons');
    const TEMPLATE_FULL_VIEW_BUTTON = document.querySelector('#template-full-view-button');
    ARTICLE_BUTTONS.innerHTML = '';
    ARTICLE_BUTTONS.appendChild(TEMPLATE_FULL_VIEW_BUTTON.content.querySelector('.more-info-button').cloneNode(true));
    if (user != null) {
      const TEMPLATE_EDIT_BUTTON = document.querySelector('#template-edit-button');
      const TEMPLATE_DELETE_BUTTON = document.querySelector('#template-delete-button');
      ARTICLE_BUTTONS.appendChild(TEMPLATE_EDIT_BUTTON.content.querySelector('.edit-button').cloneNode(true));
      ARTICLE_BUTTONS.appendChild(TEMPLATE_DELETE_BUTTON.content.querySelector('.delete-button').cloneNode(true));
    }

    const tagsNodes = renderTags(article.tags);
    tagsNodes.forEach((node) => {
      TAGS_LIST_NODE.appendChild(node);
    });

    return ARTICLE_TEMPLATE.content.querySelector('.article-item').cloneNode(true);
  }

  function renderTags(tags) {
    TAGS_LIST_NODE.innerHTML = '';

    return tags.map(tag => renderTag(tag));
  }

  function renderTag(tag) {
    const template = ARTICLE_TAGS_TEMPLATE;
    template.content.querySelector('.tags').textContent = tag;

    return template.content.querySelector('.tags').cloneNode(true);
  }

  function formatFilterDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1 > 9) ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
            }-${(date.getDate() > 9) ? date.getDate() : `0${date.getDate()}`}`;
  }

  function handleAddTagButtonClick() {
    const TAGS_LIST = document.querySelector('.tags-list');
    const FILTER_TAG_TEMPLATE = document.querySelector('#template-filter-tag');
    const filters = getCurrentFilters() || {};
    let tags;
    loadTags();
    function loadTags() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        tags = JSON.parse(this.responseText);
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/tags', false);
      xhr.send();
    }
    filters.tags = filters.tags || [];
    const tag = document.forms.filters.elements.tagsInput.value;
    if (filters.tags.length < 5 && tags.indexOf(tag) !== -1 && filters.tags.indexOf(tag) === -1) {
      filters.tags.push(tag);
      sessionStorage.setItem('filters', JSON.stringify(filters));
      document.forms.filters.elements.tagsInput.value = '';
      TAGS_LIST.innerHTML = '';
      filters.tags.forEach((tag) => {
        FILTER_TAG_TEMPLATE.content.querySelector('.filter-tags').textContent = tag;
        TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector('.tags-list-element').cloneNode(true));
      });
      document.querySelectorAll('.filter-tags').forEach((tag) => {
        tag.addEventListener('click', handleChosenTagClick);
      });
    } else {
      alert('Невозможно добавить тег!');
    }
  }

  function handleConfirmFilterButtonClick() {
    const filters = getCurrentFilters() || {};
    let tempDate;
    filters.author = document.forms.filters.elements.authorInput.value;
    tempDate = document.forms.filters.elements.dateFromInput.value;
    filters.dateFrom = (tempDate !== '') ? new Date(tempDate) : undefined;
    tempDate = document.forms.filters.elements.dateToInput.value;
    filters.dateTo = (tempDate !== '') ? new Date(tempDate) : undefined;
    sessionStorage.setItem('filters', JSON.stringify(filters));
    ARTICLES_INDEX_FROM = 0;
    ARTICLES_INDEX_TO = 10;
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
  }

  function handleChosenTagClick(event) {
    const TAGS_LIST = document.querySelector('.tags-list');
    const FILTER_TAG_TEMPLATE = document.querySelector('#template-filter-tag');
    const filters = getCurrentFilters();
    filters.tags.splice(filters.tags.indexOf(event.target.textContent), 1);
    sessionStorage.setItem('filters', JSON.stringify(filters));
    TAGS_LIST.innerHTML = '';
    if (filters.tags.length > 0) {
      filters.tags.forEach((tag) => {
        FILTER_TAG_TEMPLATE.content.querySelector('.filter-tags').textContent = tag;
        TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector('.tags-list-element').cloneNode(true));
      });
      document.querySelectorAll('.filter-tags').forEach((tag) => {
        tag.addEventListener('click', handleChosenTagClick);
      });
    }
  }

  function handleResetFilterButtonClick() {
    ARTICLES_INDEX_FROM = 0;
    ARTICLES_INDEX_TO = 10;
    sessionStorage.removeItem('filters');
    articlesModule.resetArticles();
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
  }

  return { renderNewsPage };
}());

const articleFullViewRenderer = (function () {
  const MAIN_BLOCK = document.querySelector('.main-block');
  const ARTICLE_TEMPLATE = document.querySelector('#template-article');
  const TAGS_LIST_NODE = ARTICLE_TEMPLATE.content.querySelector('.article-tags');
  const ARTICLE_TAGS_TEMPLATE = document.querySelector('#template-article-tags');

  function renderFullArticle(id) {
    MAIN_BLOCK.innerHTML = '';
    const article = createArticle(id);
    MAIN_BLOCK.innerHTML = '<div class="full-article"></div>\n';
    const CONTENT = document.querySelector('.full-article');
    CONTENT.appendChild(article);
    if (user != null) {
      document.querySelector('.edit-button').addEventListener('click', handleArticleEditButtonClick);
      document.querySelector('.delete-button').addEventListener('click', handleArticleDeleteButtonClick);
    }
  }

  function createArticle(id) {
    const article = articlesModule.getArticle(id);
    ARTICLE_TEMPLATE.content.querySelector('.article-item').dataset.id = article.id;
    ARTICLE_TEMPLATE.content.querySelector('.article-title').textContent = article.title;
    ARTICLE_TEMPLATE.content.querySelector('.article-summary-container').innerHTML = '';
    ARTICLE_TEMPLATE.content.querySelector('.article-author').textContent = article.author;
    ARTICLE_TEMPLATE.content.querySelector('.article-date').textContent = articlesModule.formatArticleDate(article.createdAt);
    ARTICLE_TEMPLATE.content.querySelector('.article-content-container').innerHTML = '';
    ARTICLE_TEMPLATE.content.querySelector('.article-content-container').innerHTML = '<p class="article-content"></p>';
    ARTICLE_TEMPLATE.content.querySelector('.article-content').textContent = article.content;

    const ARTICLE_BUTTONS = ARTICLE_TEMPLATE.content.querySelector('.article-buttons');
    const TEMPLATE_EDIT_BUTTON = document.querySelector('#template-edit-button');
    const TEMPLATE_DELETE_BUTTON = document.querySelector('#template-delete-button');

    const tagsNodes = renderTags(article.tags);
    tagsNodes.forEach((node) => {
      TAGS_LIST_NODE.appendChild(node);
    });

    ARTICLE_BUTTONS.innerHTML = '';
    if (user != null) {
      ARTICLE_BUTTONS.appendChild(TEMPLATE_EDIT_BUTTON.content.querySelector('.edit-button').cloneNode(true));
      ARTICLE_BUTTONS.appendChild(TEMPLATE_DELETE_BUTTON.content.querySelector('.delete-button').cloneNode(true));
    }

    return ARTICLE_TEMPLATE.content.querySelector('.article-item').cloneNode(true);
  }

  function renderTags(tags) {
    TAGS_LIST_NODE.innerHTML = '';

    return tags.map(tag => renderTag(tag));
  }

  function renderTag(tag) {
    const template = ARTICLE_TAGS_TEMPLATE;
    template.content.querySelector('.tags').textContent = tag;

    return template.content.querySelector('.tags').cloneNode(true);
  }

  return { renderFullArticle };
}());

const editPageRenderer = (function () {
  const MAIN_BLOCK = document.querySelector('.main-block');
  const EDIT_FORM_TEMPLATE = document.querySelector('#template-edit-form');
  const TAGS_DATALIST = EDIT_FORM_TEMPLATE.content.querySelector('#edit-form-tags-options');
  const TAGS_LIST = EDIT_FORM_TEMPLATE.content.querySelector('.edit-form-tags-list');
  const FILTER_TAG_TEMPLATE = document.querySelector('#template-filter-tag');
  const OPTION_TEMPLATE = document.querySelector('#template-option');
  let article = {};

  function renderEditPage(id) {
    MAIN_BLOCK.innerHTML = '';
    if (id != null && id) {
      MAIN_BLOCK.appendChild(renderExistentArticle(id));
    } else {
      MAIN_BLOCK.appendChild(renderNewArticle());
    }
    document.querySelector('.add-tag-small-button').addEventListener('click', handleAddTagButtonClick);
    document.querySelectorAll('.filter-tags').forEach((tag) => {
      tag.addEventListener('click', handleChosenTagClick);
    });
    document.querySelector('.add-article-button-block').addEventListener('click', handleAddChangeArticleConfirmClick);
  }

  function renderExistentArticle(id) {
    let tags;
    loadTags();
    function loadTags() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        tags = JSON.parse(this.responseText);
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/tags', false);
      xhr.send();
    }
    TAGS_DATALIST.innerHTML = '';
    TAGS_LIST.innerHTML = '';
    article = articlesModule.getArticle(id);
    EDIT_FORM_TEMPLATE.content.querySelector('.id-edit').textContent = article.id;
    EDIT_FORM_TEMPLATE.content.querySelector('.author-edit').textContent = article.author;
    EDIT_FORM_TEMPLATE.content.querySelector('.date-edit').textContent = articlesModule.formatArticleDate(article.createdAt);
    EDIT_FORM_TEMPLATE.content.querySelector('#title-input').textContent = article.title;
    EDIT_FORM_TEMPLATE.content.querySelector('#summary-input').textContent = article.summary;
    EDIT_FORM_TEMPLATE.content.querySelector('#content-input').textContent = article.content;
    EDIT_FORM_TEMPLATE.content.querySelector('.confirm-article-button').textContent = 'Принять изменения';
    if (tags) {
      tags.forEach((tag) => {
        OPTION_TEMPLATE.content.querySelector('.option').value = tag;
        TAGS_DATALIST.appendChild(OPTION_TEMPLATE.content.querySelector('.option').cloneNode(true));
      });
    }
    article.tags.forEach((tag) => {
      FILTER_TAG_TEMPLATE.content.querySelector('.filter-tags').textContent = tag;
      TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector('.tags-list-element').cloneNode(true));
    });

    return EDIT_FORM_TEMPLATE.content.querySelector('.edit-form').cloneNode(true);
  }

  function renderNewArticle() {
    let tags;
    loadTags();
    function loadTags() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        tags = JSON.parse(this.responseText);
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/tags', false);
      xhr.send();
    }
    let articles;
    loadArticles();
    function loadArticles() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        articles = JSON.parse(this.responseText, (key, value) => {
          if (key === 'createdAt') {
            return new Date(value);
          }

          return value;
        });
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/article', false);
      xhr.send();
    }
    TAGS_DATALIST.innerHTML = '';
    TAGS_LIST.innerHTML = '';
    article.tags = [];
    EDIT_FORM_TEMPLATE.content.querySelector('.id-edit').textContent = (articles.length + 1);
    EDIT_FORM_TEMPLATE.content.querySelector('.author-edit').textContent = user;
    EDIT_FORM_TEMPLATE.content.querySelector('.date-edit').textContent = articlesModule.formatArticleDate(new Date());
    EDIT_FORM_TEMPLATE.content.querySelector('#title-input').textContent = '';
    EDIT_FORM_TEMPLATE.content.querySelector('#summary-input').textContent = '';
    EDIT_FORM_TEMPLATE.content.querySelector('#content-input').textContent = '';
    EDIT_FORM_TEMPLATE.content.querySelector('.confirm-article-button').textContent = 'Добавить новость в ленту';
    if (tags) {
      tags.forEach((tag) => {
        OPTION_TEMPLATE.content.querySelector('.option').value = tag;
        TAGS_DATALIST.appendChild(OPTION_TEMPLATE.content.querySelector('.option').cloneNode(true));
      });
    }

    return EDIT_FORM_TEMPLATE.content.querySelector('.edit-form').cloneNode(true);
  }

  function handleAddTagButtonClick() {
    const TAGS_LIST = document.querySelector('.edit-form-tags-list');
    const FILTER_TAG_TEMPLATE = document.querySelector('#template-filter-tag');
    let tags;
    loadTags();
    function loadTags() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        tags = JSON.parse(this.responseText);
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/tags', false);
      xhr.send();
    }
    const tag = document.forms.edit.elements.tagsInput.value.toLowerCase();
    if (article.tags.length < 5 && article.tags.indexOf(tag) === -1) {
      if (tags.indexOf(tag) === -1) {
        tags.push(tag);
        sendTag();
        function sendTag() {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/tag', false);
          xhr.setRequestHeader('content-type', 'application/json');
          xhr.send(JSON.stringify({ tag }));
        }
      }
      article.tags.push(tag);
      document.forms.edit.elements.tagsInput.value = '';
      TAGS_LIST.innerHTML = '';
      article.tags.forEach((tag) => {
        FILTER_TAG_TEMPLATE.content.querySelector('.filter-tags').textContent = tag;
        TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector('.tags-list-element').cloneNode(true));
      });
      document.querySelectorAll('.filter-tags').forEach((tag) => {
        tag.addEventListener('click', handleChosenTagClick);
      });
    } else {
      alert('Невозможно добавить тег!');
    }
  }

  function handleChosenTagClick(event) {
    const TAGS_LIST = document.querySelector('.edit-form-tags-list');
    const FILTER_TAG_TEMPLATE = document.querySelector('#template-filter-tag');
    article.tags.splice(article.tags.indexOf(event.target.textContent), 1);
    TAGS_LIST.innerHTML = '';
    if (article.tags.length > 0) {
      article.tags.forEach((tag) => {
        FILTER_TAG_TEMPLATE.content.querySelector('.filter-tags').textContent = tag;
        TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector('.tags-list-element').cloneNode(true));
      });
      document.querySelectorAll('.filter-tags').forEach((tag) => {
        tag.addEventListener('click', handleChosenTagClick);
      });
    }
  }

  function handleAddChangeArticleConfirmClick() {
    article.id = document.querySelector('.id-edit').textContent;
    article.author = document.querySelector('.author-edit').textContent;
    article.createdAt = article.createdAt || new Date();
    article.title = document.querySelector('#title-input').value;
    article.summary = document.querySelector('#summary-input').value;
    article.content = document.querySelector('#content-input').value;
    article.isHidden = false;

    if (articlesModule.getArticle(article.id)) {
      articlesModule.editArticle(article);
    } else {
      articlesModule.addArticle(article);
    }
    articlesModule.resetArticles();
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
  }

  return { renderEditPage };
}());

document.addEventListener('DOMContentLoaded', startApp());

function startApp() {
  renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
}

function renderArticles(skip, top, filter) {
  const articles = articlesModule.getArticles(skip, top, filter);

  newsPageRenderer.renderNewsPage(articles);
}

function changeCurrentUser(userName) {
  if (userName) {
    user = userName;
  } else {
    user = null;
  }
}

function renderHeader() {
  const NAVIGATION_BUTTONS = document.querySelector('.navigation-buttons');
  const MAIN_PAGE_BUTTON_TEMPLATE = document.querySelector('#template-main-page-button');
  const ADD_ARTICLE_TEMPLATE = document.querySelector('#template-add-article-button');
  const LOGIN_LOGOUT_BUTTON_TEMPLATE = document.querySelector('#template-login-logout-button');
  const USER_NAME = document.querySelector('.user-name');

  if (user == null) {
    USER_NAME.textContent = 'Гость';
    NAVIGATION_BUTTONS.innerHTML = '';
    NAVIGATION_BUTTONS.appendChild(MAIN_PAGE_BUTTON_TEMPLATE.content.querySelector('.navigation-button').cloneNode(true));
    NAVIGATION_BUTTONS.appendChild(LOGIN_LOGOUT_BUTTON_TEMPLATE.content.querySelector('.navigation-button').cloneNode(true));
  } else {
    USER_NAME.textContent = user;
    NAVIGATION_BUTTONS.innerHTML = '';
    NAVIGATION_BUTTONS.appendChild(MAIN_PAGE_BUTTON_TEMPLATE.content.querySelector('.navigation-button').cloneNode(true));
    NAVIGATION_BUTTONS.appendChild(ADD_ARTICLE_TEMPLATE.content.querySelector('.navigation-button').cloneNode(true));
    NAVIGATION_BUTTONS.appendChild(LOGIN_LOGOUT_BUTTON_TEMPLATE.content.querySelector('.navigation-button').cloneNode(true));
    NAVIGATION_BUTTONS.querySelector('.login-logout').textContent = 'Выйти';

    NAVIGATION_BUTTONS.querySelector('.add-article-button').addEventListener('click', handleAddArticleClick);
  }
  document.querySelector('.login-logout').addEventListener('click', handleLoginLogoutClick);
}

function handleArticleListButtonClick(event) {
  if (event.target.textContent === 'Подробнее') {
    articleFullViewRenderer.renderFullArticle(event.target.parentNode.parentNode.dataset.id);
  }
}

function handleMainButtonClick(event) {
  if (event.target.textContent === 'Главная') {
    const filters = getCurrentFilters();
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, filters);
  }
}

function getCurrentFilters() {
  return JSON.parse(sessionStorage.getItem('filters'), (key, value) => {
    if (key === 'dateFrom' || key === 'dateTo') {
      return new Date(value);
    }

    return value;
  });
}

function handleArticleEditButtonClick() {
  if (event.target.textContent === 'Редактировать') {
    editPageRenderer.renderEditPage(event.target.parentNode.parentNode.dataset.id);
  }
}

function handleArticleDeleteButtonClick() {
  if (event.target.textContent === 'Удалить') {
    articlesModule.hideArticle(event.target.parentNode.parentNode.dataset.id);
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
  }
}

function handlePaginatorClick(event) {
  if (event.target.textContent.includes('Далее')) {
    ARTICLES_INDEX_FROM += 10;
    ARTICLES_INDEX_TO += 10;
  }
  if (event.target.textContent.includes('Назад')) {
    ARTICLES_INDEX_FROM -= 10;
    ARTICLES_INDEX_TO -= 10;
  }
  renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
}

function handleLoginLogoutClick(event) {
  if (event.target.textContent === 'Выйти') {
    changeCurrentUser();
    sessionStorage.setItem('user', null);
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
  } else {
    authorizationPage.renderPage();
  }
}

function handleAddArticleClick() {
  editPageRenderer.renderEditPage();
}

let authorizationPage = (function () {
  const MAIN_BLOCK = document.querySelector('.main-block');
  const AUTHORIZATION_PAGE_TEMPLATE = document.querySelector('#template-authorization-page');
  const LOGIN_BUTTON_TEMPLATE = document.querySelector('#template-login-button');

  function renderPage() {
    MAIN_BLOCK.innerHTML = '';
    MAIN_BLOCK.appendChild(AUTHORIZATION_PAGE_TEMPLATE.content.querySelector('.authorization-input-section').cloneNode(true));
    MAIN_BLOCK.appendChild(LOGIN_BUTTON_TEMPLATE.content.querySelector('.login-button-section').cloneNode(true));
    document.querySelector('.login-button-section').addEventListener('click', handleLoginButtonClick);
  }

  function handleLoginButtonClick() {
    let users;

    loadUsers();

    function loadUsers() {
      const xhr = new XMLHttpRequest();

      function loadHandler() {
        users = JSON.parse(this.responseText);
        cleanUp();
      }

      function cleanUp() {
        xhr.removeEventListener('load', loadHandler);
      }

      xhr.addEventListener('load', loadHandler);
      xhr.open('GET', '/user', false);
      xhr.send();
    }
    const userFind = users.find(userInfo => userInfo.login === document.forms[0].elements[0].value);
    if (userFind !== undefined && userFind.password === document.forms[0].elements[1].value) {
      user = userFind.login;
      sessionStorage.setItem('user', JSON.stringify(user));
      renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
    } else {
      alert('Неверный логин или пароль!');
    }
  }

  return { renderPage };
}());
