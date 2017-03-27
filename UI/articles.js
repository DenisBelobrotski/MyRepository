let user = JSON.parse(sessionStorage.getItem("user"));
let ARTICLES_INDEX_FROM = 0;
let ARTICLES_INDEX_TO = 10;

let testArticle1 = {
    id: "21",
    title: "aaaaaaaaaaaaaaaaaaaaaa",
    summary: "aaaaa",
    createdAt: new Date(),
    author: "ddddddddd",
    tags: ["космос", "тенденции", "технологии"],
    content: "ggggggggggggggggggggggggggggggggggggggggggggggggggggg"
};
let testArticle2 = {
    summary: "bbbbbbbbb",
    tags: ["mwc", "sony"]
};
let testArticle3 = {
    id: "24",
    title: "ggggggggggggg",
    summary: "bbnbnbnbnbnbnbnbnbnbn",
    createdAt: new Date(),
    author: "BagRaiders",
    tags: ["ShootingStars", "ROFL", "AZAZA"],
    content: "ololololololololololo"
};
let testFilter1 = {
    author: "DenisBelobrotski"
};
let testFilter2 = {
    dateFrom: new Date(2017, 2, 2),
    dateTo: new Date(2017, 2, 6),
    author: "DenisBelobrotski",
    tags: ["космос"]
};
let testFilter3 = {
    tags: ["lenovo"]
};
let testFilter4 = {
    author: "DenisBelobrotski",
    dateFrom: new Date(2017, 0),
    dateTo: new Date(2017, 3),
    tags: ["медицина"]
};
let testFilter5 = {
    author: "MrCrabs"
};


let users = [
    {
        login: "DenisBelobrotski",
        password: "1111"
    },
    {
        login: "DenisBelobrotskiy",
        password: "2222"
    }
];

localStorage.setItem("users", JSON.stringify(users));

