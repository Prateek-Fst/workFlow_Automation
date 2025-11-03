export class DirectedGraph {
  constructor() {
    this.connectionsBySourceNode = {};
    this.connectionsByDestinationNode = {};
    this.nodes = new Map();
  }

  addNode(nodeId, nodeData) {
    this.nodes.set(nodeId, nodeData);
    if (!this.connectionsBySourceNode[nodeId]) {
      this.connectionsBySourceNode[nodeId] = { main: [] };
    }
    if (!this.connectionsByDestinationNode[nodeId]) {
      this.connectionsByDestinationNode[nodeId] = { main: [] };
    }
  }

  addConnection(sourceNode, targetNode, outputIndex = 0, inputIndex = 0) {
    const connection = {
      node: targetNode,
      type: 'main',
      index: inputIndex
    };

    // Ensure output array exists
    if (!this.connectionsBySourceNode[sourceNode].main[outputIndex]) {
      this.connectionsBySourceNode[sourceNode].main[outputIndex] = [];
    }

    // Ensure input array exists
    if (!this.connectionsByDestinationNode[targetNode].main[inputIndex]) {
      this.connectionsByDestinationNode[targetNode].main[inputIndex] = [];
    }

    // Add connections
    this.connectionsBySourceNode[sourceNode].main[outputIndex].push(connection);
    this.connectionsByDestinationNode[targetNode].main[inputIndex].push({
      node: sourceNode,
      type: 'main',
      index: outputIndex
    });
  }

  getConnections(nodeId) {
    return {
      outputs: this.connectionsBySourceNode[nodeId] || { main: [] },
      inputs: this.connectionsByDestinationNode[nodeId] || { main: [] }
    };
  }

  findStartNodes() {
    return Array.from(this.nodes.keys()).filter(nodeId => {
      const inputs = this.connectionsByDestinationNode[nodeId];
      return !inputs || !inputs.main || inputs.main.length === 0;
    });
  }

  getDownstreamNodes(nodeId) {
    const downstream = [];
    const connections = this.connectionsBySourceNode[nodeId];
    
    if (connections && connections.main) {
      connections.main.forEach(outputConnections => {
        if (outputConnections) {
          outputConnections.forEach(connection => {
            downstream.push(connection.node);
          });
        }
      });
    }
    
    return downstream;
  }
}