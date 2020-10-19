import regeneratorRuntime from "regenerator-runtime";

/* service */
const apiUrl = 'https://frontend-test.innocode.digital/pages/aleksandrkutsenko83@gmail.com/comments';

export async function getComments(count = 5, page = 0) {
  let response = await fetch(`${apiUrl}?count=${count}&offset=${page * count}`);
  return await response.json();
}

export async function getComment(id) {
  let response = await fetch(`${apiUrl}/${id}`);
  return await response.json();
}

export async function addComment(content, parent = null) {
  let response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      content,
      parent
    })
  });
  return await response.json();
}

export async function editComment(id, content) {
  let response = await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      content
    })
  });
  return await response.json();
}
export async function deleteComment(id) {
  let response = await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
  });
  return response;
}