let articlesModule = (function () {
    let articles = JSON.parse(localStorage.getItem("articles"), function (key, value) {
        if (key == "createdAt") {
            return new Date(value);
        }
        return value;
    });

    let tags = JSON.parse(localStorage.getItem("tags"));

    function getArticles(skip, top, filterConfig) {
        let resultArticles = articles;
        const from = skip || 0;
        const amount = top || 10;
        if (filterConfig != undefined) {
            if (filterConfig.dateFrom != undefined) {
                resultArticles = resultArticles.filter(function (currentElement) {
                    return currentElement.createdAt.getTime() >= filterConfig.dateFrom.getTime();
                })
            }
            if (filterConfig.dateTo != undefined) {
                resultArticles = resultArticles.filter(function (currentElement) {
                    return currentElement.createdAt.getTime() <= filterConfig.dateTo.getTime();
                })
            }
            if (filterConfig.author != undefined && filterConfig.author != "") {
                resultArticles = resultArticles.filter(function (currentElement) {
                    return currentElement.author == filterConfig.author;
                })
            }
            if (filterConfig.tags != undefined && filterConfig.tags.length != 0) {
                resultArticles = resultArticles.filter(function (currentElement) {
                    return filterConfig.tags.every(function (tag) {
                        return currentElement.tags.indexOf(tag) >= 0;
                    })
                })
            }
        }
        resultArticles.sort(function (firstArticle, secondArticle) {
            return secondArticle.createdAt.getTime() - firstArticle.createdAt.getTime();
        });
        articles = resultArticles;
        return resultArticles.slice(from, from + amount);
    }

    function getArticle(findId) {
        return articles.filter(function (currentElement) {
            return currentElement.id == findId;
        })[0];
    }

    function validateAddArticle(article) {
        if (!article.id || (typeof(article.id) != "string")) {
            return false;
        } else if (article.title == undefined || (typeof(article.title) != "string" || article.title.length == 0 ||
            article.title.length > 100)) {
            return false;
        } else if (article.summary == undefined || (typeof(article.summary) != "string" || article.summary.length == 0 ||
            article.summary.length > 200)) {
            return false;
        } else if (article.createdAt == undefined || !(article.createdAt instanceof Date)) {
            return false;
        } else if (article.author == undefined || (typeof(article.author) != "string" || article.author.length == 0)) {
            return false;
        } else if (article.content == undefined || (typeof(article.content) != "string" || article.content.length == 0)) {
            return false;
        } else if (article.tags == undefined || (!(article.tags instanceof Array) || article.tags.length == 0 ||
            article.tags.length > 5)) {
            return false;
        } else {
            return !(article.tags == undefined || (!article.tags.every(function (tag) {
                return tags.indexOf(tag) >= 0;
            }) || !article.tags.every(function (tag) {
                return typeof (tag) == "string";
            })));
        }
    }

    function validateEditArticle(article) {
        if (article.id != undefined && (typeof(article.id) != "string" || article.id.length == 0)) {
            return false;
        } else if (article.title != undefined && (typeof(article.title) != "string" || article.title.length == 0 ||
            article.title.length > 100)) {
            return false;
        } else if (article.summary != undefined && (typeof(article.summary) != "string" || article.summary.length == 0 ||
            article.summary.length > 200)) {
            return false;
        } else if (article.createdAt != undefined && !(article.createdAt instanceof Date)) {
            return false;
        } else if (article.author != undefined && (typeof(article.author) != "string" || article.author.length == 0)) {
            return false;
        } else if (article.content != undefined && (typeof(article.content) != "string" || article.content.length == 0)) {
            return false;
        } else if (article.tags != undefined && (!(article.tags instanceof Array) || article.tags.length == 0 ||
            article.tags.length > 5)) {
            return false;
        } else if (article.tags != undefined && (!article.tags.every(function (tag) {
                return tags.indexOf(tag) >= 0;
            }) || !article.tags.every(function (tag) {
                return typeof (tag) == "string";
            }))) {
            return false;
        } else {
            return true;
        }
    }

    function addArticle(article) {
        resetArticles();
        const prevSize = articles.length;
        if (!validateAddArticle(article)) {
            return false;
        } else {
            return prevSize != articles.push(article);
        }
    }

    function editArticle(editId, newArticle) {
        resetArticles();
        const editIndex = articles.indexOf(getArticle(editId));
        if (!validateEditArticle(newArticle) || editIndex < 0) {
            return false;
        }
        if (newArticle.title != undefined) {
            articles[editIndex].title = newArticle.title;
        }
        if (newArticle.summary != undefined) {
            articles[editIndex].summary = newArticle.summary;
        }
        if (newArticle.tags != undefined) {
            articles[editIndex].tags = newArticle.tags;
        }
        if (newArticle.content != undefined) {
            articles[editIndex].content = newArticle.content;
        }
        return true;
    }

    function removeArticle(removeId) {
        resetArticles();
        const removeIndex = articles.indexOf(getArticle(removeId));
        if (removeIndex != -1) {
            articles.splice(removeIndex, 1);
            return true;
        } else {
            return false;
        }
    }

    function numberOfArticles() {
        return articles.length;
    }

    function formatArticleDate(date) {
        return ((date.getDate() > 9) ? date.getDate() : ("0" + date.getDate())) + "." +
            ((date.getMonth() + 1 > 9) ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1)) + "." +
            date.getFullYear() + " " + ((date.getHours() > 9) ? date.getHours() : ("0" + date.getHours())) + ":" +
            ((date.getMinutes() > 9) ? date.getMinutes() : ("0" + date.getMinutes()));
    }

    function resetArticles() {
        ARTICLES_INDEX_FROM = 0;
        ARTICLES_INDEX_TO = 10;
        articles = JSON.parse(localStorage.getItem("articles"), function (key, value) {
            if (key == 'createdAt') {
                return new Date(value);
            }
            return value;
        });
        sessionStorage.removeItem("filters");
    }

    return {
        getArticles: getArticles,
        getArticle: getArticle,
        validateAddArticle: validateAddArticle,
        validateEditArticle: validateEditArticle,
        addArticle: addArticle,
        editArticle: editArticle,
        removeArticle: removeArticle,
        numberOfArticles: numberOfArticles,
        formatArticleDate: formatArticleDate,
        resetArticles: resetArticles
    };
}());

