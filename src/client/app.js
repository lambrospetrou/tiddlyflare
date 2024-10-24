// The response-targets extension unsets the error flag
// which we need for custom error handling in certain cases.
// https://github.com/bigskysoftware/htmx-extensions/blob/main/src/response-targets/README.md
htmx.config.responseTargetUnsetsError = false;

document.body.addEventListener('htmx:configRequest', function(evt) {
    const keyEl = document.querySelector("#t-api-key");
    evt.detail.headers["Tiddlyflare-Api-Key"] = keyEl ? keyEl.value : "";
});
