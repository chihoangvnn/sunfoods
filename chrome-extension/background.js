chrome.runtime.onInstalled.addListener(() => {
  console.log('Cookie Manager Pro installed!');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies') {
    chrome.cookies.getAll({ domain: request.domain }, (cookies) => {
      sendResponse({ cookies });
    });
    return true;
  }
});