let newsPageRenderer = (function () {
    const MAIN_BLOCK = document.querySelector(".main-block");
    let CONTENT;
    const ARTICLE_TEMPLATE = document.querySelector("#template-article");
    const TAGS_LIST_NODE = ARTICLE_TEMPLATE.content.querySelector(".article-tags");
    const ARTICLE_TAGS_TEMPLATE = document.querySelector("#template-article-tags");

    const FILTER_TAG_TEMPLATE = document.querySelector("#template-filter-tag");
    const FILTERS_TEMPLATE = document.querySelector("#template-filters");

    const PAGINATOR_TEMPLATE = document.querySelector("#template-paginator");
    const NEXT_BUTTON_TEMPLATE = document.querySelector("#template-pagination-next-button");
    const PREV_BUTTON_TEMPLATE = document.querySelector("#template-pagination-prev-button");
    let PAGINATOR;

    function renderNewsPage(articles) {
        MAIN_BLOCK.innerHTML = "";
        MAIN_BLOCK.innerHTML = "<div class=\"content\"></div>\n";
        CONTENT = document.querySelector(".content");
        let articlesNodes = getRenderArticles(articles);
        articlesNodes.forEach(function (node) {
            CONTENT.appendChild(node);
        });

        CONTENT.addEventListener("click", handleArticleListButtonClick);
        document.addEventListener("click", handleMainButtonClick);

        MAIN_BLOCK.appendChild(renderFiltersBar());

        MAIN_BLOCK.appendChild(PAGINATOR_TEMPLATE.content.querySelector(".paginator").cloneNode(true));
        PAGINATOR = document.querySelector(".paginator");
        if (articlesModule.numberOfArticles() > ARTICLES_INDEX_TO) {
            PAGINATOR.appendChild(NEXT_BUTTON_TEMPLATE.content.querySelector(".pagination-next-button").cloneNode(true));
        }
        if (ARTICLES_INDEX_FROM > 0) {
            PAGINATOR.appendChild(PREV_BUTTON_TEMPLATE.content.querySelector(".pagination-prev-button").cloneNode(true));
        }
        PAGINATOR.addEventListener("click", handlePaginatorClick);

        document.querySelector(".add-tag-small-button").addEventListener("click", handleAddTagButtonClick);
        document.querySelector(".confirm-small-button").addEventListener("click", handleConfirmFilterButtonClick);
        document.querySelector(".reset-small-button").addEventListener("click", handleResetFilterButtonClick);
        document.querySelectorAll(".filter-tags").forEach(function (tag) {
            tag.addEventListener("click", handleChosenTagClick);
        });
    }

    function renderFiltersBar() {
        const AUTHORS_DATALIST = FILTERS_TEMPLATE.content.querySelector("#authors");
        const TAGS_DATALIST = FILTERS_TEMPLATE.content.querySelector("#tags");
        const TAGS_LIST = FILTERS_TEMPLATE.content.querySelector(".tags-list");
        const FILTER_TAG_TEMPLATE = document.querySelector("#template-filter-tag");
        const OPTION_TEMPLATE = document.querySelector("#template-option");
        let filters = getCurrentFilters();
        let tags = JSON.parse(localStorage.getItem("tags"));
        let authors = JSON.parse(localStorage.getItem("users")).map(function (user) {
            return user.login;
        });
        AUTHORS_DATALIST.innerHTML = "";
        TAGS_DATALIST.innerHTML = "";
        TAGS_LIST.innerHTML = "";
        if (filters != undefined && filters != null) {
            FILTERS_TEMPLATE.content.querySelector(".date-from").value =
                (filters.dateFrom != undefined && filters.dateFrom != null) ? formatFilterDate(filters.dateFrom) : "";
            FILTERS_TEMPLATE.content.querySelector(".date-to").value =
                (filters.dateTo != undefined && filters.dateTo != null) ? formatFilterDate(filters.dateTo) : "";
            FILTERS_TEMPLATE.content.querySelector(".author-input").value = (filters.author != undefined) ? filters.author : "";
            if (filters.tags != undefined) {
                filters.tags.forEach(function (tag) {
                    FILTER_TAG_TEMPLATE.content.querySelector(".filter-tags").textContent = tag;
                    TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector(".tags-list-element").cloneNode(true));
                });
            }
        } else {
            FILTERS_TEMPLATE.content.querySelector(".date-from").value = "";
            FILTERS_TEMPLATE.content.querySelector(".date-to").value = "";
            FILTERS_TEMPLATE.content.querySelector(".author-input").value = "";
            FILTERS_TEMPLATE.content.querySelector(".tags-input").value = "";
        }
        if (authors != undefined) {
            authors.forEach(function (author) {
                OPTION_TEMPLATE.content.querySelector(".option").value = author;
                AUTHORS_DATALIST.appendChild(OPTION_TEMPLATE.content.querySelector(".option").cloneNode(true));
            });
        }
        if (tags != undefined) {
            tags.forEach(function (tag) {
                OPTION_TEMPLATE.content.querySelector(".option").value = tag;
                TAGS_DATALIST.appendChild(OPTION_TEMPLATE.content.querySelector(".option").cloneNode(true));
            });
        }
        return FILTERS_TEMPLATE.content.querySelector(".filters-block").cloneNode(true);
    }

    function getRenderArticles(articles) {
        return articles.map(renderArticle);
    }

    function renderArticle(article) {
        ARTICLE_TEMPLATE.content.querySelector(".article-item").dataset.id = article.id;
        ARTICLE_TEMPLATE.content.querySelector(".article-title").textContent = article.title;
        ARTICLE_TEMPLATE.content.querySelector(".article-author").textContent = article.author;
        ARTICLE_TEMPLATE.content.querySelector(".article-date").textContent = articlesModule.formatArticleDate(article.createdAt);
        ARTICLE_TEMPLATE.content.querySelector(".article-content-container").innerHTML = "";
        ARTICLE_TEMPLATE.content.querySelector(".article-summary-container").innerHTML = "";
        ARTICLE_TEMPLATE.content.querySelector(".article-summary-container").innerHTML = "<p class=\"article-summary\"></p>";
        ARTICLE_TEMPLATE.content.querySelector(".article-summary").textContent = article.summary;

        const ARTICLE_BUTTONS = ARTICLE_TEMPLATE.content.querySelector(".article-buttons");
        const TEMPLATE_FULL_VIEW_BUTTON = document.querySelector("#template-full-view-button");
        ARTICLE_BUTTONS.innerHTML = "";
        ARTICLE_BUTTONS.appendChild(TEMPLATE_FULL_VIEW_BUTTON.content.querySelector(".button").cloneNode(true));

        let tagsNodes = renderTags(article.tags);
        tagsNodes.forEach(function (node) {
            TAGS_LIST_NODE.appendChild(node);
        });

        return ARTICLE_TEMPLATE.content.querySelector(".article-item").cloneNode(true);
    }

    function renderTags(tags) {
        TAGS_LIST_NODE.innerHTML = "";
        return tags.map(function (tag) {
            return renderTag(tag);
        });
    }

    function renderTag(tag) {
        const template = ARTICLE_TAGS_TEMPLATE;
        template.content.querySelector(".tags").textContent = tag;

        return template.content.querySelector(".tags").cloneNode(true);
    }

    function formatFilterDate(date) {
        return date.getFullYear() + "-" + ((date.getMonth() + 1 > 9) ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
            "-" + ((date.getDate() > 9) ? date.getDate() : "0" + date.getDate());
    }

    function handleAddTagButtonClick() {
        const TAGS_LIST = document.querySelector(".tags-list");
        const FILTER_TAG_TEMPLATE = document.querySelector("#template-filter-tag");
        let filters = getCurrentFilters() || {};
        let tags = JSON.parse(localStorage.getItem("tags"));
        filters.tags = filters.tags || [];
        let tag = document.forms.filters.elements.tagsInput.value;
        if (filters.tags.length < 5 && tags.indexOf(tag) != -1 && filters.tags.indexOf(tag) == -1) {
            filters.tags.push(tag);
            sessionStorage.setItem("filters", JSON.stringify(filters));
            document.forms.filters.elements.tagsInput.value = "";
            TAGS_LIST.innerHTML = "";
            filters.tags.forEach(function (tag) {
                FILTER_TAG_TEMPLATE.content.querySelector(".filter-tags").textContent = tag;
                TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector(".tags-list-element").cloneNode(true));
            });
            document.querySelectorAll(".filter-tags").forEach(function (tag) {
                tag.addEventListener("click", handleChosenTagClick);
            });
        } else {
            alert("Невозможно добавить тег!");
        }
    }

    function handleConfirmFilterButtonClick() {
        let filters = getCurrentFilters() || {};
        let tempDate;
        filters.author = document.forms.filters.elements.authorInput.value;
        tempDate = document.forms.filters.elements.dateFromInput.value;
        filters.dateFrom = (tempDate != "") ? new Date(tempDate) : undefined;
        tempDate = document.forms.filters.elements.dateToInput.value;
        filters.dateTo = (tempDate != "") ? new Date(tempDate) : undefined;
        sessionStorage.setItem("filters", JSON.stringify(filters));
        ARTICLES_INDEX_FROM = 0;
        ARTICLES_INDEX_TO = 10;
        renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
    }

    function handleChosenTagClick(event) {
        const TAGS_LIST = document.querySelector(".tags-list");
        const FILTER_TAG_TEMPLATE = document.querySelector("#template-filter-tag");
        let filters = getCurrentFilters();
        filters.tags.splice(filters.tags.indexOf(event.target.textContent), 1);
        sessionStorage.setItem("filters", JSON.stringify(filters));
        TAGS_LIST.innerHTML = "";
        if (filters.tags.length > 0) {
            filters.tags.forEach(function (tag) {
                FILTER_TAG_TEMPLATE.content.querySelector(".filter-tags").textContent = tag;
                TAGS_LIST.appendChild(FILTER_TAG_TEMPLATE.content.querySelector(".tags-list-element").cloneNode(true));
            });
            document.querySelectorAll(".filter-tags").forEach(function (tag) {
                tag.addEventListener("click", handleChosenTagClick);
            });
        }
    }

    function handleResetFilterButtonClick() {
        ARTICLES_INDEX_FROM = 0;
        ARTICLES_INDEX_TO = 10;
        sessionStorage.removeItem("filters");
        articlesModule.resetArticles();
        renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
    }


    return {
        renderNewsPage: renderNewsPage,
    };
}());

