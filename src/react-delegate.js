import React from 'react';

export function setupCachedCallback(method, ctx) {
  const cachedMethod = {};
  return function cachedCallback(id) {
    id = id || '';
    if(typeof(id) === 'object') {
      id = JSON.stringify(id);
    }
    if (!cachedMethod[id]) {
      const args = Array.from(arguments);
      cachedMethod[id] = method.bind(ctx, ...args);
    }
    return cachedMethod[id];
  };
}

export function setupDelegate(obj, ...delegateMethods) {
  let globals = [];

  const delegate = obj && (obj.delegate || (obj.props && obj.props.delegate));
  obj.callDelegate = function callDelegate(name, ...rest) {
    if (delegate && typeof delegate[name] === 'function') {
      return delegate[name](...globals.concat(rest));
    }

    return undefined;
  };

  delegateMethods.forEach((funcName) => {
    if(typeof funcName === 'string'){
      obj[funcName] = obj.callDelegate.bind(null, funcName);
      obj[`${funcName}Cached`] = setupCachedCallback(obj[funcName]);
    }
  })

  return {
    setGlobals: (...globalArgs) => {
      globals = globals.concat(globalArgs);
    }
  }
}

export function withDelegate(methods) {
  return (component) => {
    class withDelegate extends React.Component {
      constructor(props) {
        super(props);
        this.methods = { delegate: props.delegate };
        setupDelegate(this.methods, ...methods);
      }
      render() {
        const { delegate, ...otherProps } = this.props;
        const { delegate: d, ...allMethods } = this.methods;

        return React.createElement(component, { ...otherProps, ...allMethods });
      }
    }

    return withDelegate;
  }
}
