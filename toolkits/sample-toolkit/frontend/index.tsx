import { getReactRuntime } from "./runtime";

const React = getReactRuntime();

export const SampleToolkitPanel = () => {
  return (
    <section>
      <h1>Sample Diagnostics Toolkit</h1>
      <p>This placeholder panel confirms that front-end mounting works.</p>
    </section>
  );
};

export default SampleToolkitPanel;