let articleFullViewRenderer = (function () {
    const MAIN_BLOCK = document.querySelector(".main-block");
    const ARTICLE_TEMPLATE = document.querySelector("#template-article");
    const TAGS_LIST_NODE = ARTICLE_TEMPLATE.content.querySelector(".article-tags");
    const ARTICLE_TAGS_TEMPLATE = document.querySelector("#template-article-tags");


    function renderFullArticle(id) {
        MAIN_BLOCK.innerHTML = "";
        let article = createArticle(id);
        MAIN_BLOCK.innerHTML = "<div class=\"full-article\"></div>\n";
        const CONTENT = document.querySelector(".full-article");
        CONTENT.appendChild(article);
        // document.querySelector(".edit-button").addEventListener("click", handleArticleEditButtonClick);
        // document.querySelector(".delete-button").addEventListener("click", handleArticleDeleteButtonClick);
    }

    function createArticle(id) {
        let article = articlesModule.getArticle(id);
        ARTICLE_TEMPLATE.content.querySelector(".article-item").dataset.id = article.id;
        ARTICLE_TEMPLATE.content.querySelector(".article-title").textContent = article.title;
        ARTICLE_TEMPLATE.content.querySelector(".article-summary-container").innerHTML = "";
        ARTICLE_TEMPLATE.content.querySelector(".article-author").textContent = article.author;
        ARTICLE_TEMPLATE.content.querySelector(".article-date").textContent = articlesModule.formatArticleDate(article.createdAt);
        ARTICLE_TEMPLATE.content.querySelector(".article-content-container").innerHTML = "";
        ARTICLE_TEMPLATE.content.querySelector(".article-content-container").innerHTML = "<p class=\"article-content\"></p>";
        ARTICLE_TEMPLATE.content.querySelector(".article-content").textContent = article.content;

        const ARTICLE_BUTTONS = ARTICLE_TEMPLATE.content.querySelector(".article-buttons");
        const TEMPLATE_EDIT_BUTTON = document.querySelector("#template-edit-button");
        const TEMPLATE_DELETE_BUTTON = document.querySelector("#template-delete-button");

        let tagsNodes = renderTags(article.tags);
        tagsNodes.forEach(function (node) {
            TAGS_LIST_NODE.appendChild(node);
        });

        ARTICLE_BUTTONS.innerHTML = "";
        if (user != null) {
            ARTICLE_BUTTONS.appendChild(TEMPLATE_EDIT_BUTTON.content.querySelector(".edit-button").cloneNode(true));
            ARTICLE_BUTTONS.appendChild(TEMPLATE_DELETE_BUTTON.content.querySelector(".delete-button").cloneNode(true));
        }

        return ARTICLE_TEMPLATE.content.querySelector(".article-item").cloneNode(true);
    }

    function renderTags(tags) {
        TAGS_LIST_NODE.innerHTML = "";
        return tags.map(function (tag) {
            return renderTag(tag);
        });
    }

    function renderTag(tag) {
        const template = ARTICLE_TAGS_TEMPLATE;
        template.content.querySelector(".tags").textContent = tag;

        return template.content.querySelector(".tags").cloneNode(true);
    }

    // function handleArticleEditButtonClick() {
    //     editPage.renderEditPage(document.querySelector(".article-item").dataset.id);
    // }
    //
    // function handleArticleDeleteButtonClick() {
    //     articlesService.hideArticle(document.querySelector(".article-item").dataset.id);
    //     appendArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO);
    // }

    return {
        renderFullArticle: renderFullArticle
    }
}());

