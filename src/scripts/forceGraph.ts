/**
 * A small force-directed graph, drawn in SVG with no dependencies.
 *
 * Used by the knowledge map on the posts index (KnowledgeMap.astro) and by the
 * per-post neighbourhood graph (PostGraph.astro). The caller supplies nodes and
 * links; this module lays them out, draws them, and handles dragging, hover
 * tracing and resizing. Its styles live in global.css (".fg-*").
 *
 * Every node is an SVG <a>, so it is focusable and works as a plain link unless
 * the caller attaches its own click behaviour through `onNode`.
 */

const NS = "http://www.w3.org/2000/svg";

export type NodeKind = "cat" | "post" | "tag";

export interface NodeSpec {
  id: string;
  kind: NodeKind;
  /** Text drawn under the node (already shortened if need be). */
  label: string;
  /** Full text, shown as the native tooltip. */
  full: string;
  href: string;
  /** Accent colour (a CSS value); threads owned by this node use it too. */
  color?: string;
  /** Drawn radius. */
  r: number;
  /** Collision radius: how much room the node and its label claim. */
  cr: number;
  /** Hide the label until the node is hovered, focused or lit by a trace. */
  quiet?: boolean;
  /** The node the graph is about; starts in the centre and is emphasised. */
  current?: boolean;
  /** Tag name, copied to `data-tag` so callers can find tag nodes. */
  tag?: string;
}

export interface LinkSpec {
  a: string;
  b: string;
  /** Id of the post this thread belongs to; decides its colour and tracing. */
  owner: string;
  /** Rest length in px. */
  len: number;
}

export interface ForceGraphOptions {
  /** Called once per node after it is created (and after the drag guard). */
  onNode?: (el: SVGAElement, spec: NodeSpec) => void;
}

export interface ForceGraph {
  /** Replace the graph's contents and lay it out afresh. */
  setData(nodes: NodeSpec[], links: LinkSpec[]): void;
}

interface SimNode extends NodeSpec {
  x: number;
  y: number;
  vx: number;
  vy: number;
  held: boolean;
  el: SVGAElement;
  adj: SimNode[];
}

interface SimLink {
  a: SimNode;
  b: SimNode;
  owner: SimNode;
  len: number;
  line: SVGLineElement;
}

/** Shorten `text` to `max` characters (counting CJK characters as one). */
export function clip(text: string, max: number): string {
  const chars = [...text];
  return chars.length > max ? chars.slice(0, max).join("") + "…" : text;
}

/** Shorten a post title for use as a node label. */
export function clipTitle(title: string): string {
  return clip(title, /[㐀-鿿]/.test(title) ? 13 : 24);
}

