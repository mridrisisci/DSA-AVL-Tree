export class TreeRenderer {
  constructor(svgElement) {
    this.svg = svgElement;
  }

  clear() {
    this.svg.innerHTML = "";
  }

  drawNode(node, x, y, levelGap = 60) {
    if (!node) return;

    const leftX = x - levelGap;
    const rightX = x + levelGap;
    const nextY = y + 80;

    if (node.left) {
      this.drawLine(x, y, leftX, nextY);
      this.drawNode(node.left, leftX, nextY, levelGap * 0.7);
    }
    if (node.right) {
      this.drawLine(x, y, rightX, nextY);
      this.drawNode(node.right, rightX, nextY, levelGap * 0.7);
    }

    this.drawCircle(x, y, node.value);
  }

  drawCircle(x, y, text) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 20);
    this.svg.appendChild(circle);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x);
    label.setAttribute("y", y);
    label.textContent = text;
    this.svg.appendChild(label);
  }

  drawLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    this.svg.appendChild(line);
  }
}