document.addEventListener("DOMContentLoaded", startApp());

function startApp() {
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
}

function renderArticles(skip, top, filter) {
    let articles = articlesModule.getArticles(skip, top, filter);

    newsPageRenderer.renderNewsPage(articles);
}

function addArticle(article) {
    articlesModule.addArticle(article);
    renderArticles(0, 25);
}

function removeArticle(removeID) {
    articlesModule.removeArticle(removeID);
    renderArticles(0, 25);
}

function editArticle(editID, newArticle) {
    articlesModule.editArticle(editID, newArticle);
    renderArticles(0, 25);
}

function changeCurrentUser(userName) {
    if (userName != undefined) {
        user = userName;
    } else {
        user = null;
    }
}

function renderHeader() {
    const NAVIGATION_BUTTONS = document.querySelector(".navigation-buttons");
    const ADD_ARTICLE_TEMPLATE = document.querySelector("#template-add-article-button");
    const USER_NAME = document.querySelector(".user-name");

    if (user == null) {
        USER_NAME.textContent = "Гость";
        NAVIGATION_BUTTONS.querySelector(".login-logout").textContent = "Войти";
    } else {
        USER_NAME.textContent = user;
        NAVIGATION_BUTTONS.querySelector(".login-logout").textContent = "Выйти";
        NAVIGATION_BUTTONS.appendChild(ADD_ARTICLE_TEMPLATE.content.querySelector(".add-article-button").cloneNode(true));
    }
}

function handleArticleListButtonClick(event) {
    if (event.target.textContent == "Подробнее") {
        articleFullViewRenderer.renderFullArticle(event.target.parentNode.parentNode.dataset.id);
    }
}

function handleMainButtonClick(event) {
    if (event.target.textContent == "Главная") {
        let filters = getCurrentFilters();
        renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, filters);
    }
}

function getCurrentFilters() {
    return JSON.parse(sessionStorage.getItem("filters"), function (key, value) {
        if (key == "dateFrom" || key == "dateTo") {
            return new Date(value);
        }
        return value;
    });
}

function handlePaginatorClick(event) {
    if (event.target.textContent.includes("Далее")) {
        ARTICLES_INDEX_FROM += 10;
        ARTICLES_INDEX_TO += 10;
    }
    if (event.target.textContent.includes("Назад")) {
        ARTICLES_INDEX_FROM -= 10;
        ARTICLES_INDEX_TO -= 10;
    }
    renderArticles(ARTICLES_INDEX_FROM, ARTICLES_INDEX_TO, getCurrentFilters());
}