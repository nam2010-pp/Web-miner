let socket;
let log = msg => {
  const logBox = document.getElementById('log');
  logBox.innerHTML = msg + '<br>' + logBox.innerHTML;
};
document.getElementById('start').onclick = () => {
  const username = document.getElementById('username').value.trim();
  const key = document.getElementById('key').value.trim();
  if (!username || !key) return alert("Nhập username và key trước.");

  socket = new WebSocket("ws://" + location.hostname + ":3000");
  socket.onopen = () => {
    log("🟢 Đã kết nối đến proxy...");
    socket.send(JSON.stringify({ type: "init", username, key }));
  };
  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.type === "job") {
      const { prev, target, diff } = data;
      log("🧠 Nhận job mới...");
      for (let nonce = 0; nonce < diff * 100; nonce++) {
        const hash = sha1(prev + nonce);
        if (hash === target) {
          socket.send(JSON.stringify({ type: "submit", nonce }));
          log("✅ Found nonce: " + nonce);
          break;
        }
        if (nonce % 5000 === 0) log("⛏ Nonce: " + nonce);
      }
    }
  };
};

function sha1(msg) {
  function rotl(n,s) { return n<<s|n>>>32-s; }
  function tohex(i) { for(var h="",s=28;s>=0;s-=4) h += (i>>>s&0xf).toString(16); return h; }
  var H0=0x67452301,H1=0xEFCDAB89,H2=0x98BADCFE,H3=0x10325476,H4=0xC3D2E1F0;
  var ml = msg.length * 8;
  var words = [];
  for (var i=0;i<msg.length;i++) {
    words[i>>2] |= msg.charCodeAt(i) << (24 - (i%4)*8);
  }
  words[ml>>5] |= 0x80 << (24 - ml%32);
  words[((ml+64>>9)<<4)+15] = ml;
  for (var i=0;i<words.length;i+=16) {
    var w = words.slice(i,i+16);
    for (var j=16;j<80;j++) w[j] = rotl(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);
    var a=H0,b=H1,c=H2,d=H3,e=H4;
    for (var j=0;j<80;j++) {
      var f,jk;
      if (j<20) f=(b&c|~b&d),jk=0x5A827999;
      else if (j<40) f=b^c^d,jk=0x6ED9EBA1;
      else if (j<60) f=(b&c|b&d|c&d),jk=0x8F1BBCDC;
      else f=b^c^d,jk=0xCA62C1D6;
      var temp=rotl(a,5)+f+e+jk+w[j]|0;
      e=d;d=c;c=rotl(b,30);b=a;a=temp;
    }
    H0=H0+a|0;H1=H1+b|0;H2=H2+c|0;H3=H3+d|0;H4=H4+e|0;
  }
  return tohex(H0)+tohex(H1)+tohex(H2)+tohex(H3)+tohex(H4);
}
