const WEBDEV_LESSONS = [
  {
    id: 'first-page', icon: '📄', title: 'Your First HTML Page',
    summary: 'Every web page starts with the same skeleton: a doctype, an &lt;html&gt; root, a &lt;head&gt; for metadata, and a &lt;body&gt; for what people actually see.',
    starter: `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, world!</h1>
  <p>This is my very first web page.</p>
</body>
</html>`
  },
  {
    id: 'text-structure', icon: '📝', title: 'Text & Structure',
    summary: 'Headings (h1–h6) create hierarchy, &lt;p&gt; holds paragraphs, &lt;ul&gt;/&lt;li&gt; make lists, and &lt;a href&gt; links to anywhere on the web.',
    starter: `<!DOCTYPE html>
<html>
<body>
  <h1>My Favorite Things</h1>
  <h2>Hobbies</h2>
  <ul>
    <li>Reading</li>
    <li>Coding</li>
    <li>Music</li>
  </ul>
  <p>Learn more at <a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a>.</p>
</body>
</html>`
  },
  {
    id: 'box-model', icon: '📦', title: 'The Box Model', diagram: 'boxmodel',
    summary: 'Every HTML element is a box with four layers, from the inside out: content, padding, border, and margin. This one idea explains almost all CSS spacing.',
    starter: `<!DOCTYPE html>
<html>
<head>
<style>
  .box {
    width: 200px;
    padding: 20px;
    border: 6px solid #6366f1;
    margin: 30px;
    background: #eef2ff;
  }
</style>
</head>
<body>
  <div class="box">Try changing the padding, border, or margin values above and hit Run.</div>
</body>
</html>`
  },
  {
    id: 'flexbox', icon: '📐', title: 'Flexbox Layout', diagram: 'flexbox',
    summary: 'display:flex turns a container into a flexible row (or column). justify-content controls spacing along the main axis; align-items controls the cross axis.',
    starter: `<!DOCTYPE html>
<html>
<head>
<style>
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: #f3f4f6;
  }
  .card { background: #6366f1; color: white; padding: 20px; border-radius: 8px; }
</style>
</head>
<body>
  <div class="row">
    <div class="card">One</div>
    <div class="card">Two</div>
    <div class="card">Three</div>
  </div>
</body>
</html>`
  },
  {
    id: 'classes-ids', icon: '🎯', title: 'Classes & IDs',
    summary: 'Classes (.name) style groups of elements and can repeat; IDs (#name) are unique to one element. In CSS, IDs win over classes when both match.',
    starter: `<!DOCTYPE html>
<html>
<head>
<style>
  .highlight { background: yellow; }
  #special { color: crimson; font-weight: bold; }
</style>
</head>
<body>
  <p class="highlight">This paragraph is highlighted.</p>
  <p class="highlight" id="special">This one is highlighted AND special.</p>
</body>
</html>`
  },
  {
    id: 'js-basics', icon: '⚡', title: 'JavaScript: Variables & Functions',
    summary: 'let/const declare variables. Functions package up logic you can reuse. document.write() is just for this demo — real pages use the DOM instead (next lesson).',
    starter: `<!DOCTYPE html>
<html>
<body>
<script>
  const name = "learner";
  let count = 3;

  function greet(person) {
    return "Hello, " + person + "!";
  }

  document.write("<h2>" + greet(name) + "</h2>");
  document.write("<p>You have " + count + " new messages.</p>");
</script>
</body>
</html>`
  },
  {
    id: 'dom-events', icon: '🖱️', title: 'Making It Interactive',
    summary: 'The DOM lets JavaScript read and change the page after it loads. addEventListener() runs your code in response to clicks, typing, and more.',
    starter: `<!DOCTYPE html>
<html>
<head>
<style>
  button { font-size: 16px; padding: 10px 18px; cursor: pointer; }
  #output { margin-top: 16px; font-size: 20px; }
</style>
</head>
<body>
  <button id="btn">Click me</button>
  <div id="output">Clicks: 0</div>
  <script>
    let clicks = 0;
    document.getElementById('btn').addEventListener('click', function () {
      clicks++;
      document.getElementById('output').textContent = 'Clicks: ' + clicks;
    });
  </script>
</body>
</html>`
  },
  {
    id: 'responsive-deploy', icon: '📱', title: 'Responsive Design & Going Live',
    summary: '@media queries change styles based on screen width, so one page works on phones and desktops. When you’re ready to publish, free static hosts like Netlify or GitHub Pages put a real site online in minutes — no server needed for plain HTML/CSS/JS.',
    starter: `<!DOCTYPE html>
<html>
<head>
<style>
  .grid { display: flex; flex-wrap: wrap; gap: 12px; }
  .tile { background: #6366f1; color: white; padding: 24px; border-radius: 8px; flex: 1 1 200px; }
  @media (max-width: 420px) {
    .tile { background: #f43f5e; }
  }
</style>
</head>
<body>
  <p>Shrink the preview panel (or view on a phone) — the tiles change color under 420px width.</p>
  <div class="grid">
    <div class="tile">Tile A</div>
    <div class="tile">Tile B</div>
    <div class="tile">Tile C</div>
  </div>
</body>
</html>`
  },
];
