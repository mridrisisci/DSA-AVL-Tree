import { AVLNode } from './AVLNode.js';

export class AVLTree {
  constructor() {
    this.root = null;
    this.animationSteps = [];
  }

  cloneTree(node) {
    if (!node) return null;
    const cloned = {
      value: node.value,
      id: node.id,
      height: node.height,
      left: this.cloneTree(node.left),
      right: this.cloneTree(node.right)
    };
    // Preserve marking properties for visualization
    if (node.isSearchCurrent) cloned.isSearchCurrent = true;
    if (node.isSearchFound) cloned.isSearchFound = true;
    if (node.isBeingDeleted) cloned.isBeingDeleted = true;
    return cloned;
  }

  findNodeById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    return this.findNodeById(node.left, id) || this.findNodeById(node.right, id);
  }

  createIntermediateRightRotation(oldRoot) {
    const snapshot = this.cloneTree(this.root);
    const target = this.findNodeById(snapshot, oldRoot.id);
    if (!target || !target.left) return snapshot;

    const leftChild = target.left;
    const rightSubtreeOfLeft = leftChild.right;
    const rightOfOld = target.right;

    const duplicateOld = this.cloneTree(oldRoot);
    duplicateOld.left = rightSubtreeOfLeft;
    duplicateOld.right = rightOfOld;

    leftChild.right = duplicateOld;
    return snapshot;
  }

  createIntermediateLeftRotation(oldRoot) {
    const snapshot = this.cloneTree(this.root);
    const target = this.findNodeById(snapshot, oldRoot.id);
    if (!target || !target.right) return snapshot;

    const rightChild = target.right;
    const leftSubtreeOfRight = rightChild.left;
    const leftOfOld = target.left;

    const duplicateOld = this.cloneTree(oldRoot);
    duplicateOld.left = leftOfOld;
    duplicateOld.right = leftSubtreeOfRight;

    rightChild.left = duplicateOld;
    return snapshot;
  }

  /**
   * Get the height of a node
   * @param {AVLNode} node 
   * @returns {number} Height of the node
   */
  getHeight(node) {
    return node ? node.height : 0;
  }

  /**
   * Update the height of a node based on its children
   * @param {AVLNode} node 
   */
  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  /**
   * Calculate the balance factor of a node
   * Balance Factor = height(left subtree) - height(right subtree)
   * @param {AVLNode} node 
   * @returns {number} Balance factor
   */
  getBalanceFactor(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  /**
   * Right rotation (LL case)
   *       y                               x
   *      / \     Right Rotation          /  \
   *     x   T3   - - - - - - - >        T1   y
   *    / \                                  / \
   *   T1  T2                               T2  T3
   * @param {AVLNode} y 
   * @returns {AVLNode} New root after rotation
   */
  rotateRight(oldRoot) {
    const newRoot = oldRoot.left;
    const rightSubtreeOfNewRoot = newRoot.right;

    // Perform rotation: left child becomes new root of this subtree
    newRoot.right = oldRoot;
    oldRoot.left = rightSubtreeOfNewRoot;

    // Update heights after links change
    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

  /**
   * Left rotation (RR case)
   *     x                                y
   *    / \      Left Rotation           / \
   *   T1  y     - - - - - - - >        x   T3
   *      / \                          / \
   *     T2  T3                       T1  T2
   * @param {AVLNode} x 
   * @returns {AVLNode} New root after rotation
   */
  rotateLeft(oldRoot) {
    const newRoot = oldRoot.right;
    const leftSubtreeOfNewRoot = newRoot.left;

    // Perform rotation: right child becomes new root of this subtree
    newRoot.left = oldRoot;
    oldRoot.right = leftSubtreeOfNewRoot;

    // Update heights after links change
    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

  /**
   * Left-Right rotation (LR case)
   * First left rotation on left child, then right rotation on root
   *       z                               z                           x
   *      / \                            /   \                        /  \
   *     y   T4  Left Rotate (y)        x    T4  Right Rotate(z)    y      z
   *    / \      - - - - - - - - ->    /  \      - - - - - - - ->  / \    / \
   *   T1  x                          y    T3                     T1  T2 T3  T4
   *      / \                        / \
   *     T2  T3                    T1   T2
   * @param {AVLNode} z 
   * @returns {AVLNode} New root after rotation
   */
  rotateLeftRight(z) {
    const before1 = this.cloneTree(this.root);
    z.left = this.rotateLeft(z.left);
    if (this.root === z) this.root = z;
    const after1 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Left Rotation (LR - Step 1)',
      before: before1,
      after: after1
    });

    const before2 = this.cloneTree(this.root);
    const intermediate = this.createIntermediateRightRotation(z);
    this.animationSteps.push({
      label: 'Right Rotation (LR - In Progress)',
      before: before2,
      after: intermediate
    });

    const result = this.rotateRight(z);
    if (this.root === z) this.root = result;
    const after2 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Right Rotation (LR - Complete)',
      before: intermediate,
      after: after2
    });

    return result;
  }

  /**
   * Right-Left rotation (RL case)
   * First right rotation on right child, then left rotation on root
   *     z                            z                            x
   *    / \                          / \                          /  \
   *   T1  y   Right Rotate (y)    T1   x      Left Rotate(z)   z      y
   *      / \  - - - - - - - - ->     /  \   - - - - - - - ->  / \    / \
   *     x   T4                      T2   y                    T1  T2  T3  T4
   *    / \                              /  \
   *   T2  T3                           T3   T4
   * @param {AVLNode} z 
   * @returns {AVLNode} New root after rotation
   */
  rotateRightLeft(z) {
    const before1 = this.cloneTree(this.root);
    z.right = this.rotateRight(z.right);
    if (this.root === z) this.root = z;
    const after1 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Right Rotation (RL - Step 1)',
      before: before1,
      after: after1
    });

    const before2 = this.cloneTree(this.root);
    const intermediate = this.createIntermediateLeftRotation(z);
    this.animationSteps.push({
      label: 'Left Rotation (RL - In Progress)',
      before: before2,
      after: intermediate
    });

    const result = this.rotateLeft(z);
    if (this.root === z) this.root = result;
    const after2 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Left Rotation (RL - Complete)',
      before: intermediate,
      after: after2
    });

    return result;
  }

  /**
   * Balance a node based on its balance factor
   * @param {AVLNode} node 
   * @returns {AVLNode} Balanced node
   */
  balance(node) {
    if (!node) return node;

    this.updateHeight(node);
    const balanceFactor = this.getBalanceFactor(node);

    // Left heavy
    if (balanceFactor > 1) {
      // Left-Right case
      if (this.getBalanceFactor(node.left) < 0) {
        return this.rotateLeftRight(node);
      }
      // Left-Left case - Right Rotation with intermediate step
      const before = this.cloneTree(this.root);
      const intermediate = this.createIntermediateRightRotation(node);
      this.animationSteps.push({
        label: 'Right Rotation - In Progress',
        before,
        after: intermediate
      });

      const result = this.rotateRight(node);
      if (this.root === node) this.root = result;
      const after = this.cloneTree(this.root);
      this.animationSteps.push({
        label: 'Right Rotation - Complete',
        before: intermediate,
        after
      });
      return result;
    }

    // Right heavy
    if (balanceFactor < -1) {
      // Right-Left case
      if (this.getBalanceFactor(node.right) > 0) {
        return this.rotateRightLeft(node);
      }
      // Right-Right case - Left Rotation with intermediate step
      const before = this.cloneTree(this.root);
      const intermediate = this.createIntermediateLeftRotation(node);
      this.animationSteps.push({
        label: 'Left Rotation - In Progress',
        before,
        after: intermediate
      });

      const result = this.rotateLeft(node);
      if (this.root === node) this.root = result;
      const after = this.cloneTree(this.root);
      this.animationSteps.push({
        label: 'Left Rotation - Complete',
        before: intermediate,
        after
      });
      return result;
    }

    return node;
  }

  /**
   * Insert a value into the AVL tree (recursive helper)
   * @param {AVLNode} node 
   * @param {number} value 
   * @returns {AVLNode} Root of the subtree
   */
  insertNode(node, value) {
    // Standard BST insertion
    if (!node) {
      return new AVLNode(value);
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    } else {
      // Duplicate values not allowed
      return node;
    }

    // Balance the node
    return this.balance(node);
  }

  /**
   * Insert a value into the AVL tree
   * @param {number} value 
   */
  insert(value) {
    this.animationSteps = [];
    this.root = this.insertNode(this.root, value);

    // If no rotations occurred, still add a simple step for clarity
    if (this.animationSteps.length === 0) {
      const snapshot = this.cloneTree(this.root);
      this.animationSteps.push({
        label: `Insert: placed ${value}`,
        after: snapshot
      });
    }
  }

  /**
   * Perform in-order traversal (for debugging/verification)
   * @param {AVLNode} node 
   * @param {Array} result 
   * @returns {Array} Sorted values
   */
  inorderTraversal(node = this.root, result = []) {
    if (node) {
      this.inorderTraversal(node.left, result);
      result.push(node.value);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }

  /**
   * Get the minimum value node in a subtree
   * @param {AVLNode} node 
   * @returns {AVLNode} Node with minimum value
   */
  getMinValueNode(node) {
    let current = node;
    while (current && current.left) {
      current = current.left;
    }
    return current;
  }

  /**
   * Get the maximum value node in a subtree
   * @param {AVLNode} node 
   * @returns {AVLNode} Node with maximum value
   */
  getMaxValueNode(node) {
    let current = node;
    while (current && current.right) {
      current = current.right;
    }
    return current;
  }

  /**
   * Search for a value in the tree
   * @param {number} value 
   * @returns {AVLNode|null} Node with the value or null
   */
  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) {
        return current;
      } else if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return null;
  }

  /**
   * Search for a value with step-by-step visualization
   * Creates snapshots for each step of the search
   * @param {number} value
   */
  searchWithSteps(value) {
    this.animationSteps = [];
    let current = this.root;
    let step = 0;

    if (!this.root) {
      this.animationSteps.push({
        label: 'Search: Tree is empty',
        after: null
      });
      return;
    }

    // Initial snapshot at root
    let snapshot = this.cloneTree(this.root);
    let targetNode = this.findNodeById(snapshot, current.id);
    if (targetNode) targetNode.isSearchCurrent = true;
    this.animationSteps.push({
      label: `Search: Start at root (${this.root.value})`,
      after: snapshot
    });

    // Search iteration with snapshots
    step = 1;
    while (current) {
      if (value === current.value) {
        // Found
        snapshot = this.cloneTree(this.root);
        targetNode = this.findNodeById(snapshot, current.id);
        if (targetNode) targetNode.isSearchFound = true;
        this.animationSteps.push({
          label: `Search: Found node with value ${value}`,
          after: snapshot
        });
        return;
      } else if (value < current.value) {
        // Go left
        snapshot = this.cloneTree(this.root);
        targetNode = this.findNodeById(snapshot, current.id);
        if (targetNode) targetNode.isSearchCurrent = true;
        this.animationSteps.push({
          label: `Search: ${value} < ${current.value}, go left`,
          after: snapshot
        });
        current = current.left;
      } else {
        // Go right
        snapshot = this.cloneTree(this.root);
        targetNode = this.findNodeById(snapshot, current.id);
        if (targetNode) targetNode.isSearchCurrent = true;
        this.animationSteps.push({
          label: `Search: ${value} > ${current.value}, go right`,
          after: snapshot
        });
        current = current.right;
      }
      step++;
    }

    // Value not found - reached null
    snapshot = this.cloneTree(this.root);
    this.animationSteps.push({
      label: `Search: Reached null - value ${value} not found`,
      after: snapshot
    });
  }

  /**
   * Delete a node from the AVL tree (recursive helper) with animation steps
   * @param {AVLNode} node 
   * @param {number} value 
   * @returns {AVLNode} Root of the subtree
   */
  deleteNode(node, value) {
    if (!node) return node;

    // Standard BST deletion
    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
    } else {
      // Node to be deleted found - save snapshot
      const beforeDelete = this.cloneTree(this.root);
      const targetInBefore = this.findNodeById(beforeDelete, node.id);
      if (targetInBefore) targetInBefore.isBeingDeleted = true;
      this.animationSteps.push({
        label: `Delete: Found node with value ${value}`,
        after: beforeDelete
      });

      // Case 1: Node with only one child or no child
      if (!node.left) {
        const replacement = node.right;
        const snapshot = this.cloneTree(replacement ? this.root : node.right);
        this.animationSteps.push({
          label: `Delete: Node removed (leaf or one child)`,
          after: this.cloneTreeExcludingValue(this.root, value)
        });
        return replacement;
      } else if (!node.right) {
        const replacement = node.left;
        this.animationSteps.push({
          label: `Delete: Node removed (leaf or one child)`,
          after: this.cloneTreeExcludingValue(this.root, value)
        });
        return replacement;
      }

      // Case 2: Node with two children
      // Get the inorder successor (smallest in the right subtree)
      const minNode = this.getMinValueNode(node.right);
      const successorValue = minNode.value;
      this.animationSteps.push({
        label: `Delete: Two children - using inorder successor (${successorValue})`,
        after: this.cloneTree(this.root)
      });
      node.value = minNode.value;
      node.right = this.deleteNode(node.right, minNode.value);
      return this.balance(node);
    }

    // Balance the node
    return this.balance(node);
  }

  /**
   * Clone tree but exclude a specific value (for deletion visualization)
   * @param {AVLNode} node 
   * @param {number} excludeValue 
   * @returns {object} Cloned tree without the excluded value
   */
  cloneTreeExcludingValue(node, excludeValue) {
    if (!node) return null;
    if (node.value === excludeValue) {
      // Return null to exclude this node
      return null;
    }
    return {
      value: node.value,
      id: node.id,
      height: node.height,
      left: this.cloneTreeExcludingValue(node.left, excludeValue),
      right: this.cloneTreeExcludingValue(node.right, excludeValue)
    };
  }

  /**
   * Delete a value from the AVL tree
   * @param {number} value 
   */
  delete(value) {
    this.animationSteps = [];
    this.root = this.deleteNode(this.root, value);

    // If no rotations occurred (or node not found), still add a simple step for clarity
    if (this.animationSteps.length === 0) {
      const snapshot = this.cloneTree(this.root);
      this.animationSteps.push({
        label: `Delete: processed ${value}`,
        after: snapshot
      });
    }
  }
}
