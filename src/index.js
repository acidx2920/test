import './styles/main.sass';
import * as service from './service';
import * as utility from './utility'

const perPage = 5;
let currentPage = 0;
let isPageLoading = false;
let isMoreToLoad = true;

/* handlers */
/*   button handlers */
function editButtonHandler(event) {
  const parent = event.target.closest('li');
  if(!parent.querySelector('.edit-comment')) {
    const formBlock = buildFormBlock(parent.dataset.id, 'edit');
    formBlock.querySelector('textarea').value = parent.querySelector('.comment-text').textContent;
    parent.classList.add('edited');
    parent.prepend(formBlock);
    formBlock.querySelector('form').addEventListener('submit', submitEditHandler);
  }
}
function replyButtonHandler(event) {
  const parent = event.target.closest('li');
  if (!parent.querySelector('.reply-comment')) {
    const formBlock = buildFormBlock(parent.dataset.id, 'reply');
    parent.querySelector('.comments-item-btns').style.visibility = 'hidden'
    event.target.closest('.comments-item-main').append(formBlock);
    formBlock.querySelector('form').addEventListener('submit', submitReplyHandler);
  }
}
function deleteButtonHandler(event) {
  const commentId = event.target.closest('li').dataset.id;
  service.deleteComment(commentId).then(response => {
    loadComments(currentPage + 1);
  });
}
function cancelButtonHandler(event) {
  const parent = event.target.closest('li');
  const formBlock = event.target.closest('.new-comment');
  formBlock.remove();
  if (formBlock.classList.contains('edit-comment')) {
    parent.classList.remove('edited');
  } else {
    parent.querySelector('.comments-item-btns').style.visibility = 'visible'
  }
}
/*   form handlers */
function submitNewHandler(event) {
  event.preventDefault();
  const form = event.target;
  service.addComment(form.content.value).then(response => {
    form.reset();
    loadComments(currentPage + 1);
  });
}
function submitReplyHandler(event) {
  event.preventDefault();
  const form = event.target;
  service.addComment(form.content.value, form.dataset.parent).then(response => {
    loadComments(currentPage + 1);
  });
}
function submitEditHandler(event) {
  event.preventDefault();
  const comment = this.closest('li');
  const formBlock = this.closest('.new-comment');
  service.editComment(this.dataset.parent, this.content.value).then(response => {
    comment.querySelector('.comment-text').textContent = response.content;
    formBlock.remove();
    comment.classList.remove('edited');
  });
}

function scrollHandler() {
  const commentsList = document.querySelector('.comments-list');
  const scrollBottom = window.pageYOffset + document.documentElement.clientHeight;
  const bottomOffset = 100;
  if((scrollBottom >= commentsList.offsetTop + commentsList.offsetHeight + bottomOffset)
      && !isPageLoading
      && isMoreToLoad) {
    addCommentsPage(currentPage + 1);
  }
}

function loadComments(pages = 1) {
  service.getComments(pages * perPage).then(data => {
    document.querySelector('.comments > .comments-list').remove();
    const commentList = buildCommentList(data);
    document.querySelector('.comments').append(commentList);
  });
}
function addCommentsPage(page) {
  isPageLoading = true;
  service.getComments(perPage, page).then(data => {
    if(data.length) {
      const commentList = document.querySelector('.comments > .comments-list');
      for (let item of data) {
        commentList.append(buildCommentItem(item));
      }
      currentPage++;
    } else {
      isMoreToLoad = false;
    }
    isPageLoading = false;
  });
}

/* builder functions */
function buildFormBlock(parent, type = 'reply') {
  const placeholder = (type === 'edit') ? 'Enter your comment' : 'Reply to comment';
  const formBlockClass = (type === 'edit') ? 'edit-comment' : 'reply-comment';
  const formBlock = utility.buildElement('div', null, 'new-comment ' + formBlockClass);
  formBlock.innerHTML = `<img src="http://api.randomuser.me/portraits/men/69.jpg" class="comment-avatar" width="80" height="80" alt="Kurt Thompson avatar">
      <form action="" method="post" class="comment-form answer-comment-form" data-parent="${parent}">
        <label for="new-comment-text-${parent}" class="visually-hidden">${placeholder}</label>
        <textarea name="content" id="answer-comment-text-${parent}" placeholder="${placeholder}"></textarea>
        <div class="form-btns">
          <button type="button" class="comment-btn cancel-btn">Cancel</button>
          <button type="submit">Send</button>
        </div>
      </form>`;
  formBlock.querySelector('.cancel-btn').addEventListener('click', cancelButtonHandler);

  return formBlock;
}

function buildCommentItem(comment, isNested = false) {
  const commentTime = utility.convertTime(comment.created_at);
  const commentItem = utility.buildElement('li', null, 'comments-item');
  const commentAvatar = comment.author.avatar.replace('/thumb/', '/');
  commentItem.dataset.id = comment.id;
  commentItem.innerHTML = `<div class="comment-wrapper">
    <img src="${commentAvatar}" class="comment-avatar" width="80" height="80" alt="${comment.author.name} avatar">
    <div class="comments-item-main">
      <div class="comments-item-top">
        <p class="comment-author">${comment.author.name}</p>
        <time datetime="${commentTime.datetime}">${commentTime.formatted}</time>
      </div>
      <p class="comment-text">${comment.content}</p>
    </div>
  </div>`;

  if (comment.children && comment.children.length) {
    const nestedList = buildCommentList(comment.children, true);
    commentItem.append(nestedList);
  }

  if (!isNested) {
    commentItem.querySelector('.comment-text').insertAdjacentHTML('afterend', `<div class="comments-item-btns">
          <button class="comment-btn reply-btn">Reply</button>
        </div>`);
    const replyButton = commentItem.querySelector('.reply-btn');
    replyButton.addEventListener('click', replyButtonHandler);
    if (comment.author.id === 1) {
      replyButton.insertAdjacentHTML('afterend', `<button class="comment-btn edit-btn">Edit</button><button class="comment-btn delete-btn">Delete</button>`);
      const editButton = commentItem.querySelector('.edit-btn');
      const deleteButton = commentItem.querySelector('.delete-btn');
      editButton.addEventListener('click', editButtonHandler);
      deleteButton.addEventListener('click', deleteButtonHandler);
    }
  }

  return commentItem;
}

function buildCommentList(comments, isNested = false) {
  const commentList = utility.buildElement('ul', null, 'comments-list');

  for(const comment of comments) {
    commentList.append(buildCommentItem(comment, isNested));
  }

  return commentList;
}

document.addEventListener("DOMContentLoaded", () => {
  loadComments();
  document.querySelector('.new-comment-form').addEventListener('submit', submitNewHandler);
  window.addEventListener('scroll', scrollHandler);
});