export function createForceGraph(
  container: HTMLElement,
  svg: SVGSVGElement,
  options: ForceGraphOptions = {},
): ForceGraph {
  let nodes: SimNode[] = [];
  let links: SimLink[] = [];
  let pending: { nodes: NodeSpec[]; links: LinkSpec[] } | null = null;
  let W = 0;
  let H = 0;
  let alpha = 0;
  let running = false;
  let focus: SimNode | null = null;
  let dragged = false;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function build(specs: NodeSpec[], linkSpecs: LinkSpec[]) {
    svg.replaceChildren();
    nodes = [];
    links = [];
    focus = null;
    const linkLayer = document.createElementNS(NS, "g");
    const nodeLayer = document.createElementNS(NS, "g");
    svg.append(linkLayer, nodeLayer);

    const byId = new Map<string, SimNode>();
    for (const spec of specs) {
      const el = document.createElementNS(NS, "a");
      el.setAttribute("href", spec.href);
      const classes = ["fg-node", `fg-node--${spec.kind}`];
      if (spec.quiet) classes.push("fg-node--quiet");
      if (spec.current) classes.push("fg-node--current");
      el.setAttribute("class", classes.join(" "));
      if (spec.color) el.style.setProperty("--c", spec.color);
      if (spec.tag) el.dataset.tag = spec.tag;
      if (spec.current) el.setAttribute("aria-current", "page");

      const title = document.createElementNS(NS, "title");
      title.textContent = spec.full;
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("r", String(spec.r));
      const text = document.createElementNS(NS, "text");
      text.setAttribute("y", String(spec.r + 15));
      text.setAttribute("text-anchor", "middle");
      text.textContent = spec.label;
      // Invisible, larger target so small nodes are easy to hit and drag.
      const hit = document.createElementNS(NS, "circle");
      hit.setAttribute("r", String(Math.max(spec.r + 8, 16)));
      hit.setAttribute("class", "fg-hit");
      el.append(title, circle, text, hit);
      nodeLayer.appendChild(el);

      const node: SimNode = {
        ...spec,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        held: false,
        el,
        adj: [],
      };
      nodes.push(node);
      byId.set(spec.id, node);
    }

    for (const spec of linkSpecs) {
      const a = byId.get(spec.a);
      const b = byId.get(spec.b);
      const owner = byId.get(spec.owner);
      if (!a || !b || !owner) continue;
      const line = document.createElementNS(NS, "line");
      if (owner.color) line.style.stroke = owner.color;
      linkLayer.appendChild(line);
      links.push({ a, b, owner, len: spec.len, line });
      a.adj.push(b);
      b.adj.push(a);
    }

    // Deterministic starting positions, so the graph settles the same way on
    // every visit: each node starts beside one it is linked to, and nodes with
    // no placed neighbour spiral out from the centre.
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cx = W / 2;
    const cy = H / 2;
    const placed = new Set<SimNode>();
    let loose = 0;
    const ordered = [...nodes].sort(
      (p, q) => Number(!!q.current) - Number(!!p.current),
    );
    for (const node of ordered) {
      const anchor = node.adj.find((n) => placed.has(n));
      if (node.current) {
        node.x = cx;
        node.y = cy;
      } else if (anchor) {
        const angle = rnd() * Math.PI * 2;
        node.x = anchor.x + Math.cos(angle) * 90;
        node.y = anchor.y + Math.sin(angle) * 70;
      } else {
        const angle = loose * 2.399963 + Math.PI;
        const radius = 70 * Math.sqrt(loose);
        node.x = cx + Math.cos(angle) * radius * 1.5;
        node.y = cy + Math.sin(angle) * radius;
        loose += 1;
      }
      placed.add(node);
    }

    for (const node of nodes) wire(node);
  }

  function wire(node: SimNode) {
    const el = node.el;
    // Drag to rearrange; a drag must not also count as a click.
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      dragged = false;
      const sx = e.clientX;
      const sy = e.clientY;
      const move = (m: PointerEvent) => {
        if (!dragged && Math.hypot(m.clientX - sx, m.clientY - sy) < 5) return;
        dragged = true;
        node.held = true;
        const box = svg.getBoundingClientRect();
        node.x = m.clientX - box.left;
        node.y = m.clientY - box.top;
        node.vx = node.vy = 0;
        alpha = Math.max(alpha, 0.35);
        run();
      };
      const up = () => {
        node.held = false;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    });
    el.addEventListener("click", (e) => {
      if (!dragged) return;
      dragged = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    });
    el.addEventListener("dragstart", (e) => e.preventDefault());

    const enter = () => {
      focus = node;
      paint();
    };
    const leave = () => {
      if (focus === node) focus = null;
      paint();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    // Keyboard focus only: a mouse click must not leave the node lit.
    el.addEventListener("focus", () => {
      if (el.matches(":focus-visible")) enter();
    });
    el.addEventListener("blur", leave);

    options.onNode?.(el, node);
  }

  /** Light up what the focused node connects to; dim the rest. */
  function paint() {
    const node = focus;
    svg.classList.toggle("is-focus", !!node);
    const on = new Set<SimNode>();
    const lit = new Set<SimNode>(); // posts whose threads light up
    if (node) {
      on.add(node);
      const related =
        node.kind === "post" ? [node] : node.adj.filter((n) => n.kind === "post");
      for (const post of related) {
        lit.add(post);
        on.add(post);
        for (const n of post.adj) {
          if (n.kind === "cat" || (n.kind === "tag" && node.kind !== "tag"))
            on.add(n);
        }
      }
    }
    for (const n of nodes) n.el.classList.toggle("is-on", on.has(n));
    for (const l of links) {
      l.line.classList.toggle(
        "is-on",
        lit.has(l.owner) && on.has(l.a) && on.has(l.b),
      );
    }
  }

  function tick() {
    const cx = W / 2;
    const cy = H / 2;
    const padX = Math.min(84, W * 0.12);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = b.x - a.x;
        const dy = b.y - a.y;
        if (!dx && !dy) dx = 0.5;
        const d2 = Math.max(dx * dx + dy * dy, 1);
        const d = Math.sqrt(d2);
        // Repulsion, plus a firm push when labels would overlap.
        let f = (140 * alpha) / d2;
        const min = a.cr + b.cr;
        if (d < min) f += ((min - d) / d) * 0.35;
        a.vx -= dx * f;
        a.vy -= dy * f;
        b.vx += dx * f;
        b.vy += dy * f;
      }
    }
    for (const l of links) {
      const dx = l.b.x - l.a.x;
      const dy = l.b.y - l.a.y;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const f = ((d - l.len) / d) * 0.2 * alpha;
      l.a.vx += dx * f;
      l.a.vy += dy * f;
      l.b.vx -= dx * f;
      l.b.vy -= dy * f;
    }
    for (const n of nodes) {
      if (n.held) continue;
      // The canvas is wider than tall, so pull harder vertically.
      // The current node is held near the middle so the rest arranges round it.
      const pull = n.current ? 6 : 1;
      n.vx += (cx - n.x) * 0.018 * pull * alpha;
      n.vy += (cy - n.y) * 0.05 * pull * alpha;
      n.vx *= 0.78;
      n.vy *= 0.78;
      n.x = Math.min(W - padX, Math.max(padX, n.x + n.vx));
      n.y = Math.min(H - 34, Math.max(26, n.y + n.vy));
    }
    alpha *= 0.985;
  }

  function render() {
    for (const n of nodes) {
      n.el.setAttribute(
        "transform",
        `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`,
      );
    }
    for (const l of links) {
      l.line.setAttribute("x1", l.a.x.toFixed(1));
      l.line.setAttribute("y1", l.a.y.toFixed(1));
      l.line.setAttribute("x2", l.b.x.toFixed(1));
      l.line.setAttribute("y2", l.b.y.toFixed(1));
    }
  }

  function run() {
    if (running || still) {
      if (still) {
        for (let i = 0; i < 60; i++) tick();
        render();
      }
      return;
    }
    running = true;
    const frame = () => {
      if (alpha < 0.02) {
        running = false;
        return;
      }
      tick();
      render();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /** Build pending data once the container is visible; refit on resize. */
  function layout() {
    const width = container.clientWidth;
    if (!width) return; // hidden: try again when the container gets a size
    if (pending) {
      const count = pending.nodes.length;
      W = width;
      H = Math.round(Math.max(320, Math.min(620, 280 + count * 9)));
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.style.height = `${H}px`;
      build(pending.nodes, pending.links);
      pending = null;
      alpha = 1;
      // Settle most of the way before the first paint, so it opens composed.
      for (let i = 0; i < (still ? 420 : 200); i++) tick();
      render();
      run();
    } else if (width !== W && nodes.length) {
      const scale = width / W;
      for (const n of nodes) n.x *= scale;
      W = width;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      alpha = Math.max(alpha, 0.3);
      render();
      run();
    }
  }

  new ResizeObserver(layout).observe(container);

  return {
    setData(nodeSpecs, linkSpecs) {
      pending = { nodes: nodeSpecs, links: linkSpecs };
      layout();
    },
  };
}
