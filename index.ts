// Export types and registry directly
export type { Example, Description } from "./src/nextrap-registry";
export { Nextrap, registerComponent, togglePinPackage, pinnedPackage } from "./src/nextrap-registry";

// Export components
export * from "./src/visualizer/nx-doc-visualizer";
export * from "./src/visualizer/nx-doc-packages-list";
export * from "./src/preview/isolated-preview";
