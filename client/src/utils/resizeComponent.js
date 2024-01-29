export const resizeComponent = (args) => {
  if (!args.status) return args.fallback;
  return args.lead;
};

export const IconToggle = (props) => {
  if (!props.state) {
    return props.fallback;
  }
  return props.lead;
};
