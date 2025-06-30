const ws = new WebSocket("ws://" + location.host);

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  console.log("WS update", data);
};

document.getElementById("sendForm").onsubmit = async e => {
  e.preventDefault();
  const job = {
    code: document.getElementById("code").value,
    method: document.getElementById("method").value,
    targets: document.getElementById("targets").value.split(",").map(x => x.trim()),
    targetDomain: document.getElementById("domain").value
  };
  await fetch("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job)
  });
};
