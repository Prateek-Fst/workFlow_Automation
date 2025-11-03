export class WorkflowExecute {
  constructor(workflow) {
    this.workflow = workflow;
    this.nodeExecutionStack = [];
    this.waitingExecution = {};
    this.runExecutionData = {};
  }

  addNodeToBeExecuted(connectionData, outputIndex, parentNodeName, nodeSuccessData, runIndex = 0) {
    const nodeName = connectionData.node;
    
    console.log(`🔄 Adding node ${nodeName} to execution from ${parentNodeName}`);

    // Initialize waiting execution for this node if not exists
    if (!this.waitingExecution[nodeName]) {
      this.waitingExecution[nodeName] = {};
    }
    if (!this.waitingExecution[nodeName][runIndex]) {
      this.waitingExecution[nodeName][runIndex] = { main: [] };
    }

    // Add execution data to waiting
    const inputIndex = connectionData.index || 0;
    if (!this.waitingExecution[nodeName][runIndex].main[inputIndex]) {
      this.waitingExecution[nodeName][runIndex].main[inputIndex] = [];
    }

    // Add the data from parent node
    if (nodeSuccessData && nodeSuccessData[outputIndex]) {
      this.waitingExecution[nodeName][runIndex].main[inputIndex].push(...nodeSuccessData[outputIndex]);
    }

    // Check if all inputs are ready
    const nodeConnections = this.workflow.getConnections(nodeName);
    const numberOfInputs = nodeConnections.inputs.main.length;

    if (numberOfInputs <= 1 || this.allInputsReady(nodeName, runIndex)) {
      // Execute the node
      this.executeNode(nodeName, runIndex);
    }
  }

  allInputsReady(nodeName, runIndex) {
    const nodeConnections = this.workflow.getConnections(nodeName);
    const waitingData = this.waitingExecution[nodeName]?.[runIndex]?.main || [];

    // Check if all required inputs have data
    for (let i = 0; i < nodeConnections.inputs.main.length; i++) {
      if (!waitingData[i] || waitingData[i].length === 0) {
        return false;
      }
    }
    return true;
  }

  executeNode(nodeName, runIndex = 0) {
    console.log(`⚡ Executing node: ${nodeName}`);

    // Get input data
    const inputData = this.waitingExecution[nodeName]?.[runIndex]?.main || [];
    
    // Simulate node execution (in real implementation, this would call the actual node)
    const outputData = this.simulateNodeExecution(nodeName, inputData);

    // Store execution result
    if (!this.runExecutionData[nodeName]) {
      this.runExecutionData[nodeName] = {};
    }
    this.runExecutionData[nodeName][runIndex] = {
      data: { main: outputData }
    };

    // Process downstream nodes
    this.processDownstreamNodes(nodeName, outputData, runIndex);

    // Clear waiting data
    if (this.waitingExecution[nodeName]?.[runIndex]) {
      delete this.waitingExecution[nodeName][runIndex];
    }
  }

  simulateNodeExecution(nodeName, inputData) {
    // Simulate processing - in real implementation, this would execute the actual node logic
    console.log(`📊 Processing ${nodeName} with inputs:`, inputData);
    
    // Return mock output data (multiple outputs possible)
    return [
      [{ json: { processed: true, node: nodeName, timestamp: Date.now() } }]
    ];
  }

  processDownstreamNodes(nodeName, nodeSuccessData, runIndex) {
    const connections = this.workflow.getConnections(nodeName);
    
    if (connections.outputs && connections.outputs.main) {
      connections.outputs.main.forEach((outputConnections, outputIndex) => {
        if (outputConnections && outputConnections.length > 0) {
          outputConnections.forEach(connectionData => {
            this.addNodeToBeExecuted(
              connectionData,
              outputIndex,
              nodeName,
              nodeSuccessData,
              runIndex
            );
          });
        }
      });
    }
  }

  async executeWorkflow(startNodeId) {
    console.log(`🚀 Starting workflow execution from: ${startNodeId}`);
    
    // Initialize execution with start node
    this.executeNode(startNodeId);
    
    return this.runExecutionData;
  }
}