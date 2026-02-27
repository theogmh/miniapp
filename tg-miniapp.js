function postMessage(type, data) {
    const msg = JSON.stringify({
        eventType: type,
        eventData: data
    })
    window.parent.postMessage(msg)
}

(function() {
    const title = document.title
    window.addEventListener("message", function (event) {
       if (event.data === 'reload_miniapp') {
           window.location.reload()
       }
    })
    postMessage('app_title', {
        title
    })
})()
