import { AVLTree } from './avl/AVLTree.js';
import { TreeRenderer } from './view/TreeRenderer.js';

const tree = new AVLTree();
const svg = document.getElementById('treeCanvas');
const renderer = new TreeRenderer(svg);

const input = document.getElementById('valueInput');
const insertBtn = document.getElementById('insertBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Collected animation steps for the most recent rotation
let animationSteps = [];

// History of visual frames (including intermediate rotation
// positions) so the user can step backwards/forwards with
// Previous/Next.
let history = [];
let currentIndex = -1;

// Simple layout function that assigns x/y positions to each logical node.
// The AVL algorithm does not care about these coordinates – they are only
// used by the SVG renderer and rotation animation.
function layoutTree(node, x, y, levelGap = 60) {
  if (!node) return;

  node.x = x;
  node.y = y;

  const leftX = x - levelGap;
  const rightX = x + levelGap;
  const nextY = y + 80;

  if (node.left) {
    layoutTree(node.left, leftX, nextY, levelGap * 0.7);
  }
  if (node.right) {
    layoutTree(node.right, rightX, nextY, levelGap * 0.7);
  }
}

// Animate SVG nodes to visualize AVL rotation based on computed steps
function animateSteps(steps) {
  const DURATION = 400; // 400 ms makes the rotation clearly visible

  steps.forEach(step => {
    step.nodes.forEach(nodeStep => {
      const group = svg.querySelector(`[data-node-id="${nodeStep.id}"]`);
      if (!group) return;

      // Highlight nodes that are part of the rotation
      group.classList.add('rotating');
      setTimeout(() => {
        group.classList.remove('rotating');
      }, DURATION);
    });
  });
}

function cloneNode(node) {
  if (!node) return null;
  return {
    value: node.value,
    height: node.height,
    id: node.id,
    x: node.x,
    y: node.y,
    left: cloneNode(node.left),
    right: cloneNode(node.right)
  };
}

function updateNavButtons() {
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex === -1 || currentIndex >= history.length - 1;
}

// Render a single snapshot from history using the stored
// x/y positions on each node.
function renderSnapshot(snapshot) {
  renderer.reset();
  if (!snapshot) return;
  renderer.drawFromStoredPositions(snapshot);
}

// Build a series of intermediate frames for the latest
// insertion based on animationSteps. Each frame is a full
// cloned tree with node positions interpolated between
// start (before rotation) and end (after rotation).
function buildFramesForLatestInsert() {
  const FRAMES_PER_ROTATION = 5;

  // If there is no root yet, nothing to record
  if (!tree.root) return;

  const finalSnapshot = cloneNode(tree.root);

  // No rotations: just store the final state as a single frame
  if (!animationSteps || animationSteps.length === 0) {
    history.push(finalSnapshot);
    currentIndex = history.length - 1;
    updateNavButtons();
    return;
  }

  // Helper to build an id -> node map for a given tree snapshot
  const buildIdMap = (root) => {
    const map = new Map();
    const stack = [root];
    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      map.set(n.id, n);
      if (n.left) stack.push(n.left);
      if (n.right) stack.push(n.right);
    }
    return map;
  };

  const finalIdMap = buildIdMap(finalSnapshot);

  // For each logical rotation step, prepare movement info
  const moves = animationSteps.map(step => ({
    type: step.type,
    nodes: step.nodes.map(nodeStep => {
      const finalNode = finalIdMap.get(nodeStep.id);
      const endX = finalNode ? finalNode.x : nodeStep.endX;
      const endY = finalNode ? finalNode.y : nodeStep.endY;
      return {
        id: nodeStep.id,
        startX: nodeStep.startX,
        startY: nodeStep.startY,
        endX,
        endY
      };
    })
  }));

  // Generate frames from t=0 (before rotation) to t=1 (after rotation)
  for (let i = 0; i <= FRAMES_PER_ROTATION; i++) {
    const t = i / FRAMES_PER_ROTATION;
    const frameSnapshot = cloneNode(finalSnapshot);
    const frameIdMap = buildIdMap(frameSnapshot);

    moves.forEach(move => {
      move.nodes.forEach(m => {
        const node = frameIdMap.get(m.id);
        if (!node) return;
        node.x = m.startX + (m.endX - m.startX) * t;
        node.y = m.startY + (m.endY - m.startY) * t;
      });
    });

    history.push(frameSnapshot);
  }

  currentIndex = history.length - 1;
  updateNavButtons();
}

insertBtn.addEventListener('click', () => {
  const value = parseInt(input.value);
  if (isNaN(value)) return;

  // Perform logical insertion + possible rotations in the AVL tree
  tree.insert(value);

  // Assign x/y positions to all nodes for the new tree structure
  layoutTree(tree.root, 500, 40);

  // Build animation steps with both start and end positions for each rotated node
  animationSteps = tree.animationSteps.map(step => ({
    type: step.type,
    nodes: step.nodes.map(entry => ({
      id: entry.node.id,
      startX: entry.startX,
      startY: entry.startY,
      endX: entry.node.x,
      endY: entry.node.y
    }))
  }));

  // Redraw lines and move node circles/text. Because we added CSS transitions
  // in TreeRenderer, nodes that change position will glide smoothly.
  renderer.clear();
  renderer.drawNode(tree.root, 500, 40);

  // Visually highlight which nodes participated in the rotation
  animateSteps(animationSteps);

  // Create a sequence of visual frames (including intermediate
  // rotation positions) that the Previous/Next buttons can
  // navigate step-by-step.
  buildFramesForLatestInsert();
});

prevBtn.addEventListener('click', () => {
  if (currentIndex <= 0) return;
  currentIndex--;
  const snapshot = history[currentIndex];
  // Redraw exactly the stored frame (including intermediate
  // rotation positions) without replaying the animation.
  renderSnapshot(snapshot);
  updateNavButtons();
});

nextBtn.addEventListener('click', () => {
  if (currentIndex === -1 || currentIndex >= history.length - 1) return;
  currentIndex++;
  const snapshot = history[currentIndex];
  renderSnapshot(snapshot);
  updateNavButtons();
});

// Initialize navigation button state on load
updateNavButtons();
